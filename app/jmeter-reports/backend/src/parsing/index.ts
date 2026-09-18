import { parseCsv } from './csv.ts';
import { parseXml } from './xml.ts';
import { JtlParseError, type JtlFormat, type ParseResult } from './types.ts';

export { JtlParseError };
export type { JtlFormat, ParseResult, Sample } from './types.ts';
export { parseCsv } from './csv.ts';
export { parseXml } from './xml.ts';

/** Sniffs the format of a `.jtl` payload from its first meaningful characters. */
export function detectFormat(content: string): JtlFormat {
  const head = content.slice(0, 4096).trimStart().replace(/^\ufeff/, '');
  if (head.startsWith('<')) {
    return 'xml';
  }
  return 'csv';
}

/** Parses a `.jtl` payload, auto-detecting the CSV or XML flavour. */
export function parseJtl(content: string): ParseResult {
  if (content.trim().length === 0) {
    throw new JtlParseError('The uploaded file is empty.', 'EMPTY_FILE');
  }
  return detectFormat(content) === 'xml' ? parseXml(content) : parseCsv(content);
}
