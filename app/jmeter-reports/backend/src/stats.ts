import type { Sample } from './parsing/types.ts';

export interface Metrics {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  /** Percentage of failed samples, 0-100, rounded to 2 decimals. */
  errorRate: number;
  minMs: number;
  avgMs: number;
  medianMs: number;
  maxMs: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  /** Completed requests per second over the measured window. */
  throughputPerSec: number;
  /** Epoch milliseconds of the first sample start. */
  startTime: number;
  /** Epoch milliseconds of the last sample end (start + elapsed). */
  endTime: number;
  durationMs: number;
  totalBytes: number;
}

export interface LabelMetrics extends Metrics {
  label: string;
}

export interface ReportStatistics {
  overall: Metrics;
  labels: LabelMetrics[];
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Nearest-rank percentile over a sorted array (the convention used by JMeter's
 * summary reports): index = ceil(p / 100 * n) - 1.
 */
export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }
  const rank = Math.ceil((p / 100) * sortedValues.length);
  const index = Math.min(sortedValues.length - 1, Math.max(0, rank - 1));
  return sortedValues[index]!;
}

/** Median with interpolation between the two middle values for even sizes. */
export function median(sortedValues: number[]): number {
  if (sortedValues.length === 0) {
    return 0;
  }
  const middle = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 1) {
    return sortedValues[middle]!;
  }
  return (sortedValues[middle - 1]! + sortedValues[middle]!) / 2;
}

export function computeMetrics(samples: Sample[]): Metrics {
  if (samples.length === 0) {
    throw new Error('Cannot compute metrics without samples.');
  }

  const elapsed = samples.map((sample) => sample.elapsed).sort((a, b) => a - b);

  let successCount = 0;
  let totalElapsed = 0;
  let totalBytes = 0;
  let startTime = Number.POSITIVE_INFINITY;
  let endTime = Number.NEGATIVE_INFINITY;

  for (const sample of samples) {
    if (sample.success) {
      successCount += 1;
    }
    totalElapsed += sample.elapsed;
    totalBytes += sample.bytes;
    startTime = Math.min(startTime, sample.timestamp);
    endTime = Math.max(endTime, sample.timestamp + sample.elapsed);
  }

  const total = samples.length;
  const durationMs = Math.max(0, endTime - startTime);
  // A single instantaneous sample would otherwise divide by zero.
  const durationSec = durationMs > 0 ? durationMs / 1000 : (totalElapsed || 1) / 1000;

  return {
    totalRequests: total,
    successCount,
    errorCount: total - successCount,
    errorRate: round(((total - successCount) / total) * 100),
    minMs: elapsed[0]!,
    avgMs: round(totalElapsed / total),
    medianMs: round(median(elapsed)),
    maxMs: elapsed[elapsed.length - 1]!,
    p90Ms: percentile(elapsed, 90),
    p95Ms: percentile(elapsed, 95),
    p99Ms: percentile(elapsed, 99),
    throughputPerSec: round(total / durationSec, 3),
    startTime,
    endTime,
    durationMs,
    totalBytes,
  };
}

/** Overall metrics plus a per-sampler breakdown sorted by request volume. */
export function computeStatistics(samples: Sample[]): ReportStatistics {
  const byLabel = new Map<string, Sample[]>();
  for (const sample of samples) {
    const bucket = byLabel.get(sample.label);
    if (bucket) {
      bucket.push(sample);
    } else {
      byLabel.set(sample.label, [sample]);
    }
  }

  const labels: LabelMetrics[] = [...byLabel.entries()]
    .map(([label, labelSamples]) => ({ label, ...computeMetrics(labelSamples) }))
    .sort((a, b) => b.totalRequests - a.totalRequests || a.label.localeCompare(b.label));

  return { overall: computeMetrics(samples), labels };
}
