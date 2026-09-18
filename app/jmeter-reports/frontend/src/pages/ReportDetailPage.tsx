import { useEffect, useState } from 'react';
import { getReport, type ReportDetail } from '../api.ts';
import { formatBytes, formatDateTime, formatDuration, formatMs } from '../format.ts';
import MetricCard from '../components/MetricCard.tsx';

export default function ReportDetailPage({ id }: { id: string }) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getReport(id)
      .then((detail) => {
        if (!cancelled) {
          setReport(detail);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('This report could not be loaded.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <section className="page">
        <p className="alert error">{error}</p>
        <a href="#/reports">Back to reports</a>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="page">
        <p>Loading…</p>
      </section>
    );
  }

  const { metrics } = report;

  return (
    <section className="page">
      <a className="back-link" href="#/reports">
        ← Back to reports
      </a>
      <h2>{report.fileName}</h2>
      <p className="page-intro">
        {report.format.toUpperCase()} · {formatBytes(report.fileSize)} · imported{' '}
        {formatDateTime(report.createdAt)}
        {report.skippedRows > 0 && ` · ${report.skippedRows} unreadable rows skipped`}
      </p>

      <div className="metric-grid">
        <MetricCard label="Total requests" value={metrics.totalRequests.toLocaleString()} />
        <MetricCard label="Successful" value={metrics.successCount.toLocaleString()} tone="good" />
        <MetricCard
          label="Failed"
          value={metrics.errorCount.toLocaleString()}
          tone={metrics.errorCount > 0 ? 'bad' : 'good'}
        />
        <MetricCard
          label="Error rate"
          value={`${metrics.errorRate}%`}
          tone={metrics.errorRate > 0 ? 'bad' : 'good'}
        />
        <MetricCard label="Throughput" value={`${metrics.throughputPerSec}/s`} />
        <MetricCard label="Test duration" value={formatDuration(metrics.durationMs)} />
      </div>

      <h3>Response times</h3>
      <div className="metric-grid">
        <MetricCard label="Min" value={formatMs(metrics.minMs)} />
        <MetricCard label="Average" value={formatMs(metrics.avgMs)} />
        <MetricCard label="Median" value={formatMs(metrics.medianMs)} />
        <MetricCard label="P90" value={formatMs(metrics.p90Ms)} />
        <MetricCard label="P95" value={formatMs(metrics.p95Ms)} />
        <MetricCard label="P99" value={formatMs(metrics.p99Ms)} />
        <MetricCard label="Max" value={formatMs(metrics.maxMs)} />
        <MetricCard label="Data received" value={formatBytes(metrics.totalBytes)} />
      </div>

      <h3>Time window</h3>
      <div className="metric-grid">
        <MetricCard label="First sample" value={formatDateTime(metrics.startTime)} />
        <MetricCard label="Last sample end" value={formatDateTime(metrics.endTime)} />
      </div>

      <h3>Per sampler</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Label</th>
            <th className="numeric">Samples</th>
            <th className="numeric">Errors</th>
            <th className="numeric">Error rate</th>
            <th className="numeric">Min</th>
            <th className="numeric">Avg</th>
            <th className="numeric">Median</th>
            <th className="numeric">P90</th>
            <th className="numeric">P95</th>
            <th className="numeric">P99</th>
            <th className="numeric">Max</th>
            <th className="numeric">Throughput</th>
          </tr>
        </thead>
        <tbody>
          {report.labels.map((entry) => (
            <tr key={entry.label}>
              <td>{entry.label}</td>
              <td className="numeric">{entry.totalRequests.toLocaleString()}</td>
              <td className="numeric">{entry.errorCount.toLocaleString()}</td>
              <td className={`numeric ${entry.errorRate > 0 ? 'bad' : 'good'}`}>
                {entry.errorRate}%
              </td>
              <td className="numeric">{formatMs(entry.minMs)}</td>
              <td className="numeric">{formatMs(entry.avgMs)}</td>
              <td className="numeric">{formatMs(entry.medianMs)}</td>
              <td className="numeric">{formatMs(entry.p90Ms)}</td>
              <td className="numeric">{formatMs(entry.p95Ms)}</td>
              <td className="numeric">{formatMs(entry.p99Ms)}</td>
              <td className="numeric">{formatMs(entry.maxMs)}</td>
              <td className="numeric">{entry.throughputPerSec}/s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
