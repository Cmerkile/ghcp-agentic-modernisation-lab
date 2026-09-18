import { formatBytes } from '../services/format.js'

export const ALLOWED_EXTENSIONS = ['.jtl', '.csv', '.xml']

/** Mirrors the server's MAX_UPLOAD_MB so the user gets instant feedback. */
export const MAX_UPLOAD_BYTES = 64 * 1024 * 1024

/** Returns an error message, or null when the file can be uploaded. */
export function validateFile(file) {
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
