import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { METRIC_COLUMNS } from './schema.js';

const METRIC_DDL = METRIC_COLUMNS.map((column) => `${column} REAL NOT NULL`).join(',\n        ');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
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
`;

/**
 * Opens the SQLite database, creating its directory and schema if needed.
 * Pass `:memory:` for an ephemeral database (used by the test suite).
 */
export function connect(filePath) {
  if (filePath !== ':memory:') {
    mkdirSync(dirname(filePath), { recursive: true });
  }
  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

/**
 * Applies schema changes that `CREATE TABLE IF NOT EXISTS` cannot express,
 * so a database created before the `name` column existed keeps working.
 */
function migrate(db) {
  const columns = db.prepare("PRAGMA table_info(reports)").all().map((column) => column.name);
  if (!columns.includes('name')) {
    db.exec("ALTER TABLE reports ADD COLUMN name TEXT NOT NULL DEFAULT ''");
    db.exec("UPDATE reports SET name = file_name WHERE name = ''");
  }
}
