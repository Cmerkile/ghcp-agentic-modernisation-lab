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

export const MIN_NAME_LENGTH = 2
export const MAX_NAME_LENGTH = 80

/** Returns an error message, or null when the short name can be submitted. */
export function validateName(name) {
  const trimmed = (name ?? '').trim()
  if (!trimmed) {
    return 'Give this report a short name.'
  }
  if (trimmed.length < MIN_NAME_LENGTH) {
    return `The name must be at least ${MIN_NAME_LENGTH} characters long.`
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `The name must be at most ${MAX_NAME_LENGTH} characters long.`
  }
  return null
}
