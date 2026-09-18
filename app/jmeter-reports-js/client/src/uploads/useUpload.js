import { useState } from 'react'
import { ApiError, uploadReport } from '../services/api.js'
import { validateFile, validateName } from './validation.js'

/**
 * Holds the state of a single upload: selected file, mandatory short name,
 * client-side validation, in-flight flag, server error and resulting report.
 */
export function useUpload() {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const selectFile = (candidate) => {
    setResult(null)
    if (!candidate) {
      return
    }
    const validationError = validateFile(candidate)
    setError(validationError ?? '')
    setFile(validationError ? null : candidate)
  }

  const changeName = (value) => {
    setResult(null)
    setError('')
    setName(value)
  }

  const submit = async () => {
    if (!file) {
      setError('Select a .jtl file first.')
      return
    }
    const nameError = validateName(name)
    if (nameError) {
      setError(nameError)
      return
    }
    setBusy(true)
    setError('')
    try {
      setResult(await uploadReport(file, name.trim()))
      setFile(null)
      setName('')
    } catch (uploadError) {
      setError(
        uploadError instanceof ApiError
          ? uploadError.message
          : 'Upload failed. Is the server running?',
      )
    } finally {
      setBusy(false)
    }
  }

  return { file, name, error, busy, result, selectFile, changeName, submit }
}
