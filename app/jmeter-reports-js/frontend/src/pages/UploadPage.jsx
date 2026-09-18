import { useState } from 'react'
import { ApiError, uploadReport } from '../api.js'
import { formatBytes } from '../format.js'
import { navigate } from '../App.jsx'

const ALLOWED_EXTENSIONS = ['.jtl', '.csv', '.xml']
const MAX_UPLOAD_BYTES = 64 * 1024 * 1024

function validate(file) {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `Unsupported file "${file.name}". Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}.`
  }
  if (file.size === 0) {
    return 'The selected file is empty.'
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `The file is ${formatBytes(file.size)}, above the ${formatBytes(MAX_UPLOAD_BYTES)} limit.`
  }
  return null
}

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const selectFile = (candidate) => {
    setResult(null)
    if (!candidate) {
      return
    }
    const validationError = validate(candidate)
    setError(validationError ?? '')
    setFile(validationError ? null : candidate)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    selectFile(event.dataTransfer.files[0])
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!file) {
      setError('Select a .jtl file first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const report = await uploadReport(file)
      setResult(report)
      setFile(null)
    } catch (uploadError) {
      setError(
        uploadError instanceof ApiError
          ? uploadError.message
          : 'Upload failed. Is the backend running?',
      )
    } finally {
      setBusy(false)
    }
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
        <label
          className={`dropzone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            type="file"
            accept=".jtl,.csv,.xml"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          <span className="dropzone-title">
            {file ? file.name : 'Drop a .jtl file here or click to browse'}
          </span>
          <span className="dropzone-hint">
            {file ? formatBytes(file.size) : `CSV or XML, up to ${formatBytes(MAX_UPLOAD_BYTES)}`}
          </span>
        </label>

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
