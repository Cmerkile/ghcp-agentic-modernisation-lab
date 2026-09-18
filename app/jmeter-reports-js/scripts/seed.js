#!/usr/bin/env node
/**
 * Imports .jtl files straight into the SQLite database, so the UI starts with
 * real reports without going through a manual upload.
 *
 * Usage:
 *   node scripts/seed.js                  # imports samples/ and samples/large/
 *   node scripts/seed.js path/to/run.jtl  # imports the given files
 *   node scripts/seed.js --reset          # drops existing reports first
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { config } = await import(resolve(root, 'backend/src/config.js'));
const { parseJtl, JtlParseError } = await import(resolve(root, 'backend/src/parsing/index.js'));
const { computeStatistics, computeTimeline } = await import(resolve(root, 'backend/src/stats.js'));
const { ReportStore } = await import(resolve(root, 'backend/src/store.js'));

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const explicit = args.filter((arg) => !arg.startsWith('--'));

function collectDefaults() {
  const files = [];
  for (const dir of [resolve(root, 'samples'), resolve(root, 'samples/large')]) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = resolve(dir, entry);
      if (statSync(full).isFile() && config.allowedExtensions.includes(extname(entry).toLowerCase())) {
        files.push(full);
      }
    }
  }
  return files;
}

const files = (explicit.length > 0 ? explicit.map((file) => resolve(process.cwd(), file)) : collectDefaults());

if (files.length === 0) {
  console.error('No .jtl file found. Pass paths explicitly or drop files in samples/large/.');
  process.exit(1);
}

const store = new ReportStore(config.databasePath, { maxStoredSamples: config.maxStoredSamples });

if (reset) {
  const existing = store.list();
  for (const report of existing) {
    store.delete(report.id);
  }
  console.log(`Removed ${existing.length} existing report(s).`);
}

let imported = 0;
for (const file of files) {
  const started = Date.now();
  try {
    const fileSize = statSync(file).size;
    if (fileSize > config.maxUploadBytes) {
      console.warn(
        `! ${basename(file)} skipped: ${(fileSize / 1024 / 1024).toFixed(1)} MB exceeds MAX_UPLOAD_MB.`,
      );
      continue;
    }
    const parsed = parseJtl(readFileSync(file, 'utf8'));
    const report = store.create({
      fileName: basename(file),
      fileSize,
      format: parsed.format,
      skippedRows: parsed.skipped,
      statistics: computeStatistics(parsed.samples),
      timeline: computeTimeline(parsed.samples),
      samples: parsed.samples,
    });
    imported += 1;
    console.log(
      `✓ ${report.fileName} — ${parsed.format.toUpperCase()}, ${parsed.samples.length} samples, ` +
        `${report.storedSamples} stored, ${report.metrics.errorRate}% errors (${Date.now() - started} ms)`,
    );
  } catch (error) {
    const reason = error instanceof JtlParseError ? `${error.code}: ${error.message}` : error.message;
    console.error(`✗ ${basename(file)} — ${reason}`);
  }
}

store.close?.();
console.log(`\n${imported}/${files.length} file(s) imported into ${config.databasePath}`);
