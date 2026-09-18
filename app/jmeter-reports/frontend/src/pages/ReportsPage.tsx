import { useEffect, useState } from 'react';
import { deleteReport, listReports, type ReportSummary } from '../api.ts';
import { formatBytes, formatDateTime, formatMs } from '../format.ts';

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      setReports(await listReports());
      setError('');
    } catch {
      setError('Unable to load saved reports. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await deleteReport(id);
      setReports((current) => current.filter((report) => report.id !== id));
    } catch {
      setError('Unable to delete this report.');
    }
  };

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
        <table className="data-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Imported</th>
              <th className="numeric">Samples</th>
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
                <td>
                  <a href={`#/reports/${report.id}`}>{report.fileName}</a>
                  <span className="cell-sub">
                    {report.format.toUpperCase()} · {formatBytes(report.fileSize)}
                  </span>
                </td>
                <td>{formatDateTime(report.createdAt)}</td>
                <td className="numeric">{report.metrics.totalRequests.toLocaleString()}</td>
                <td className={`numeric ${report.metrics.errorRate > 0 ? 'bad' : 'good'}`}>
                  {report.metrics.errorRate}%
                </td>
                <td className="numeric">{formatMs(report.metrics.avgMs)}</td>
                <td className="numeric">{formatMs(report.metrics.p95Ms)}</td>
                <td className="numeric">{report.metrics.throughputPerSec}/s</td>
                <td>
                  <button type="button" className="link-button" onClick={() => onDelete(report.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
