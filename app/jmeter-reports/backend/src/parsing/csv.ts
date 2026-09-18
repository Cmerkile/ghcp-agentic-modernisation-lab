import { JtlParseError, type ParseResult, type Sample } from './types.ts';

const DELIMITERS = [',', ';', '\t', '|'] as const;

/** JMeter's default column order when `saveservice.print_field_names` is disabled. */
const DEFAULT_FIELD_ORDER = [
  'timeStamp',
  'elapsed',
  'label',
  'responseCode',
  'responseMessage',
  'threadName',
  'dataType',
  'success',
  'failureMessage',
  'bytes',
  'sentBytes',
  'grpThreads',
  'allThreads',
  'URL',
  'Latency',
  'IdleTime',
  'Connect',
];

const HEADER_ALIASES: Record<string, string> = {
  timestamp: 'timeStamp',
  time: 'timeStamp',
  starttime: 'timeStamp',
  elapsed: 'elapsed',
  responsetime: 'elapsed',
  label: 'label',
  sampler: 'label',
  samplerlabel: 'label',
  success: 'success',
  responsecode: 'responseCode',
  bytes: 'bytes',
};

function detectDelimiter(headerLine: string): string {
  let best = ',';
  let bestCount = 0;
  for (const candidate of DELIMITERS) {
    const count = headerLine.split(candidate).length - 1;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

/** Splits a CSV line honouring double-quoted fields with `""` escaping. */
export function splitCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function normaliseHeader(name: string): string {
  return name.trim().replace(/^\ufeff/, '').replace(/[\s_-]/g, '').toLowerCase();
}

function looksLikeHeader(fields: string[]): boolean {
  const first = normaliseHeader(fields[0] ?? '');
  return first === 'timestamp' || first === 'time' || Number.isNaN(Number(fields[0]));
}

function parseTimestamp(raw: string): number {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const value = Number(trimmed);
    // JMeter can be configured to write seconds instead of milliseconds.
    return trimmed.length <= 10 ? value * 1000 : value;
  }
  const parsed = Date.parse(trimmed.replace(' ', 'T'));
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

export function parseBoolean(raw: string | undefined): boolean {
  const value = (raw ?? '').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'ok';
}

/**
 * Parses a CSV `.jtl` file. Supports headered and headerless files, the common
 * delimiters and quoted values. Unknown extra columns are ignored.
 */
export function parseCsv(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    throw new JtlParseError('The CSV file is empty.', 'EMPTY_FILE');
  }

  const delimiter = detectDelimiter(lines[0]!);
  const firstFields = splitCsvLine(lines[0]!, delimiter);
  const hasHeader = looksLikeHeader(firstFields);

  const columns = hasHeader
    ? firstFields.map((name) => HEADER_ALIASES[normaliseHeader(name)] ?? name.trim())
    : DEFAULT_FIELD_ORDER;

  const index = (name: string): number => columns.indexOf(name);
  const iTimestamp = index('timeStamp');
  const iElapsed = index('elapsed');
  const iLabel = index('label');
  const iSuccess = index('success');
  const iCode = index('responseCode');
  const iBytes = index('bytes');

  if (iTimestamp < 0 || iElapsed < 0) {
    throw new JtlParseError(
      'The CSV header does not contain the required "timeStamp" and "elapsed" columns.',
      'MISSING_COLUMNS',
    );
  }

  const samples: Sample[] = [];
  let skipped = 0;

  for (const line of lines.slice(hasHeader ? 1 : 0)) {
    const fields = splitCsvLine(line, delimiter);
    const timestamp = parseTimestamp(fields[iTimestamp] ?? '');
    const elapsed = Number((fields[iElapsed] ?? '').trim());

    if (!Number.isFinite(timestamp) || !Number.isFinite(elapsed) || elapsed < 0) {
      skipped += 1;
      continue;
    }

    samples.push({
      timestamp,
      elapsed,
      label: (fields[iLabel] ?? '').trim() || 'unknown',
      success: iSuccess >= 0 ? parseBoolean(fields[iSuccess]) : true,
      responseCode: (fields[iCode] ?? '').trim(),
      bytes: Number((fields[iBytes] ?? '').trim()) || 0,
    });
  }

  if (samples.length === 0) {
    throw new JtlParseError('No usable sample was found in the CSV file.', 'NO_SAMPLES');
  }

  return { format: 'csv', samples, skipped };
}
