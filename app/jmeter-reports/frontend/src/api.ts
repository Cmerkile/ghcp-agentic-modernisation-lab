export interface Metrics {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  errorRate: number;
  minMs: number;
  avgMs: number;
  medianMs: number;
  maxMs: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  throughputPerSec: number;
  startTime: number;
  endTime: number;
  durationMs: number;
  totalBytes: number;
}

export interface LabelMetrics extends Metrics {
  label: string;
}

export interface ReportSummary {
  id: string;
  fileName: string;
  fileSize: number;
  format: 'csv' | 'xml';
  skippedRows: number;
  createdAt: string;
  metrics: Metrics;
}

export interface ReportDetail extends ReportSummary {
  labels: LabelMetrics[];
}

export class ApiError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

async function handle<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }
  let message = `Request failed with status ${response.status}.`;
  let code = 'HTTP_ERROR';
  try {
    const body = await response.json();
    message = body?.error?.message ?? message;
    code = body?.error?.code ?? code;
  } catch {
    // Non-JSON error payload: keep the generic message.
  }
  throw new ApiError(message, code);
}

export async function listReports(): Promise<ReportSummary[]> {
  return handle<ReportSummary[]>(await fetch('/api/reports'));
}

export async function getReport(id: string): Promise<ReportDetail> {
  return handle<ReportDetail>(await fetch(`/api/reports/${id}`));
}

export async function uploadReport(file: File): Promise<ReportDetail> {
  const form = new FormData();
  form.append('file', file);
  return handle<ReportDetail>(await fetch('/api/reports', { method: 'POST', body: form }));
}

export async function deleteReport(id: string): Promise<void> {
  await handle<void>(await fetch(`/api/reports/${id}`, { method: 'DELETE' }));
}
