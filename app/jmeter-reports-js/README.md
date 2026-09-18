# JMeter Reports (JavaScript)

Single-user web application to import JMeter result files (`.jtl`), compute a performance
summary and **store the uploaded data in SQLite** so a run stays fully explorable — timeline
chart, slowest and failed requests — long after the original file is gone.

Stack: **React (JavaScript) + Express + SQLite**.

```
app/jmeter-reports-js
├── backend/     Express REST API (JavaScript ESM, SQLite)
├── frontend/    React + JSX UI (Vite)
└── samples/     Example .jtl files (CSV and XML flavours)
```

> A TypeScript variant of this app lives in `app/jmeter-reports`. It stores only metadata and
> metrics; this JavaScript version additionally persists the samples themselves, which is what
> powers the timeline chart and the per-sample views. Both can run side by side (different
> ports and databases).

## Requirements

- **Node.js >= 22.6** — the backend uses the built-in `node:sqlite` module, so there is no
  native module to compile and no ORM.
- npm 10+

## Getting started

```bash
# 1. Backend (http://localhost:3002)
cd app/jmeter-reports-js/backend
npm install
npm start          # npm run dev for watch mode

# 2. Frontend (http://localhost:5175, proxies /api to the backend)
cd app/jmeter-reports-js/frontend
npm install
npm run dev
```

Open http://localhost:5175 and import `samples/sample-results.jtl` (CSV) or
`samples/sample-results-xml.jtl` (XML).

### Configuration (backend environment variables)

| Variable             | Default                   | Description                                    |
| -------------------- | ------------------------- | ---------------------------------------------- |
| `PORT`               | `3002`                    | HTTP port of the API                           |
| `MAX_UPLOAD_MB`      | `64`                      | Maximum accepted upload size                   |
| `MAX_STORED_SAMPLES` | `200000`                  | Cap on raw samples persisted per report        |
| `DATABASE_PATH`      | `backend/data/reports.db` | SQLite database file (auto-created)            |

## Using the app

1. **Import .jtl** — drag & drop or browse for a `.jtl`/`.csv`/`.xml` file. The format is
   auto-detected, the file is parsed server-side, then the summary, the timeline and the
   samples are saved.
2. **Saved reports** — every imported run with its key figures and how many samples were
   stored; open one, or delete it (samples and timeline are cascade-deleted).
3. **Report detail** — full summary, response-time timeline chart, slowest / failed sample
   tables and a per-sampler breakdown.

### Computed metrics

Total requests, successes, failures, error rate (%), min / average / median / max response
time, P90 / P95 / P99, throughput (requests per second), start and end timestamps, test
duration and received bytes — overall and per sampler label.

- Percentiles use the **nearest-rank** convention (`index = ceil(p/100 × n) - 1`), like the
  JMeter summary report.
- `endTime` is the *end* of the last sample (`timestamp + elapsed`), and throughput is
  `totalRequests / (endTime - startTime)`.
- The timeline groups samples into buckets of at least one second, widened automatically so a
  long run never produces more than 60 points.

## Supported input formats

| Flavour | Details |
| ------- | ------- |
| CSV     | With or without a header row. Delimiters `,` `;` tab `\|`, quoted fields, JMeter default column order when headerless, second- or millisecond-based timestamps. Extra columns are ignored. |
| XML     | `<testResults>` documents with `<httpSample>` / `<sample>` elements. Nested sub-samples are **not** counted twice. XML entities in labels are decoded. |

Unreadable rows are skipped and reported as `skippedRows`; a file with no usable sample is
rejected.

### Validation and errors

| HTTP | Code                    | Cause                                       |
| ---- | ----------------------- | ------------------------------------------- |
| 400  | `NO_FILE`               | No `file` field in the multipart request    |
| 400  | `UNSUPPORTED_EXTENSION` | Extension other than `.jtl`, `.csv`, `.xml` |
| 400  | `EMPTY_FILE`            | Empty file                                  |
| 400  | `MISSING_COLUMNS`       | CSV header without `timeStamp` / `elapsed`  |
| 400  | `INVALID_XML`           | XML without a `<testResults>` root          |
| 400  | `NO_SAMPLES`            | No interpretable sample in the file         |
| 404  | `NOT_FOUND`             | Unknown report id                           |
| 413  | `FILE_TOO_LARGE`        | Upload above `MAX_UPLOAD_MB`                |

## REST API

| Method | Path                       | Description                                             |
| ------ | -------------------------- | ------------------------------------------------------- |
| GET    | `/api/health`              | Liveness probe, upload limit and sample cap             |
| POST   | `/api/reports`             | Multipart upload (`file`), returns the saved report     |
| GET    | `/api/reports`             | List of saved reports (newest first)                    |
| GET    | `/api/reports/:id`         | Report detail: metrics, per-label breakdown, timeline   |
| GET    | `/api/reports/:id/samples` | Stored samples — `?kind=slowest\|failed&limit=1..200`   |
| DELETE | `/api/reports/:id`         | Deletes a report and all its stored data                |

```bash
curl -F "file=@samples/sample-results.jtl" http://localhost:3002/api/reports
curl "http://localhost:3002/api/reports/<id>/samples?kind=failed&limit=5"
```

## Storage model

SQLite, four tables (all children cascade-delete with the report):

| Table             | Content                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `reports`         | File metadata (name, size, format, skipped rows, stored samples, import date) and every overall metric |
| `report_labels`   | The same metrics per sampler label                                  |
| `report_timeline` | Pre-aggregated time buckets used by the chart                       |
| `report_samples`  | The raw samples of the uploaded file, capped by `MAX_STORED_SAMPLES` |

Metrics always cover **every** sample of the file; the cap only limits how many individual
rows remain browsable, which keeps the database bounded for very large `.jtl` files.

## Tests

```bash
cd app/jmeter-reports-js/backend
npm test        # 27 node:test cases

cd ../frontend
npm run build
```

Test coverage focuses on the risky logic: CSV/XML detection and parsing (headers, delimiters,
quoting, nested samples, malformed rows), statistics (percentiles, median, error rate,
throughput, single-sample edge case), timeline bucketing (bucket widening, no lost sample) and
the API contract (upload, persistence, sample storage and its cap, slowest/failed views,
validation errors, 404, cascade delete).
