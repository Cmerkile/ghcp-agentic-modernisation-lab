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
| `src/components/` | Presentational pieces reused by pages: `MetricCard`, `DonutChart` (success vs failure), `TimelineChart`, `SampleTable`, `Icon` (inline SVG set) |
| `src/pages/` | One component per route: `LatestUploadsPage`, `ReportsPage`, `UploadPage`, `ReportDetailPage` |
| `src/services/` | `api.js` (fetch wrapper, typed errors), `format.js` (numbers, durations, bytes, dates, relative time) and `useReports.js` (shared list loader) |
| `src/uploads/` | Upload feature: `Dropzone` (drag & drop + file picker), `validation.js` (client-side extension/size checks), `useUpload` (state machine for the request) |
| `App.jsx` | Hash router and page shell |
| `main.jsx` | React entry point |

## Routes

| Route | Page |
| --- | --- |
| `#/latest` (default) | Dashboard of the latest uploads, each linking to its report, plus global stats and upload history |
| `#/reports` | Saved reports, newest first |
| `#/upload` | Import a `.jtl` file |
| `#/reports/:id` | Detail: success/failure donut, summary metrics, timeline chart, per-sampler breakdown, slowest and failed samples |

## Configuration

`VITE_API_URL` overrides the API base URL. When it is not set, the dev server proxies
`/api` to `http://localhost:3002` (see `vite.config.js`).

## Design

Soft pastel dashboard: a rounded white shell on a tinted canvas, a dark icon rail, pastel
cards (mint / pink / yellow / lavender) and an ink-on-white type scale. Everything is plain
CSS in `src/assets/styles.css` — no UI framework, no CSS-in-JS.

The header search box is owned by `App.jsx` and passed to the two list pages, so it filters
the dashboard and the saved-reports table by file name.

## Responsive behaviour

- The dashboard collapses to a single column below 1100 px; the icon rail becomes a sticky
  bottom bar below 900 px and the shell goes full-bleed below 520 px.
- The donut legend sits beside the ring on tablets and under it on phones.
- Below 720 px, short tables become stacked cards (`data-label` + CSS `::before`).
- The 12-column per-sampler table scrolls inside its own box with the label column pinned.
- `TimelineChart` uses a `ResizeObserver` and draws at the container's real pixel width, so
  axis labels stay legible instead of being squeezed by a fixed `viewBox`.
- Tap targets are at least 44 px high; header and toolbars wrap.

Checked with no horizontal overflow at 320, 360, 390, 480, 768, 1024 and 1440 px.
