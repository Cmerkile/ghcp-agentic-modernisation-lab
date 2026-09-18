export function formatMs(value) {
  return `${Math.round(value).toLocaleString()} ms`
}

export function formatDuration(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }
  const totalSeconds = Math.round(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours > 0 ? `${hours}h` : '', minutes > 0 ? `${minutes}m` : '', `${seconds}s`]
    .filter(Boolean)
    .join(' ')
}

export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

export function formatDateTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export function formatTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString()
}

/** Short, human friendly delay such as "3 min ago" or "2 d ago". */
export function formatRelative(value, now = Date.now()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  const seconds = Math.round((now - date.getTime()) / 1000)
  if (seconds < 0) {
    return 'just now'
  }
  const steps = [
    [60, 'sec'],
    [3600, 'min'],
    [86400, 'h'],
    [2592000, 'd'],
  ]
  if (seconds < 45) {
    return 'just now'
  }
  for (let i = 0; i < steps.length; i += 1) {
    const [limit, unit] = steps[i]
    if (seconds < limit) {
      const divisor = i === 0 ? 1 : steps[i - 1][0]
      return `${Math.floor(seconds / divisor)} ${unit} ago`
    }
  }
  return `${Math.floor(seconds / 2592000)} mo ago`
}
