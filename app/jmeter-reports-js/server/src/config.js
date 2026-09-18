import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

function intFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const config = {
  port: intFromEnv('PORT', 3000),
  maxUploadBytes: intFromEnv('MAX_UPLOAD_MB', 64) * 1024 * 1024,
  /** Upper bound on the raw samples kept in SQLite, to cap database growth. */
  maxStoredSamples: intFromEnv('MAX_STORED_SAMPLES', 200000),
  databasePath: process.env.DATABASE_PATH ?? resolve(here, 'database.db'),
  allowedExtensions: ['.jtl', '.csv', '.xml'],
  /** Bounds for the mandatory short name given to each import. */
  minNameLength: 2,
  maxNameLength: 80,
};
