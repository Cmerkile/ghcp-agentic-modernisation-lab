export function formatMs(value: number): string {
  return `${Math.round(value).toLocaleString()} ms`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours > 0 ? `${hours}h` : '', minutes > 0 ? `${minutes}m` : '', `${seconds}s`]
    .filter(Boolean)
    .join(' ');
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function formatDateTime(epochMs: number | string): string {
  const date = typeof epochMs === 'string' ? new Date(epochMs) : new Date(epochMs);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}
