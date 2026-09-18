import { navigate } from '../App.jsx'
import Dropzone from '../uploads/Dropzone.jsx'
import { useUpload } from '../uploads/useUpload.js'
import { MAX_NAME_LENGTH } from '../uploads/validation.js'

export default function UploadPage() {
  const { file, name, error, busy, result, selectFile, changeName, submit } = useUpload()

  const onSubmit = (event) => {
    event.preventDefault()
    submit()
  }

  return (
    <section className="page">
      <h2>Import a JMeter result file</h2>
      <p className="page-intro">
        Upload a <code>.jtl</code> file produced by JMeter (CSV or XML flavour). Give it a short
        name — it replaces the raw file name everywhere in the app. The file is parsed
        server-side, and both its summary and its samples are stored in SQLite so the report
        stays explorable without ever re-uploading the file.
      </p>

      <form onSubmit={onSubmit} className="upload-form">
        <label className="field">
          <span className="field-label">
            Report name <span className="required">*</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => changeName(event.target.value)}
            placeholder="e.g. Checkout load test — Sept 18"
            maxLength={MAX_NAME_LENGTH}
            required
            autoComplete="off"
          />
        </label>

        <Dropzone file={file} onSelect={selectFile} />
        <button type="submit" disabled={!file || !name.trim() || busy}>
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
            <strong>{result.name}</strong> ({result.fileName}) parsed as{' '}
            {result.format.toUpperCase()}: {result.metrics.totalRequests.toLocaleString()} samples,{' '}
            {result.metrics.errorRate}% errors, {result.storedSamples.toLocaleString()} samples
            stored{result.skippedRows > 0 ? `, ${result.skippedRows} unreadable rows skipped` : ''}.
          </p>
          <button type="button" onClick={() => navigate(`/reports/${result.id}`)}>
            Open report
          </button>
        </div>
      )}
    </section>
  )
}
