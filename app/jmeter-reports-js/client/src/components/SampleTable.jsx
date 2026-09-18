import { formatBytes, formatDateTime, formatMs } from '../services/format.js'

export default function SampleTable({ samples, emptyMessage }) {
  if (!samples || samples.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }

  return (
    <div className="table-scroll stackable">
      <table className="data-table stacking">
        <thead>
          <tr>
            <th>Time</th>
            <th>Label</th>
            <th className="numeric">Elapsed</th>
            <th>Code</th>
            <th>Status</th>
            <th className="numeric">Bytes</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample, index) => (
            <tr key={`${sample.timestamp}-${index}`}>
              <td data-label="Time">{formatDateTime(sample.timestamp)}</td>
              <td className="cell-title" data-label="Label">
                {sample.label}
              </td>
              <td className="numeric" data-label="Elapsed">
                {formatMs(sample.elapsed)}
              </td>
              <td data-label="Code">{sample.responseCode || '—'}</td>
              <td className={sample.success ? 'good' : 'bad'} data-label="Status">
                {sample.success ? 'OK' : 'KO'}
              </td>
              <td className="numeric" data-label="Bytes">
                {formatBytes(sample.bytes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
