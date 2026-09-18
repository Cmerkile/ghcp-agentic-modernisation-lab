# Client — JMeter Reports UI

React 18 (plain JavaScript, no TypeScript) bundled by Vite. It talks to the Express API
described in the [root README](../README.md).

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:5175, /api proxied to http://localhost:3002
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run lint     # ESLint (flat config)
```

From the repository root, `npm run dev` starts this client **and** the API together.

## Layout

| Folder | Responsibility |
| --- | --- |
| `public/` | Static files copied as-is (favicon) |
| `src/assets/` | `styles.css` — design tokens, layout and every responsive breakpoint |
| `src/components/` | Presentational pieces reused by pages: `MetricCard`, `TimelineChart`, `SampleTable` |
| `src/pages/` | One component per route: `UploadPage`, `ReportsPage`, `ReportDetailPage` |
| `src/services/` | `api.js` (fetch wrapper, typed errors) and `format.js` (numbers, durations, bytes, dates) |
| `src/uploads/` | Upload feature: `Dropzone` (drag & drop + file picker), `validation.js` (client-side extension/size checks), `useUpload` (state machine for the request) |
| `App.jsx` | Hash router and page shell |
| `main.jsx` | React entry point |

## Routes

| Route | Page |
| --- | --- |
| `#/upload` | Import a `.jtl` file |
| `#/reports` | Saved reports, newest first |
| `#/reports/:id` | Detail: summary metrics, timeline chart, per-sampler breakdown, slowest and failed samples |

## Configuration

`VITE_API_URL` overrides the API base URL. When it is not set, the dev server proxies
`/api` to `http://localhost:3002` (see `vite.config.js`).

## Responsive behaviour

- Below 720 px, short tables become stacked cards (`data-label` + CSS `::before`).
- The 12-column per-sampler table scrolls inside its own box with the label column pinned.
- `TimelineChart` uses a `ResizeObserver` and draws at the container's real pixel width, so
  axis labels stay legible instead of being squeezed by a fixed `viewBox`.
- Tap targets are at least 44 px high; header and toolbars wrap.

Checked with no horizontal overflow at 320, 360, 390, 480, 768, 1024 and 1440 px.
