import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { JtlFormat } from './parsing/types.ts';
import type { LabelMetrics, Metrics, ReportStatistics } from './stats.ts';

export interface ReportSummary {
  id: string;
  fileName: string;
  fileSize: number;
  format: JtlFormat;
  skippedRows: number;
  createdAt: string;
  metrics: Metrics;
}

export interface ReportDetail extends ReportSummary {
  labels: LabelMetrics[];
}

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

function metricValues(metrics: Metrics): number[] {
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

type Row = Record<string, string | number | null>;

function rowToMetrics(row: Row): Metrics {
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

function rowToSummary(row: Row): ReportSummary {
  return {
    id: String(row.id),
    fileName: String(row.file_name),
    fileSize: Number(row.file_size),
    format: String(row.format) as JtlFormat,
    skippedRows: Number(row.skipped_rows),
    createdAt: String(row.created_at),
    metrics: rowToMetrics(row),
  };
}

export interface CreateReportInput {
  fileName: string;
  fileSize: number;
  format: JtlFormat;
  skippedRows: number;
  statistics: ReportStatistics;
}

/**
 * Thin SQLite repository. Raw samples are intentionally not persisted: the MVP
 * only needs report metadata plus the derived metrics, which keeps the database
 * small even for multi-million-row `.jtl` files.
 */
export class ReportStore {
  private readonly db: DatabaseSync;

  constructor(filePath: string) {
    if (filePath !== ':memory:') {
      mkdirSync(dirname(filePath), { recursive: true });
    }
    this.db = new DatabaseSync(filePath);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        format TEXT NOT NULL,
        skipped_rows INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        ${METRIC_DDL}
      );

      CREATE TABLE IF NOT EXISTS report_labels (
        report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        ${METRIC_DDL},
        PRIMARY KEY (report_id, label)
      );

      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
    `);
  }

  create(input: CreateReportInput): ReportDetail {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const insertReport = this.db.prepare(`
      INSERT INTO reports (id, file_name, file_size, format, skipped_rows, created_at, ${METRIC_COLUMNS.join(', ')})
      VALUES (${new Array(6 + METRIC_COLUMNS.length).fill('?').join(', ')})
    `);
    const insertLabel = this.db.prepare(`
      INSERT INTO report_labels (report_id, label, ${METRIC_COLUMNS.join(', ')})
      VALUES (${new Array(2 + METRIC_COLUMNS.length).fill('?').join(', ')})
    `);

    this.db.exec('BEGIN');
    try {
      insertReport.run(
        id,
        input.fileName,
        input.fileSize,
        input.format,
        input.skippedRows,
        createdAt,
        ...metricValues(input.statistics.overall),
      );
      for (const label of input.statistics.labels) {
        insertLabel.run(id, label.label, ...metricValues(label));
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return {
      id,
      fileName: input.fileName,
      fileSize: input.fileSize,
      format: input.format,
      skippedRows: input.skippedRows,
      createdAt,
      metrics: input.statistics.overall,
      labels: input.statistics.labels,
    };
  }

  list(): ReportSummary[] {
    const rows = this.db
      .prepare('SELECT * FROM reports ORDER BY created_at DESC')
      .all() as unknown as Row[];
    return rows.map(rowToSummary);
  }

  get(id: string): ReportDetail | undefined {
    const row = this.db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as unknown as
      | Row
      | undefined;
    if (!row) {
      return undefined;
    }
    const labelRows = this.db
      .prepare('SELECT * FROM report_labels WHERE report_id = ? ORDER BY total_requests DESC, label ASC')
      .all(id) as unknown as Row[];

    return {
      ...rowToSummary(row),
      labels: labelRows.map((labelRow) => ({
        label: String(labelRow.label),
        ...rowToMetrics(labelRow),
      })),
    };
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM reports WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  }

  close(): void {
    this.db.close();
  }
}
