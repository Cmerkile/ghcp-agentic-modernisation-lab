import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const METRIC_COLUMNS = [
  'total_requests',
  'success_count',
  'error_count',
  'error_rate',
  'min_ms',
  'avg_ms',
  'median_ms',
  'max_ms',
  'p90_ms',
  'p95_ms',
  'p99_ms',
  'throughput_per_sec',
  'start_time',
  'end_time',
  'duration_ms',
  'total_bytes',
];

const METRIC_DDL = METRIC_COLUMNS.map((column) => `${column} REAL NOT NULL`).join(',\n    ');

function metricValues(metrics) {
  return [
    metrics.totalRequests,
    metrics.successCount,
    metrics.errorCount,
    metrics.errorRate,
    metrics.minMs,
    metrics.avgMs,
    metrics.medianMs,
    metrics.maxMs,
    metrics.p90Ms,
    metrics.p95Ms,
    metrics.p99Ms,
    metrics.throughputPerSec,
    metrics.startTime,
    metrics.endTime,
    metrics.durationMs,
    metrics.totalBytes,
  ];
}

function rowToMetrics(row) {
  return {
    totalRequests: Number(row.total_requests),
    successCount: Number(row.success_count),
    errorCount: Number(row.error_count),
    errorRate: Number(row.error_rate),
    minMs: Number(row.min_ms),
    avgMs: Number(row.avg_ms),
    medianMs: Number(row.median_ms),
    maxMs: Number(row.max_ms),
    p90Ms: Number(row.p90_ms),
    p95Ms: Number(row.p95_ms),
    p99Ms: Number(row.p99_ms),
    throughputPerSec: Number(row.throughput_per_sec),
    startTime: Number(row.start_time),
    endTime: Number(row.end_time),
    durationMs: Number(row.duration_ms),
    totalBytes: Number(row.total_bytes),
  };
}

function rowToSummary(row) {
  return {
    id: String(row.id),
    fileName: String(row.file_name),
    fileSize: Number(row.file_size),
    format: String(row.format),
    skippedRows: Number(row.skipped_rows),
    storedSamples: Number(row.stored_samples),
    createdAt: String(row.created_at),
    metrics: rowToMetrics(row),
  };
}

/**
 * SQLite repository for uploaded `.jtl` files.
 *
 * Unlike the TypeScript variant, this project also persists the raw samples
 * (capped by `maxStoredSamples`) so a report can be explored — timeline chart,
 * slowest and failed requests — long after the original file is gone.
 */
export class ReportStore {
  #db;
  #maxStoredSamples;

  constructor(filePath, { maxStoredSamples = 200000 } = {}) {
    if (filePath !== ':memory:') {
      mkdirSync(dirname(filePath), { recursive: true });
    }
    this.#db = new DatabaseSync(filePath);
    this.#maxStoredSamples = maxStoredSamples;
    this.#db.exec('PRAGMA journal_mode = WAL');
    this.#db.exec('PRAGMA foreign_keys = ON');
    this.#migrate();
  }

  #migrate() {
    this.#db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        format TEXT NOT NULL,
        skipped_rows INTEGER NOT NULL DEFAULT 0,
        stored_samples INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        ${METRIC_DDL}
      );

      CREATE TABLE IF NOT EXISTS report_labels (
        report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        ${METRIC_DDL},
        PRIMARY KEY (report_id, label)
      );

      CREATE TABLE IF NOT EXISTS report_timeline (
        report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        bucket_start INTEGER NOT NULL,
        bucket_ms INTEGER NOT NULL,
        count INTEGER NOT NULL,
        errors INTEGER NOT NULL,
        avg_ms REAL NOT NULL,
        max_ms REAL NOT NULL,
        throughput_per_sec REAL NOT NULL,
        PRIMARY KEY (report_id, bucket_start)
      );

      CREATE TABLE IF NOT EXISTS report_samples (
        report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        seq INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        elapsed INTEGER NOT NULL,
        label TEXT NOT NULL,
        success INTEGER NOT NULL,
        response_code TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        PRIMARY KEY (report_id, seq)
      );

      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_samples_elapsed ON report_samples(report_id, elapsed DESC);
      CREATE INDEX IF NOT EXISTS idx_samples_success ON report_samples(report_id, success);
    `);
  }

  create({ fileName, fileSize, format, skippedRows, statistics, timeline, samples }) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const stored = samples.slice(0, this.#maxStoredSamples);

    const insertReport = this.#db.prepare(`
      INSERT INTO reports (id, file_name, file_size, format, skipped_rows, stored_samples, created_at, ${METRIC_COLUMNS.join(', ')})
      VALUES (${new Array(7 + METRIC_COLUMNS.length).fill('?').join(', ')})
    `);
    const insertLabel = this.#db.prepare(`
      INSERT INTO report_labels (report_id, label, ${METRIC_COLUMNS.join(', ')})
      VALUES (${new Array(2 + METRIC_COLUMNS.length).fill('?').join(', ')})
    `);
    const insertBucket = this.#db.prepare(`
      INSERT INTO report_timeline (report_id, bucket_start, bucket_ms, count, errors, avg_ms, max_ms, throughput_per_sec)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSample = this.#db.prepare(`
      INSERT INTO report_samples (report_id, seq, timestamp, elapsed, label, success, response_code, bytes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.#db.exec('BEGIN');
    try {
      insertReport.run(
        id,
        fileName,
        fileSize,
        format,
        skippedRows,
        stored.length,
        createdAt,
        ...metricValues(statistics.overall),
      );
      for (const label of statistics.labels) {
        insertLabel.run(id, label.label, ...metricValues(label));
      }
      for (const bucket of timeline) {
        insertBucket.run(
          id,
          bucket.bucketStart,
          bucket.bucketMs,
          bucket.count,
          bucket.errors,
          bucket.avgMs,
          bucket.maxMs,
          bucket.throughputPerSec,
        );
      }
      stored.forEach((sample, seq) => {
        insertSample.run(
          id,
          seq,
          sample.timestamp,
          sample.elapsed,
          sample.label,
          sample.success ? 1 : 0,
          sample.responseCode,
          sample.bytes,
        );
      });
      this.#db.exec('COMMIT');
    } catch (error) {
      this.#db.exec('ROLLBACK');
      throw error;
    }

    return this.get(id);
  }

  list() {
    return this.#db
      .prepare('SELECT * FROM reports ORDER BY created_at DESC')
      .all()
      .map(rowToSummary);
  }

  get(id) {
    const row = this.#db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    if (!row) {
      return undefined;
    }

    const labels = this.#db
      .prepare(
        'SELECT * FROM report_labels WHERE report_id = ? ORDER BY total_requests DESC, label ASC',
      )
      .all(id)
      .map((labelRow) => ({ label: String(labelRow.label), ...rowToMetrics(labelRow) }));

    const timeline = this.#db
      .prepare('SELECT * FROM report_timeline WHERE report_id = ? ORDER BY bucket_start ASC')
      .all(id)
      .map((bucket) => ({
        bucketStart: Number(bucket.bucket_start),
        bucketMs: Number(bucket.bucket_ms),
        count: Number(bucket.count),
        errors: Number(bucket.errors),
        avgMs: Number(bucket.avg_ms),
        maxMs: Number(bucket.max_ms),
        throughputPerSec: Number(bucket.throughput_per_sec),
      }));

    return { ...rowToSummary(row), labels, timeline };
  }

  /** Slowest stored samples, used by the detail page to explain the tail latency. */
  slowestSamples(id, limit = 10) {
    return this.#querySamples(
      'SELECT * FROM report_samples WHERE report_id = ? ORDER BY elapsed DESC, seq ASC LIMIT ?',
      id,
      limit,
    );
  }

  /** Failed stored samples, in chronological order. */
  failedSamples(id, limit = 10) {
    return this.#querySamples(
      'SELECT * FROM report_samples WHERE report_id = ? AND success = 0 ORDER BY seq ASC LIMIT ?',
      id,
      limit,
    );
  }

  #querySamples(sql, id, limit) {
    return this.#db
      .prepare(sql)
      .all(id, limit)
      .map((row) => ({
        timestamp: Number(row.timestamp),
        elapsed: Number(row.elapsed),
        label: String(row.label),
        success: Number(row.success) === 1,
        responseCode: String(row.response_code),
        bytes: Number(row.bytes),
      }));
  }

  delete(id) {
    return Number(this.#db.prepare('DELETE FROM reports WHERE id = ?').run(id).changes) > 0;
  }

  close() {
    this.#db.close();
  }
}
