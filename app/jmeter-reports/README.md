# JMeter Reports

Single-user web application to import JMeter result files (`.jtl`), compute a performance
summary and keep it available for later consultation — without re-uploading the file.

```
app/jmeter-reports
├── backend/     Node.js REST API (TypeScript, Express, SQLite)
├── frontend/    React + TypeScript UI (Vite)
└── samples/     Example .jtl files (CSV and XML flavours)
```

## Requirements

- **Node.js >= 22.6** — the backend uses the built-in `node:sqlite` module and runs TypeScript
  natively (type stripping), so there is no build step and no native module to compile.
- npm 10+

## Getting started

```bash
# 1. Backend (http://localhost:3001)
cd app/jmeter-reports/backend
npm install
npm start          # npm run dev for watch mode

# 2. Frontend (http://localhost:5174, proxies /api to the backend)
cd app/jmeter-reports/frontend
npm install
npm run dev
```

Open http://localhost:5174 and import `samples/sample-results.jtl` (CSV) or
`samples/sample-results-xml.jtl` (XML).

### Configuration (backend environment variables)

| Variable        | Default                      | Description                          |
| --------------- | ---------------------------- | ------------------------------------ |
| `PORT`          | `3001`                       | HTTP port of the API                 |
| `MAX_UPLOAD_MB` | `64`                         | Maximum accepted upload size         |
| `DATABASE_PATH` | `backend/data/reports.db`    | SQLite database file (auto-created)  |

## Using the app

1. **Import .jtl** — drag & drop or browse for a `.jtl`/`.csv`/`.xml` file. The format is
   auto-detected, the file is parsed server-side and the report is saved.
2. **Saved reports** — every imported run with its key figures; open one, or delete it.
3. **Report detail** — full summary plus a per-sampler breakdown.

### Computed metrics

Total requests, successes, failures, error rate (%), min / average / median / max response
time, P90 / P95 / P99, throughput (requests per second), start and end timestamps, test
duration and received bytes. The same set is computed per sampler label.

- Percentiles use the **nearest-rank** convention (`index = ceil(p/100 × n) - 1`), like the
  JMeter summary report.
- `endTime` is the *end* of the last sample (`timestamp + elapsed`), and throughput is
  `totalRequests / (endTime - startTime)`.

## Supported input formats

| Flavour | Details |
| ------- | ------- |
| CSV     | With or without a header row. Delimiters `,` `;` tab `\|`, quoted fields, JMeter default column order when headerless, second- or millisecond-based timestamps. Extra columns are ignored. |
| XML     | `<testResults>` documents with `<httpSample>` / `<sample>` elements. Nested sub-samples are **not** counted twice. XML entities in labels are decoded. |

Unreadable rows are skipped and reported as `skippedRows`; a file with no usable sample is
rejected.

### Validation and errors

| HTTP | Code                     | Cause                                              |
| ---- | ------------------------ | -------------------------------------------------- |
| 400  | `NO_FILE`                | No `file` field in the multipart request           |
| 400  | `UNSUPPORTED_EXTENSION`  | Extension other than `.jtl`, `.csv`, `.xml`        |
| 400  | `EMPTY_FILE`             | Empty file                                         |
| 400  | `MISSING_COLUMNS`        | CSV header without `timeStamp` / `elapsed`         |
| 400  | `INVALID_XML`            | XML without a `<testResults>` root                 |
| 400  | `NO_SAMPLES`             | No interpretable sample in the file                |
| 404  | `NOT_FOUND`              | Unknown report id                                  |
| 413  | `FILE_TOO_LARGE`         | Upload above `MAX_UPLOAD_MB`                       |

## REST API

| Method | Path                 | Description                                        |
| ------ | -------------------- | -------------------------------------------------- |
| GET    | `/api/health`        | Liveness probe and effective upload limit          |
| POST   | `/api/reports`       | Multipart upload (`file`), returns the saved report |
| GET    | `/api/reports`       | List of saved reports (newest first)               |
| GET    | `/api/reports/:id`   | Report detail with the per-label breakdown         |
| DELETE | `/api/reports/:id`   | Deletes a report                                   |

```bash
curl -F "file=@samples/sample-results.jtl" http://localhost:3001/api/reports
```

## Storage model

SQLite, two tables:

- `reports` — file metadata (name, size, detected format, skipped rows, import date) and all
  overall metrics.
- `report_labels` — the same metrics per sampler label, cascade-deleted with the report.

**Individual samples are deliberately not persisted.** Only metadata and metrics are stored,
which is all the summary view needs and keeps the database tiny even for `.jtl` files with
millions of rows. Storing raw samples would be required only for future features such as
response-time-over-time charts.

## Tests

```bash
cd app/jmeter-reports/backend
npm test         # parsing, statistics and REST API tests (node:test)
npm run typecheck

cd ../frontend
npm run typecheck
npm run build
```

Test coverage focuses on the risky logic: CSV/XML detection and parsing (headers, delimiters,
quoting, nested samples, malformed rows), statistics (percentiles, median, error rate,
throughput, single-sample edge case) and the API contract (upload, persistence, reload,
validation errors, 404).
