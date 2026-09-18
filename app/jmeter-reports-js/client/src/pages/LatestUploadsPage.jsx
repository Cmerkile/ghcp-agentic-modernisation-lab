import { useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import { useReports } from '../services/useReports.js'
import { formatBytes, formatMs, formatRelative } from '../services/format.js'

const TONES = ['mint', 'pink', 'yellow', 'lavender']

function aggregate(reports) {
  return reports.reduce(
    (acc, report) => {
      acc.totalRequests += report.metrics.totalRequests
      acc.errorCount += report.metrics.errorCount
      acc.bytes += report.fileSize
      return acc
    },
    { totalRequests: 0, errorCount: 0, bytes: 0 },
  )
}

/** Landing page: the most recent `.jtl` uploads, each linking to its report. */
export default function LatestUploadsPage({ search = '' }) {
  const { reports, loading, error } = useReports()

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return needle
      ? reports.filter(
          (r) => r.name.toLowerCase().includes(needle) || r.fileName.toLowerCase().includes(needle),
        )
      : reports
  }, [reports, search])

  const latest = filtered.slice(0, 6)
  const totals = useMemo(() => aggregate(reports), [reports])
  const globalErrorRate =
    totals.totalRequests === 0
      ? 0
      : Math.round((totals.errorCount / totals.totalRequests) * 10000) / 100

  return (
    <div className="dashboard">
      <section className="dashboard-main">
        <div className="section-header">
          <h2>
            Latest uploads <span className="count">({filtered.length})</span>
          </h2>
          {reports.length > 6 && (
            <a className="ghost-link" href="#/reports">
              See all
            </a>
          )}
        </div>

        {loading && <p className="empty">Loading…</p>}
        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && latest.length === 0 && (
          <p className="empty">
            {reports.length === 0 ? (
              <>
                No file imported yet. <a href="#/upload">Import a .jtl file</a> to get started.
              </>
            ) : (
              'No upload matches your search.'
            )}
          </p>
        )}

        {latest.length > 0 && (
          <ul className="upload-grid">
            {latest.map((report, index) => (
              <li key={report.id} className={`upload-card tone-${TONES[index % TONES.length]}`}>
                <div className="upload-card-top">
                  <span className="badge">
                    {report.format.toUpperCase()} · {formatBytes(report.fileSize)}
                  </span>
                  <span className="upload-card-time">
                    <Icon name="clock" size={14} />
                    {formatRelative(report.createdAt)}
                  </span>
                </div>

                <h3 className="upload-card-title" title={report.name}>
                  {report.name}
                </h3>
                <span className="upload-card-file" title={report.fileName}>
                  {report.fileName}
                </span>

                <dl className="upload-card-stats">
                  <div>
                    <dt>Samples</dt>
                    <dd>{report.metrics.totalRequests.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Errors</dt>
                    <dd className={report.metrics.errorRate > 0 ? 'bad' : 'good'}>
                      {report.metrics.errorRate}%
                    </dd>
                  </div>
                  <div>
                    <dt>P95</dt>
                    <dd>{formatMs(report.metrics.p95Ms)}</dd>
                  </div>
                </dl>

                <a
                  className="round-action"
                  href={`#/reports/${report.id}`}
                  aria-label={`Open the report for ${report.name}`}
                >
                  <Icon name="arrow" size={18} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="dashboard-side">
        <h2>At a glance</h2>

        <div className="panel">
          <ul className="stat-list">
            <li>
              <span>Reports stored</span>
              <strong>{reports.length.toLocaleString()}</strong>
            </li>
            <li>
              <span>Requests analysed</span>
              <strong>{totals.totalRequests.toLocaleString()}</strong>
            </li>
            <li>
              <span>Failed requests</span>
              <strong className={totals.errorCount > 0 ? 'bad' : 'good'}>
                {totals.errorCount.toLocaleString()}
              </strong>
            </li>
            <li>
              <span>Global error rate</span>
              <strong className={globalErrorRate > 0 ? 'bad' : 'good'}>{globalErrorRate}%</strong>
            </li>
            <li>
              <span>Data imported</span>
              <strong>{formatBytes(totals.bytes)}</strong>
            </li>
          </ul>
        </div>

        <a className="cta-card tone-lavender" href="#/upload">
          <span className="round-icon">
            <Icon name="upload" size={18} />
          </span>
          <span>
            <strong>Import a new run</strong>
            <span className="cta-sub">Drop a .jtl file, CSV or XML</span>
          </span>
        </a>

        <h3 className="side-title">Upload history</h3>
        <ul className="timeline-list">
          {filtered.slice(0, 5).map((report) => (
            <li key={report.id}>
              <a href={`#/reports/${report.id}`}>
                <span className="timeline-dot" />
                <span className="timeline-body">
                  <strong>{report.name}</strong>
                  <span className="timeline-meta">
                    {formatRelative(report.createdAt)} ·{' '}
                    {report.metrics.totalRequests.toLocaleString()} samples
                  </span>
                </span>
              </a>
            </li>
          ))}
          {filtered.length === 0 && <li className="empty">Nothing yet.</li>}
        </ul>
      </aside>
    </div>
  )
}
