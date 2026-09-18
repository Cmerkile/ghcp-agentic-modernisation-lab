import { useEffect, useRef, useState } from 'react'
import { formatMs, formatTime } from '../services/format.js'

const HEIGHT = 220
const SMALL_HEIGHT = 180
const PADDING = { top: 14, right: 14, bottom: 30, left: 52 }
const SMALL_PADDING = { top: 12, right: 10, bottom: 28, left: 42 }

/**
 * Tracks the rendered width of an element so the chart can be drawn at its real
 * pixel size: scaling a fixed viewBox would shrink labels to an unreadable size
 * on narrow screens.
 */
function useElementWidth(ref, fallback = 720) {
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return undefined
    }
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width
      if (measured && measured > 0) {
        setWidth(measured)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return width
}

/**
 * Minimal inline SVG chart of the average response time per time bucket, with
 * the buckets containing errors highlighted. Kept dependency-free on purpose.
 */
export default function TimelineChart({ timeline }) {
  const containerRef = useRef(null)
  const width = useElementWidth(containerRef)

  if (!timeline || timeline.length === 0) {
    return <p className="empty">No timeline data for this report.</p>
  }

  const compact = width < 520
  const padding = compact ? SMALL_PADDING : PADDING
  const height = compact ? SMALL_HEIGHT : HEIGHT
  const plotWidth = Math.max(40, width - padding.left - padding.right)
  const plotHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...timeline.map((bucket) => bucket.avgMs), 1)
  const step = plotWidth / Math.max(1, timeline.length - 1)

  const x = (index) => padding.left + index * step
  const y = (value) => padding.top + plotHeight - (value / maxValue) * plotHeight

  const line = timeline.map((bucket, index) => `${x(index)},${y(bucket.avgMs)}`).join(' ')
  const area = `${padding.left},${padding.top + plotHeight} ${line} ${x(timeline.length - 1)},${
    padding.top + plotHeight
  }`

  const first = timeline[0]
  const last = timeline[timeline.length - 1]
  const pointRadius = compact ? 3 : 4
  // A dense point cloud turns into a smudge once the plot gets narrow, so only
  // the buckets carrying errors stay visible below that threshold.
  const showPlainPoints = step >= (compact ? 14 : 8)

  return (
    <figure className="chart" ref={containerRef}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Average response time over time"
      >
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={width - padding.right}
          y2={padding.top + plotHeight}
          className="axis"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          className="axis"
        />

        <text x={padding.left - 8} y={padding.top + 4} className="axis-label" textAnchor="end">
          {Math.round(maxValue)}
        </text>
        <text
          x={padding.left - 8}
          y={padding.top + plotHeight}
          className="axis-label"
          textAnchor="end"
        >
          0
        </text>
        <text x={padding.left} y={height - 8} className="axis-label">
          {formatTime(first.bucketStart)}
        </text>
        <text x={width - padding.right} y={height - 8} className="axis-label" textAnchor="end">
          {formatTime(last.bucketStart)}
        </text>

        <polygon points={area} className="chart-area" />
        <polyline points={line} className="chart-line" />

        {timeline.map((bucket, index) => {
          if (bucket.errors === 0 && !showPlainPoints) {
            return null
          }
          return (
            <circle
              key={bucket.bucketStart}
              cx={x(index)}
              cy={y(bucket.avgMs)}
              r={bucket.errors > 0 ? pointRadius : pointRadius - 1.5}
              className={bucket.errors > 0 ? 'chart-point error' : 'chart-point'}
            >
              <title>
                {`${formatTime(bucket.bucketStart)} — ${bucket.count} req, avg ${formatMs(
                  bucket.avgMs,
                )}, max ${formatMs(bucket.maxMs)}, ${bucket.errors} errors`}
              </title>
            </circle>
          )
        })}
      </svg>
      <figcaption>
        Average response time per {Math.round(first.bucketMs / 1000)}s bucket — red points contain
        errors.
      </figcaption>
    </figure>
  )
}
