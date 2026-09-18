import { useState } from 'react'
import { formatBytes } from '../services/format.js'
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES } from './validation.js'

/** Drag & drop area for a single `.jtl` file. */
export default function Dropzone({ file, onSelect }) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <label
      className={`dropzone ${dragOver ? 'drag-over' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragOver(false)
        onSelect(event.dataTransfer.files[0])
      }}
    >
      <input
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={(event) => onSelect(event.target.files?.[0])}
      />
      <span className="dropzone-title">
        {file ? file.name : 'Drop a .jtl file here or click to browse'}
      </span>
      <span className="dropzone-hint">
        {file ? formatBytes(file.size) : `CSV or XML, up to ${formatBytes(MAX_UPLOAD_BYTES)}`}
      </span>
    </label>
  )
}
