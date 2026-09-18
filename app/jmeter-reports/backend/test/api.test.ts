import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app.ts';
import { ReportStore } from '../src/store.ts';

const CSV = [
  'timeStamp,elapsed,label,responseCode,success,bytes',
  '1700000000000,100,Home,200,true,1024',
  '1700000000500,300,Search,500,false,512',
].join('\n');

async function withServer(run: (baseUrl: string, store: ReportStore) => Promise<void>) {
  const store = new ReportStore(':memory:');
  const server = createApp(store).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`, store);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  }
}

function formData(content: string, fileName: string): FormData {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/csv' }), fileName);
  return form;
}

test('uploading a CSV jtl creates a persisted report that can be read back', async () => {
  await withServer(async (baseUrl) => {
    const upload = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      body: formData(CSV, 'run.jtl'),
    });
    assert.equal(upload.status, 201);
    const created = await upload.json();
    assert.equal(created.fileName, 'run.jtl');
    assert.equal(created.format, 'csv');
    assert.equal(created.metrics.totalRequests, 2);
    assert.equal(created.metrics.errorRate, 50);
    assert.equal(created.labels.length, 2);

    const list = await (await fetch(`${baseUrl}/api/reports`)).json();
    assert.equal(list.length, 1);
    assert.equal(list[0].id, created.id);

    const detail = await (await fetch(`${baseUrl}/api/reports/${created.id}`)).json();
    assert.equal(detail.metrics.maxMs, 300);
    assert.equal(detail.labels[0].label, 'Home');
  });
});

test('rejects an unsupported extension', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      body: formData(CSV, 'run.txt'),
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, 'UNSUPPORTED_EXTENSION');
  });
});

test('rejects a file that cannot be parsed as JMeter output', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      body: formData('hello,world\n1,2', 'run.jtl'),
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, 'MISSING_COLUMNS');
  });
});

test('rejects a request without a file', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      body: new FormData(),
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'NO_FILE');
  });
});

test('returns 404 for unknown reports and deletes existing ones', async () => {
  await withServer(async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/reports/does-not-exist`);
    assert.equal(missing.status, 404);

    const created = await (
      await fetch(`${baseUrl}/api/reports`, { method: 'POST', body: formData(CSV, 'run.jtl') })
    ).json();

    const deleted = await fetch(`${baseUrl}/api/reports/${created.id}`, { method: 'DELETE' });
    assert.equal(deleted.status, 204);
    assert.equal((await fetch(`${baseUrl}/api/reports/${created.id}`)).status, 404);
  });
});
