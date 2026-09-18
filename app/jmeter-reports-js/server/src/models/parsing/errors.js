/** Raised for any input the parser refuses: wrong format, corrupt content, no usable sample. */
export class JtlParseError extends Error {
  constructor(message, code = 'INVALID_JTL') {
    super(message);
    this.name = 'JtlParseError';
    this.code = code;
  }
}
