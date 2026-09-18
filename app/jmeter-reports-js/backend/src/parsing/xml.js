import { JtlParseError } from './errors.js';
import { parseBoolean } from './csv.js';

const SAMPLE_TAG = /<(\/?)(httpSample|sample)(\s[^>]*?)?(\/?)>/g;
const ATTRIBUTE = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

function decodeEntities(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&');
}

function parseAttributes(raw) {
  const attributes = {};
  ATTRIBUTE.lastIndex = 0;
  let match;
  while ((match = ATTRIBUTE.exec(raw)) !== null) {
    attributes[match[1]] = decodeEntities(match[2] ?? match[3] ?? '');
  }
  return attributes;
}

/**
 * Parses an XML `.jtl` file (`testResults` document). Only top-level samples are
 * counted: nested sub-samples would otherwise be tallied twice.
 */
export function parseXml(content) {
  if (!/<testResults\b/i.test(content)) {
    throw new JtlParseError(
      'The XML file does not contain a <testResults> root element.',
      'INVALID_XML',
    );
  }

  const samples = [];
  let skipped = 0;
  let depth = 0;

  SAMPLE_TAG.lastIndex = 0;
  let match;
  while ((match = SAMPLE_TAG.exec(content)) !== null) {
    const isClosing = match[1] === '/';
    const selfClosing = match[4] === '/';

    if (isClosing) {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth === 0) {
      const attributes = parseAttributes(match[3] ?? '');
      const timestamp = Number(attributes.ts);
      const elapsed = Number(attributes.t);

      if (!Number.isFinite(timestamp) || !Number.isFinite(elapsed) || elapsed < 0) {
        skipped += 1;
      } else {
        samples.push({
          timestamp,
          elapsed,
          label: attributes.lb?.trim() || 'unknown',
          success: attributes.s === undefined ? true : parseBoolean(attributes.s),
          responseCode: attributes.rc?.trim() ?? '',
          bytes: Number(attributes.by) || 0,
        });
      }
    }

    if (!selfClosing) {
      depth += 1;
    }
  }

  if (samples.length === 0) {
    throw new JtlParseError('No usable sample was found in the XML file.', 'NO_SAMPLES');
  }

  return { format: 'xml', samples, skipped };
}
