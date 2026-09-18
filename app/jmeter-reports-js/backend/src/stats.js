function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Nearest-rank percentile over a sorted array (the convention used by JMeter's
 * summary reports): index = ceil(p / 100 * n) - 1.
 */
export function percentile(sortedValues, p) {
  if (sortedValues.length === 0) {
    return 0;
  }
  const rank = Math.ceil((p / 100) * sortedValues.length);
  const index = Math.min(sortedValues.length - 1, Math.max(0, rank - 1));
  return sortedValues[index];
}

/** Median with interpolation between the two middle values for even sizes. */
export function median(sortedValues) {
  if (sortedValues.length === 0) {
    return 0;
  }
  const middle = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 1) {
    return sortedValues[middle];
  }
  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}

export function computeMetrics(samples) {
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
    minMs: elapsed[0],
    avgMs: round(totalElapsed / total),
    medianMs: round(median(elapsed)),
    maxMs: elapsed[elapsed.length - 1],
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
export function computeStatistics(samples) {
  const byLabel = new Map();
  for (const sample of samples) {
    const bucket = byLabel.get(sample.label);
    if (bucket) {
      bucket.push(sample);
    } else {
      byLabel.set(sample.label, [sample]);
    }
  }

  const labels = [...byLabel.entries()]
    .map(([label, labelSamples]) => ({ label, ...computeMetrics(labelSamples) }))
    .sort((a, b) => b.totalRequests - a.totalRequests || a.label.localeCompare(b.label));

  return { overall: computeMetrics(samples), labels };
}

/**
 * Groups samples into fixed time buckets for the response-time timeline.
 * The bucket width adapts to the test duration so a chart never exceeds
 * `maxBuckets` points.
 */
export function computeTimeline(samples, maxBuckets = 60) {
  if (samples.length === 0) {
    return [];
  }

  let start = samples[0].timestamp;
  let end = samples[0].timestamp;
  for (const sample of samples) {
    if (sample.timestamp < start) {
      start = sample.timestamp;
    }
    if (sample.timestamp > end) {
      end = sample.timestamp;
    }
  }
  const span = Math.max(1, end - start + 1);
  const bucketMs = Math.max(1000, Math.ceil(span / maxBuckets));

  const buckets = new Map();
  for (const sample of samples) {
    const bucketStart = start + Math.floor((sample.timestamp - start) / bucketMs) * bucketMs;
    let bucket = buckets.get(bucketStart);
    if (!bucket) {
      bucket = { bucketStart, count: 0, errors: 0, totalElapsed: 0, maxMs: 0 };
      buckets.set(bucketStart, bucket);
    }
    bucket.count += 1;
    bucket.totalElapsed += sample.elapsed;
    bucket.maxMs = Math.max(bucket.maxMs, sample.elapsed);
    if (!sample.success) {
      bucket.errors += 1;
    }
  }

  return [...buckets.values()]
    .sort((a, b) => a.bucketStart - b.bucketStart)
    .map((bucket) => ({
      bucketStart: bucket.bucketStart,
      bucketMs,
      count: bucket.count,
      errors: bucket.errors,
      avgMs: round(bucket.totalElapsed / bucket.count),
      maxMs: bucket.maxMs,
      throughputPerSec: round(bucket.count / (bucketMs / 1000), 3),
    }));
}
