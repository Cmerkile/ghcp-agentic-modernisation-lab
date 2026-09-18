/** Normalised representation of a single JMeter sample, whatever the source format. */
export interface Sample {
  /** Sample start time, epoch milliseconds. */
  timestamp: number;
  /** Response time in milliseconds. */
  elapsed: number;
  label: string;
  success: boolean;
  responseCode: string;
  bytes: number;
}

export type JtlFormat = 'csv' | 'xml';

export interface ParseResult {
  format: JtlFormat;
  samples: Sample[];
  /** Lines/elements that were skipped because they could not be interpreted. */
  skipped: number;
}

/** Raised for any input the parser refuses: wrong format, corrupt content, no usable sample. */
export class JtlParseError extends Error {
  readonly code: string;

  constructor(message: string, code = 'INVALID_JTL') {
    super(message);
    this.name = 'JtlParseError';
    this.code = code;
  }
}
