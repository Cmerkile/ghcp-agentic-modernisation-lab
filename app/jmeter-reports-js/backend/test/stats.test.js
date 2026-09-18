import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMetrics, computeStatistics, computeTimeline, median, percentile } from '../src/stats.js';

function sample(overrides = {}) {
  return {
    timestamp: 1700000000000,
    elapsed: 100,
    label: 'Home',
    success: true,
    responseCode: '200',
    bytes: 100,
    ...overrides,
  };
}

test('percentile uses the nearest-rank convention', () => {
  const values = Array.from({ length: 100 }, (_, index) => index + 1);
  assert.equal(percentile(values, 90), 90);
  assert.equal(percentile(values, 95), 95);
  assert.equal(percentile(values, 99), 99);
  assert.equal(percentile(values, 100), 100);
  assert.equal(percentile([], 90), 0);
  assert.equal(percentile([42], 99), 42);
});

test('median interpolates between the two middle values', () => {
  assert.equal(median([1, 2, 3]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), 0);
});

test('computeMetrics aggregates counts, error rate and response times', () => {
  const metrics = computeMetrics([
    sample({ timestamp: 1000, elapsed: 100 }),
    sample({ timestamp: 2000, elapsed: 200, success: false, responseCode: '500' }),
    sample({ timestamp: 3000, elapsed: 300 }),
    sample({ timestamp: 4000, elapsed: 400 }),
  ]);

  assert.equal(metrics.totalRequests, 4);
  assert.equal(metrics.successCount, 3);
  assert.equal(metrics.errorCount, 1);
  assert.equal(metrics.errorRate, 25);
  assert.equal(metrics.minMs, 100);
  assert.equal(metrics.maxMs, 400);
  assert.equal(metrics.avgMs, 250);
  assert.equal(metrics.medianMs, 250);
  assert.equal(metrics.p90Ms, 400);
  assert.equal(metrics.p95Ms, 400);
  assert.equal(metrics.p99Ms, 400);
  assert.equal(metrics.startTime, 1000);
  assert.equal(metrics.endTime, 4400, 'end time is the last sample start plus its elapsed time');
  assert.equal(metrics.durationMs, 3400);
  assert.equal(metrics.throughputPerSec, 1.176);
  assert.equal(metrics.totalBytes, 400);
});

test('computeMetrics handles a single sample without dividing by zero', () => {
  const metrics = computeMetrics([sample({ timestamp: 5000, elapsed: 500 })]);
  assert.equal(metrics.durationMs, 500);
  assert.equal(metrics.throughputPerSec, 2);
  assert.equal(metrics.errorRate, 0);
});

test('computeMetrics rejects an empty sample set', () => {
  assert.throws(() => computeMetrics([]), /without samples/);
});

test('computeStatistics builds a per-label breakdown sorted by volume', () => {
  const stats = computeStatistics([
    sample({ label: 'Search', elapsed: 500, success: false }),
    sample({ label: 'Home', elapsed: 100 }),
    sample({ label: 'Home', elapsed: 200 }),
    sample({ label: 'Home', elapsed: 300 }),
  ]);

  assert.equal(stats.overall.totalRequests, 4);
  assert.equal(stats.overall.errorRate, 25);
  assert.deepEqual(
    stats.labels.map((entry) => entry.label),
    ['Home', 'Search'],
  );
  assert.equal(stats.labels[0].totalRequests, 3);
  assert.equal(stats.labels[0].avgMs, 200);
  assert.equal(stats.labels[1].errorRate, 100);
});

test('computeTimeline groups samples into one-second buckets for a short run', () => {
  const timeline = computeTimeline([
    sample({ timestamp: 1000, elapsed: 100 }),
    sample({ timestamp: 1500, elapsed: 300, success: false }),
    sample({ timestamp: 2200, elapsed: 200 }),
  ]);

  assert.equal(timeline.length, 2);
  assert.equal(timeline[0].bucketMs, 1000);
  assert.equal(timeline[0].count, 2);
  assert.equal(timeline[0].errors, 1);
  assert.equal(timeline[0].avgMs, 200);
  assert.equal(timeline[0].maxMs, 300);
  assert.equal(timeline[1].count, 1);
  assert.equal(timeline[1].bucketStart, 2000);
});

test('computeTimeline widens buckets so a long run stays under the point budget', () => {
  const samples = Array.from({ length: 500 }, (_, index) =>
    sample({ timestamp: 1000 + index * 1000 }),
  );
  const timeline = computeTimeline(samples, 60);

  assert.ok(timeline.length <= 60, `expected at most 60 buckets, got ${timeline.length}`);
  assert.ok(timeline[0].bucketMs > 1000);
  assert.equal(
    timeline.reduce((total, bucket) => total + bucket.count, 0),
    500,
    'every sample must land in exactly one bucket',
  );
});

test('computeTimeline returns nothing for an empty sample set', () => {
  assert.deepEqual(computeTimeline([]), []);
});
