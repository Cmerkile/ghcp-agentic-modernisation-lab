import { useMemo } from 'react'
import { deleteReport } from '../services/api.js'
import { useReports } from '../services/useReports.js'
import { formatBytes, formatDateTime, formatMs } from '../services/format.js'

export default function ReportsPage({ search = '' }) {
  const { reports, setReports, loading, error, setError } = useReports()

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return needle
      ? reports.filter(
          (r) => r.name.toLowerCase().includes(needle) || r.fileName.toLowerCase().includes(needle),
        )
      : reports
  }, [reports, search])

  const onDelete = async (id) => {
    try {
      await deleteReport(id)
      setReports((current) => current.filter((report) => report.id !== id))
    } catch {
      setError('Unable to delete this report.')
    }
  }

  return (
    <section className="page">
      {loading && <p>Loading…</p>}
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="empty">
          {reports.length === 0 ? (
            <>
              No report yet. <a href="#/upload">Import a .jtl file</a> to get started.
            </>
          ) : (
            'No report matches your search.'
          )}
        </p>
      )}

      {filtered.length > 0 && (
        <div className="panel table-scroll stackable">
          <table className="data-table stacking">
            <thead>
              <tr>
                <th>Report</th>
                <th>Imported</th>
                <th className="numeric">Samples</th>
                <th className="numeric">Stored</th>
                <th className="numeric">Error rate</th>
                <th className="numeric">Avg</th>
                <th className="numeric">P95</th>
                <th className="numeric">Throughput</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr key={report.id}>
                  <td className="cell-title" data-label="Report">
                    <a href={`#/reports/${report.id}`}>{report.name}</a>
                    <span className="cell-sub">
                      {report.fileName} · {report.format.toUpperCase()} ·{' '}
                      {formatBytes(report.fileSize)}
                    </span>
                  </td>
                  <td data-label="Imported">{formatDateTime(report.createdAt)}</td>
                  <td className="numeric" data-label="Samples">
                    {report.metrics.totalRequests.toLocaleString()}
                  </td>
                  <td className="numeric" data-label="Stored">
                    {report.storedSamples.toLocaleString()}
                  </td>
                  <td
                    className={`numeric ${report.metrics.errorRate > 0 ? 'bad' : 'good'}`}
                    data-label="Error rate"
                  >
                    {report.metrics.errorRate}%
                  </td>
                  <td className="numeric" data-label="Avg">
                    {formatMs(report.metrics.avgMs)}
                  </td>
                  <td className="numeric" data-label="P95">
                    {formatMs(report.metrics.p95Ms)}
                  </td>
                  <td className="numeric" data-label="Throughput">
                    {report.metrics.throughputPerSec}/s
                  </td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onDelete(report.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
