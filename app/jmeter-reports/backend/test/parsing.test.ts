import test from 'node:test';
import assert from 'node:assert/strict';
import { detectFormat, JtlParseError, parseCsv, parseJtl, parseXml } from '../src/parsing/index.ts';

const CSV_WITH_HEADER = [
  'timeStamp,elapsed,label,responseCode,responseMessage,threadName,dataType,success,failureMessage,bytes,sentBytes,grpThreads,allThreads,URL,Latency,IdleTime,Connect',
  '1700000000000,120,Home,200,OK,Group 1-1,text,true,,1024,120,1,1,http://x/,100,0,10',
  '1700000000500,300,Search,500,Internal Error,Group 1-2,text,false,Assertion failed,512,120,1,1,http://x/s,250,0,8',
].join('\n');

const CSV_HEADERLESS = [
  '1700000000000,120,Home,200,OK,Group 1-1,text,true,,1024,120,1,1,http://x/,100,0,10',
  '1700000001000,80,Home,200,OK,Group 1-1,text,true,,1024,120,1,1,http://x/,60,0,4',
].join('\n');

const XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<testResults version="1.2">
<httpSample t="120" it="0" lt="100" ct="10" ts="1700000000000" s="true" lb="Home &amp; Landing" rc="200" rm="OK" tn="Group 1-1" dt="text" by="1024" sby="120" ne="0">
  <assertionResult><name>Response code</name><failure>false</failure></assertionResult>
  <httpSample t="40" ts="1700000000010" s="true" lb="Nested redirect" rc="302" by="10"/>
</httpSample>
<httpSample t="300" ts="1700000000500" s="false" lb="Search" rc="500" rm="Internal Error" by="512"/>
</testResults>`;

test('detectFormat recognises XML and CSV payloads', () => {
  assert.equal(detectFormat(XML_SAMPLE), 'xml');
  assert.equal(detectFormat(CSV_WITH_HEADER), 'csv');
  assert.equal(detectFormat('\ufeff<testResults/>'), 'xml');
});

test('parseCsv reads a headered JTL file', () => {
  const result = parseCsv(CSV_WITH_HEADER);
  assert.equal(result.format, 'csv');
  assert.equal(result.samples.length, 2);
  assert.deepEqual(result.samples[0], {
    timestamp: 1700000000000,
    elapsed: 120,
    label: 'Home',
    success: true,
    responseCode: '200',
    bytes: 1024,
  });
  assert.equal(result.samples[1]?.success, false);
});

test('parseCsv falls back to the default JMeter column order without a header', () => {
  const result = parseCsv(CSV_HEADERLESS);
  assert.equal(result.samples.length, 2);
  assert.equal(result.samples[0]?.label, 'Home');
  assert.equal(result.samples[1]?.elapsed, 80);
});

test('parseCsv supports semicolon delimiters and quoted labels', () => {
  const csv = [
    'timeStamp;elapsed;label;responseCode;success',
    '1700000000000;150;"Search; page";200;true',
  ].join('\n');
  const result = parseCsv(csv);
  assert.equal(result.samples[0]?.label, 'Search; page');
  assert.equal(result.samples[0]?.elapsed, 150);
});

test('parseCsv skips malformed rows but keeps valid ones', () => {
  const csv = [
    'timeStamp,elapsed,label,success',
    'not-a-date,abc,Broken,true',
    '1700000000000,100,Ok,true',
  ].join('\n');
  const result = parseCsv(csv);
  assert.equal(result.skipped, 1);
  assert.equal(result.samples.length, 1);
});

test('parseCsv rejects a header without the required columns', () => {
  assert.throws(
    () => parseCsv('foo,bar\n1,2'),
    (error: unknown) => error instanceof JtlParseError && error.code === 'MISSING_COLUMNS',
  );
});

test('parseCsv rejects a file with only unusable rows', () => {
  assert.throws(
    () => parseCsv('timeStamp,elapsed,label\nx,y,z'),
    (error: unknown) => error instanceof JtlParseError && error.code === 'NO_SAMPLES',
  );
});

test('parseXml reads top-level samples only and decodes entities', () => {
  const result = parseXml(XML_SAMPLE);
  assert.equal(result.format, 'xml');
  assert.equal(result.samples.length, 2, 'nested sub-samples must not be counted twice');
  assert.equal(result.samples[0]?.label, 'Home & Landing');
  assert.equal(result.samples[0]?.elapsed, 120);
  assert.equal(result.samples[1]?.success, false);
  assert.equal(result.samples[1]?.responseCode, '500');
});

test('parseXml rejects XML that is not a JMeter result file', () => {
  assert.throws(
    () => parseXml('<?xml version="1.0"?><other><item/></other>'),
    (error: unknown) => error instanceof JtlParseError && error.code === 'INVALID_XML',
  );
});

test('parseJtl dispatches on the detected format and rejects empty input', () => {
  assert.equal(parseJtl(XML_SAMPLE).format, 'xml');
  assert.equal(parseJtl(CSV_WITH_HEADER).format, 'csv');
  assert.throws(
    () => parseJtl('   \n  '),
    (error: unknown) => error instanceof JtlParseError && error.code === 'EMPTY_FILE',
  );
});

test('parseCsv promotes second-based timestamps to milliseconds', () => {
  const result = parseCsv('timeStamp,elapsed,label,success\n1700000000,50,Home,true');
  assert.equal(result.samples[0]?.timestamp, 1700000000000);
});
