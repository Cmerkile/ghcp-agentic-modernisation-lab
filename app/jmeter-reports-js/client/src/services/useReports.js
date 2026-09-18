import { useCallback, useEffect, useState } from 'react'
import { listReports } from './api.js'

/**
 * Loads the saved reports once and exposes the list plus a refresh helper.
 * Shared by the dashboard and the saved-reports page so both stay in sync
 * with a single request contract.
 */
export function useReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback((signal) => {
    setLoading(true)
    return listReports()
      .then((data) => {
        if (!signal?.aborted) {
          setReports(data)
          setError('')
        }
      })
      .catch(() => {
        if (!signal?.aborted) {
          setError('Unable to load saved reports. Is the API running?')
        }
      })
      .finally(() => {
        if (!signal?.aborted) {
          setLoading(false)
        }
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { reports, setReports, loading, error, setError, reload: () => load() }
}
