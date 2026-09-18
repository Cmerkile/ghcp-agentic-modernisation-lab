import { useEffect, useState } from 'react'
import { deleteReport, listReports } from '../services/api.js'
import { formatBytes, formatDateTime, formatMs } from '../services/format.js'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listReports()
      .then((data) => {
        if (!cancelled) {
          setReports(data)
          setError('')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load saved reports. Is the backend running?')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

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
      <h2>Saved reports</h2>

      {loading && <p>Loading…</p>}
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && reports.length === 0 && (
        <p className="empty">
          No report yet. <a href="#/upload">Import a .jtl file</a> to get started.
        </p>
      )}

      {reports.length > 0 && (
        <div className="table-scroll stackable">
          <table className="data-table stacking">
            <thead>
              <tr>
                <th>File</th>
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
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="cell-title" data-label="File">
                    <a href={`#/reports/${report.id}`}>{report.fileName}</a>
                    <span className="cell-sub">
                      {report.format.toUpperCase()} · {formatBytes(report.fileSize)}
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
