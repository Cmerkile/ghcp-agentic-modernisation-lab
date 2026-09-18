import { useEffect, useState } from 'react'
import { getReport, getSamples } from '../services/api.js'
import { formatBytes, formatDateTime, formatDuration, formatMs } from '../services/format.js'
import MetricCard from '../components/MetricCard.jsx'
import TimelineChart from '../components/TimelineChart.jsx'
import SampleTable from '../components/SampleTable.jsx'
import DonutChart from '../components/DonutChart.jsx'
import Icon from '../components/Icon.jsx'

export default function ReportDetailPage({ id }) {
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [sampleKind, setSampleKind] = useState('slowest')
  const [samples, setSamples] = useState([])

  useEffect(() => {
    let cancelled = false
    getReport(id)
      .then((detail) => {
        if (!cancelled) {
          setReport(detail)
          setError('')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('This report could not be loaded.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    getSamples(id, { kind: sampleKind, limit: 10 })
      .then((data) => {
        if (!cancelled) {
          setSamples(data.samples)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSamples([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, sampleKind])

  if (error) {
    return (
      <section className="page">
        <p className="alert error">{error}</p>
        <a href="#/reports">Back to reports</a>
      </section>
    )
  }

  if (!report) {
    return (
      <section className="page">
        <p>Loading…</p>
      </section>
    )
  }

  const { metrics } = report

  return (
    <section className="page">
      <a className="back-link" href="#/reports">
        <Icon name="back" size={16} />
        Back to reports
      </a>
      <h2>{report.fileName}</h2>
      <p className="page-intro">
        {report.format.toUpperCase()} · {formatBytes(report.fileSize)} · imported{' '}
        {formatDateTime(report.createdAt)} · {report.storedSamples.toLocaleString()} samples stored
        {report.skippedRows > 0 && ` · ${report.skippedRows} unreadable rows skipped`}
      </p>

      <div className="overview">
        <figure className="panel donut-panel tone-mint">
          <figcaption>
            <h3>Success vs failure</h3>
            <span className="panel-sub">Share of requests across the whole run</span>
          </figcaption>
          <DonutChart success={metrics.successCount} failed={metrics.errorCount} />
        </figure>

        <div className="metric-grid overview-metrics">
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
      </div>

      <h3>Response time over the run</h3>
      <TimelineChart timeline={report.timeline} />

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

      <div className="section-header">
        <h3>Individual samples</h3>
        <div className="toggle-group">
          <button
            type="button"
            className={sampleKind === 'slowest' ? 'toggle active' : 'toggle'}
            onClick={() => setSampleKind('slowest')}
          >
            Slowest
          </button>
          <button
            type="button"
            className={sampleKind === 'failed' ? 'toggle active' : 'toggle'}
            onClick={() => setSampleKind('failed')}
          >
            Failed
          </button>
        </div>
      </div>
      <SampleTable
        samples={samples}
        emptyMessage={
          sampleKind === 'failed' ? 'No failed sample in this run.' : 'No stored sample.'
        }
      />

      <h3>Per sampler</h3>
      <p className="table-hint">Scroll horizontally to see every percentile.</p>
      <div className="table-scroll">
        <table className="data-table sticky-first">
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
                <td className="cell-title">{entry.label}</td>
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
      </div>
    </section>
  )
}
