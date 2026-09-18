import { parseCsv } from './csv.js';
import { parseXml } from './xml.js';
import { JtlParseError } from './errors.js';

export { JtlParseError } from './errors.js';
export { parseCsv, splitCsvLine, parseBoolean } from './csv.js';
export { parseXml } from './xml.js';

/** Sniffs the format of a `.jtl` payload from its first meaningful characters. */
export function detectFormat(content) {
  const head = content.slice(0, 4096).trimStart().replace(/^\ufeff/, '');
  return head.startsWith('<') ? 'xml' : 'csv';
}

/** Parses a `.jtl` payload, auto-detecting the CSV or XML flavour. */
export function parseJtl(content) {
  if (content.trim().length === 0) {
    throw new JtlParseError('The uploaded file is empty.', 'EMPTY_FILE');
  }
  return detectFormat(content) === 'xml' ? parseXml(content) : parseCsv(content);
}
