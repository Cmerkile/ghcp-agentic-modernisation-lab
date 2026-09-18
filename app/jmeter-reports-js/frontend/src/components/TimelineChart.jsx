import { formatMs, formatTime } from '../format.js'

const WIDTH = 720
const HEIGHT = 200
const PADDING = { top: 12, right: 12, bottom: 26, left: 52 }

/**
 * Minimal inline SVG chart of the average response time per time bucket, with
 * the buckets containing errors highlighted. Kept dependency-free on purpose.
 */
export default function TimelineChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="empty">No timeline data for this report.</p>
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom
  const maxValue = Math.max(...timeline.map((bucket) => bucket.avgMs), 1)
  const step = plotWidth / Math.max(1, timeline.length - 1)

  const x = (index) => PADDING.left + index * step
  const y = (value) => PADDING.top + plotHeight - (value / maxValue) * plotHeight

  const line = timeline.map((bucket, index) => `${x(index)},${y(bucket.avgMs)}`).join(' ')
  const area = `${PADDING.left},${PADDING.top + plotHeight} ${line} ${x(timeline.length - 1)},${
    PADDING.top + plotHeight
  }`

  const first = timeline[0]
  const last = timeline[timeline.length - 1]

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Average response time over time">
        <line
          x1={PADDING.left}
          y1={PADDING.top + plotHeight}
          x2={WIDTH - PADDING.right}
          y2={PADDING.top + plotHeight}
          className="axis"
        />
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + plotHeight}
          className="axis"
        />

        <text x={PADDING.left - 8} y={PADDING.top + 4} className="axis-label" textAnchor="end">
          {Math.round(maxValue)}
        </text>
        <text
          x={PADDING.left - 8}
          y={PADDING.top + plotHeight}
          className="axis-label"
          textAnchor="end"
        >
          0
        </text>
        <text x={PADDING.left} y={HEIGHT - 8} className="axis-label">
          {formatTime(first.bucketStart)}
        </text>
        <text x={WIDTH - PADDING.right} y={HEIGHT - 8} className="axis-label" textAnchor="end">
          {formatTime(last.bucketStart)}
        </text>

        <polygon points={area} className="chart-area" />
        <polyline points={line} className="chart-line" />

        {timeline.map((bucket, index) => (
          <circle
            key={bucket.bucketStart}
            cx={x(index)}
            cy={y(bucket.avgMs)}
            r={bucket.errors > 0 ? 4 : 2.5}
            className={bucket.errors > 0 ? 'chart-point error' : 'chart-point'}
          >
            <title>
              {`${formatTime(bucket.bucketStart)} — ${bucket.count} req, avg ${formatMs(
                bucket.avgMs,
              )}, max ${formatMs(bucket.maxMs)}, ${bucket.errors} errors`}
            </title>
          </circle>
        ))}
      </svg>
      <figcaption>
        Average response time per {Math.round(first.bucketMs / 1000)}s bucket — red points contain
        errors.
      </figcaption>
    </figure>
  )
}
