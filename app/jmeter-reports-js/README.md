# JMeter Reports (JavaScript)

Single-user web application to import JMeter result files (`.jtl`), compute a performance
summary and **store the uploaded data in SQLite** so a run stays fully explorable — timeline
chart, slowest and failed requests — long after the original file is gone.

Stack: **React (JavaScript) + Express + SQLite**.

```
app/jmeter-reports-js
├── client/                     React (JavaScript) UI, built with Vite
│   ├── public/                 Static assets served as-is (favicon)
│   ├── src/
│   │   ├── assets/             Stylesheet
│   │   ├── components/         Reusable view pieces (MetricCard, DonutChart, TimelineChart,
│   │   │                       SampleTable, Icon)
│   │   ├── pages/              One component per route (dashboard, list, upload, detail)
│   │   ├── services/           HTTP client, formatting helpers, useReports hook
│   │   ├── uploads/            Upload feature: dropzone, validation rules, useUpload hook
│   │   ├── App.jsx             Router and layout
│   │   └── main.jsx            React entry point
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
├── server/                     Express REST API
│   ├── src/
│   │   ├── controllers/        Request handlers (validation, HTTP status, payloads)
│   │   ├── db/                 SQLite connection, schema and row mappers
│   │   ├── models/             Domain layer: report persistence, .jtl parsing, statistics
│   │   ├── routes/             Express routers mounted under /api
│   │   ├── config.js           Environment-driven settings
│   │   └── database.db         SQLite file, created on first run (git-ignored)
│   ├── test/                   node:test suites
│   ├── index.js                createApp() + server entry point
│   └── package.json
├── scripts/                    dev.js (runs API + UI together), seed.js (bulk import)
├── samples/                    Example .jtl files (CSV and XML flavours)
│   └── large/                  Drop real, multi-MB runs here (git-ignored)
├── package.json                Root launcher: setup / dev / seed / lint / test / build
└── README.md
```

The server follows a layered flow — `routes` → `controllers` → `models` → `db` — so the HTTP
contract, the parsing/statistics logic and the SQL all stay independently testable.

> A TypeScript variant of this app lives in `app/jmeter-reports`. It stores only metadata and
> metrics; this JavaScript version additionally persists the samples themselves, which is what
> powers the timeline chart and the per-sample views. Both can run side by side (different
> ports and databases).

## Requirements

- **Node.js >= 22.6** — the server uses the built-in `node:sqlite` module, so there is no
  native module to compile and no ORM.
- npm 10+

## Getting started

One command installs everything, another starts both processes:

```bash
cd app/jmeter-reports-js
npm run setup      # installs server + client dependencies
npm run dev        # starts the API (3002) and the UI (5175) together, Ctrl+C stops both
```

Open http://localhost:5175 and import `samples/sample-results.jtl` (CSV) or
`samples/sample-results-xml.jtl` (XML).

| Root command | What it does |
| --- | --- |
| `npm run setup` | Installs dependencies in `server/` and `client/` |
| `npm run dev` | Runs API + UI with prefixed `[api]` / `[web]` logs |
| `npm run seed` | Imports every `.jtl` of `samples/` and `samples/large/` into SQLite |
| `npm run reset` | Same as `seed`, after deleting all existing reports |
| `npm test` | Server test suite (28 cases) |
| `npm run lint` | ESLint on the client |
| `npm run build` | Production build of the client |

Each side can still be driven on its own with `npm --prefix server start` and
`npm --prefix client run dev`.

### Loading real runs without uploading

Put your production `.jtl` exports in `samples/large/` (git-ignored) and run:

```bash
npm run seed              # or: npm run seed -- /path/to/run.jtl
npm run seed -- --reset   # wipe the database first
```

The seed script reuses the API's parser, statistics and store, so a seeded report is
identical to an uploaded one. Measured on two real runs:

| File | Size | Samples | Import |
| --- | --- | --- | --- |
| `…itg.tbd…_ELASTIC_LARGE_NORMAL.jtl` | 37 MB | 109 944 | ~1.1 s |
| `…itg3.tbd…_ELASTIC_LARGE_NORMAL.jtl` | 45 MB | 136 642 | ~1.4 s |

The same 45 MB file uploaded through `POST /api/reports` answers `201` in about 1.4 s.

### Configuration (server environment variables)

| Variable             | Default                   | Description                                    |
| -------------------- | ------------------------- | ---------------------------------------------- |
| `PORT`               | `3002`                    | HTTP port of the API                           |
| `MAX_UPLOAD_MB`      | `64`                      | Maximum accepted upload size                   |
| `MAX_STORED_SAMPLES` | `200000`                  | Cap on raw samples persisted per report        |
| `DATABASE_PATH`      | `server/src/database.db`  | SQLite database file (auto-created)            |

## Using the app

The left icon rail gives access to three pages:

1. **Latest uploads** (home, `#/latest`) — dashboard of the six most recent `.jtl` uploads as
   pastel cards (format, size, age, samples, error rate, P95), each with a direct link to its
   report. A side column sums up every stored run (reports, requests analysed, failures,
   global error rate, imported volume), offers a shortcut to the import page and lists the
   five latest uploads as a compact history. The header search filters the list by file name.
2. **Saved reports** (`#/reports`) — the full table of imported runs with their key figures
   and how many samples were stored; open one, or delete it (samples and timeline are
   cascade-deleted). The header search applies here too.
3. **Import .jtl** (`#/upload`) — drag & drop or browse for a `.jtl`/`.csv`/`.xml` file. The
   format is auto-detected, the file is parsed server-side, then the summary, the timeline and
   the samples are saved.

**Report detail** (`#/reports/:id`) opens from any of those lists: a success/failure **donut
chart** with its legend (counts and shares), the summary metric cards, the response-time
timeline chart, slowest / failed sample tables and a per-sampler breakdown.

### Look and feel

The interface follows a soft pastel dashboard style: a single rounded white shell floating on
a tinted canvas, a dark icon rail for navigation, generous radii, pastel data cards (mint,
pink, yellow, lavender) and a monochrome ink palette for typography. No UI framework is
used — everything is hand-written CSS in `client/src/assets/styles.css`.

### Responsive layout

The UI is usable from a 320 px phone to a wide desktop, with no horizontal page scrolling:

- **The dashboard** drops from two columns to one below 1100 px, and the upload cards reflow
  from three columns to one.
- **The icon rail** becomes a sticky bottom bar below 900 px, and the shell goes full-bleed
  (no outer margin, no rounded corners) below 520 px.
- **The donut chart** places its legend beside the ring on tablets and below it on phones.
- **Metric cards** reflow from 1 column on a phone up to 6 on a large screen.
- **Short tables** (saved reports, individual samples) turn into stacked cards below 720 px,
  each value keeping its column name as a label.
- **The per-sampler table** (12 columns) scrolls horizontally inside its own box, with the
  label column pinned so a row stays identifiable while scrolling.
- **The timeline chart** is drawn at the container's real pixel width instead of being
  squeezed by a fixed `viewBox`, so axis labels stay legible; below 520 px it switches to a
  compact layout and only keeps the error points when they would otherwise overlap.
- Header, toolbars and buttons wrap, and tap targets are at least 44 px high.

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
cd app/jmeter-reports-js
npm test           # 28 node:test cases (server)
npm run lint       # ESLint on the client
npm run build      # client production build
```

Test coverage focuses on the risky logic: CSV/XML detection and parsing (headers, delimiters,
quoting, nested samples, malformed rows), statistics (percentiles, median, error rate,
throughput, single-sample edge case), timeline bucketing (bucket widening, no lost sample, 150k-sample volume) and
the API contract (upload, persistence, sample storage and its cap, slowest/failed views,
validation errors, 404, cascade delete).
