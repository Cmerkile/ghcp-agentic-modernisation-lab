import { randomUUID } from 'node:crypto';
import { connect } from '../db/index.js';
import { METRIC_COLUMNS, metricValues, rowToMetrics, rowToSummary } from '../db/schema.js';

/**
 * Data-access layer for uploaded `.jtl` files.
 *
 * Unlike the TypeScript variant, this project also persists the raw samples
 * (capped by `maxStoredSamples`) so a report can be explored — timeline chart,
 * slowest and failed requests — long after the original file is gone.
 */
export class ReportModel {
  #db;
  #maxStoredSamples;

  constructor(filePath, { maxStoredSamples = 200000 } = {}) {
    this.#db = connect(filePath);
    this.#maxStoredSamples = maxStoredSamples;
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
