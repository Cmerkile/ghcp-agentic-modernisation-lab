export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

async function handle(response) {
  if (response.ok) {
    return response.status === 204 ? undefined : response.json()
  }
  let message = `Request failed with status ${response.status}.`
  let code = 'HTTP_ERROR'
  try {
    const body = await response.json()
    message = body?.error?.message ?? message
    code = body?.error?.code ?? code
  } catch {
    // Non-JSON error payload: keep the generic message.
  }
  throw new ApiError(message, code)
}

export async function listReports() {
  return handle(await fetch('/api/reports'))
}

export async function getReport(id) {
  return handle(await fetch(`/api/reports/${id}`))
}

export async function getSamples(id, { kind = 'slowest', limit = 10 } = {}) {
  return handle(await fetch(`/api/reports/${id}/samples?kind=${kind}&limit=${limit}`))
}

export async function uploadReport(file, name) {
  const form = new FormData()
  form.append('file', file)
  form.append('name', name)
  return handle(await fetch('/api/reports', { method: 'POST', body: form }))
}

export async function deleteReport(id) {
  return handle(await fetch(`/api/reports/${id}`, { method: 'DELETE' }))
}
