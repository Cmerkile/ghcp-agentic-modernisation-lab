import { navigate } from '../App.jsx'
import Dropzone from '../uploads/Dropzone.jsx'
import { useUpload } from '../uploads/useUpload.js'

export default function UploadPage() {
  const { file, error, busy, result, selectFile, submit } = useUpload()

  const onSubmit = (event) => {
    event.preventDefault()
    submit()
  }

  return (
    <section className="page">
      <h2>Import a JMeter result file</h2>
      <p className="page-intro">
        Upload a <code>.jtl</code> file produced by JMeter (CSV or XML flavour). The file is parsed
        server-side, and both its summary and its samples are stored in SQLite so the report stays
        explorable without ever re-uploading the file.
      </p>

      <form onSubmit={onSubmit} className="upload-form">
        <Dropzone file={file} onSelect={selectFile} />
        <button type="submit" disabled={!file || busy}>
          {busy ? 'Analysing…' : 'Analyse and save'}
        </button>
      </form>

      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="alert success">
          <p>
            <strong>{result.fileName}</strong> parsed as {result.format.toUpperCase()}:{' '}
            {result.metrics.totalRequests.toLocaleString()} samples, {result.metrics.errorRate}%
            errors, {result.storedSamples.toLocaleString()} samples stored
            {result.skippedRows > 0 ? `, ${result.skippedRows} unreadable rows skipped` : ''}.
          </p>
          <button type="button" onClick={() => navigate(`/reports/${result.id}`)}>
            Open report
          </button>
        </div>
      )}
    </section>
  )
}
