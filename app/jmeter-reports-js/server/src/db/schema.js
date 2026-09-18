/** Metric columns shared by the `reports` and `report_labels` tables. */
export const METRIC_COLUMNS = [
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

/** Metric object -> column values, in `METRIC_COLUMNS` order. */
export function metricValues(metrics) {
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

/** Database row -> metric object exposed by the API. */
export function rowToMetrics(row) {
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

/** Database row -> report summary exposed by the API. */
export function rowToSummary(row) {
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
