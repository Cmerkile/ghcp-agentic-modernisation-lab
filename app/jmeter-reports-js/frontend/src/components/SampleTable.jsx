import { formatBytes, formatDateTime, formatMs } from '../format.js'

export default function SampleTable({ samples, emptyMessage }) {
  if (!samples || samples.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }

  return (
    <table className="data-table">
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
            <td>{formatDateTime(sample.timestamp)}</td>
            <td>{sample.label}</td>
            <td className="numeric">{formatMs(sample.elapsed)}</td>
            <td>{sample.responseCode || '—'}</td>
            <td className={sample.success ? 'good' : 'bad'}>{sample.success ? 'OK' : 'KO'}</td>
            <td className="numeric">{formatBytes(sample.bytes)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
