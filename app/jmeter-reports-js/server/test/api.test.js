import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../index.js';
import { ReportModel } from '../src/models/report.model.js';

const CSV = [
  'timeStamp,elapsed,label,responseCode,success,bytes',
  '1700000000000,100,Home,200,true,1024',
  '1700000000500,300,Search,500,false,512',
  '1700000001200,900,Checkout,200,true,2048',
].join('\n');

async function withServer(run, storeOptions = {}) {
  const store = new ReportModel(':memory:', storeOptions);
  const server = createApp(store).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`, store);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  }
}

function formData(content, fileName) {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/csv' }), fileName);
  return form;
}

function upload(baseUrl, content = CSV, fileName = 'run.jtl') {
  return fetch(`${baseUrl}/api/reports`, { method: 'POST', body: formData(content, fileName) });
}

test('uploading a CSV jtl creates a persisted report that can be read back', async () => {
  await withServer(async (baseUrl) => {
    const response = await upload(baseUrl);
    assert.equal(response.status, 201);
    const created = await response.json();

    assert.equal(created.fileName, 'run.jtl');
    assert.equal(created.format, 'csv');
    assert.equal(created.metrics.totalRequests, 3);
    assert.equal(created.metrics.errorRate, 33.33);
    assert.equal(created.labels.length, 3);
    assert.equal(created.storedSamples, 3);
    assert.ok(created.timeline.length > 0);

    const list = await (await fetch(`${baseUrl}/api/reports`)).json();
    assert.equal(list.length, 1);
    assert.equal(list[0].id, created.id);

    const detail = await (await fetch(`${baseUrl}/api/reports/${created.id}`)).json();
    assert.equal(detail.metrics.maxMs, 900);
    assert.equal(detail.labels[0].label, 'Checkout');
  });
});

test('stored samples survive and power the slowest and failed views', async () => {
  await withServer(async (baseUrl) => {
    const created = await (await upload(baseUrl)).json();

    const slowest = await (
      await fetch(`${baseUrl}/api/reports/${created.id}/samples?limit=2`)
    ).json();
    assert.equal(slowest.kind, 'slowest');
    assert.equal(slowest.samples.length, 2);
    assert.equal(slowest.samples[0].elapsed, 900);
    assert.equal(slowest.samples[0].label, 'Checkout');

    const failed = await (
      await fetch(`${baseUrl}/api/reports/${created.id}/samples?kind=failed`)
    ).json();
    assert.equal(failed.kind, 'failed');
    assert.equal(failed.samples.length, 1);
    assert.equal(failed.samples[0].responseCode, '500');
    assert.equal(failed.samples[0].success, false);
  });
});

test('sample storage honours the configured cap', async () => {
  await withServer(
    async (baseUrl) => {
      const created = await (await upload(baseUrl)).json();
      assert.equal(created.storedSamples, 2, 'only the first 2 samples must be stored');
      assert.equal(created.metrics.totalRequests, 3, 'metrics still cover every sample');

      const slowest = await (
        await fetch(`${baseUrl}/api/reports/${created.id}/samples?limit=50`)
      ).json();
      assert.equal(slowest.samples.length, 2);
    },
    { maxStoredSamples: 2 },
  );
});

test('rejects an unsupported extension', async () => {
  await withServer(async (baseUrl) => {
    const response = await upload(baseUrl, CSV, 'run.txt');
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'UNSUPPORTED_EXTENSION');
  });
});

test('rejects a file that cannot be parsed as JMeter output', async () => {
  await withServer(async (baseUrl) => {
    const response = await upload(baseUrl, 'hello,world\n1,2', 'run.jtl');
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'MISSING_COLUMNS');
  });
});

test('rejects a request without a file', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/reports`, { method: 'POST', body: new FormData() });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'NO_FILE');
  });
});

test('returns 404 for unknown reports and cascades deletes to samples', async () => {
  await withServer(async (baseUrl, store) => {
    assert.equal((await fetch(`${baseUrl}/api/reports/does-not-exist`)).status, 404);
    assert.equal((await fetch(`${baseUrl}/api/reports/does-not-exist/samples`)).status, 404);

    const created = await (await upload(baseUrl)).json();
    const deleted = await fetch(`${baseUrl}/api/reports/${created.id}`, { method: 'DELETE' });
    assert.equal(deleted.status, 204);

    assert.equal((await fetch(`${baseUrl}/api/reports/${created.id}`)).status, 404);
    assert.deepEqual(store.slowestSamples(created.id), [], 'samples must be removed with the report');
  });
});
