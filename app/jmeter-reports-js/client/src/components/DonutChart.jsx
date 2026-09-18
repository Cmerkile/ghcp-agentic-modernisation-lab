const SIZE = 200
const RADIUS = 78
const THICKNESS = 26
const CENTER = SIZE / 2

function polar(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return [CENTER + RADIUS * Math.cos(rad), CENTER + RADIUS * Math.sin(rad)]
}

/** Arc path for a slice, expressed as a stroked circle segment. */
function arcPath(startAngle, endAngle) {
  const [x1, y1] = polar(startAngle)
  const [x2, y2] = polar(endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`
}

/**
 * Donut chart of successful vs failed requests.
 * Renders a full ring when one of the two slices covers 100% of the samples,
 * because an arc of exactly 360° would otherwise collapse to a point.
 */
export default function DonutChart({ success, failed }) {
  const total = success + failed
  if (total === 0) {
    return <p className="empty">No sample to chart.</p>
  }

  const successRatio = success / total
  const failedRatio = failed / total
  const successAngle = successRatio * 360
  const slices = []

  if (failed === 0) {
    slices.push({ key: 'success', full: true, className: 'slice-success' })
  } else if (success === 0) {
    slices.push({ key: 'failed', full: true, className: 'slice-failed' })
  } else {
    slices.push({ key: 'success', d: arcPath(0, successAngle), className: 'slice-success' })
    slices.push({ key: 'failed', d: arcPath(successAngle, 360), className: 'slice-failed' })
  }

  const percent = (ratio) => `${(ratio * 100).toFixed(ratio > 0 && ratio < 0.001 ? 3 : 2)}%`

  return (
    <div className="donut">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`${success.toLocaleString()} successful and ${failed.toLocaleString()} failed requests`}
      >
        <circle className="donut-track" cx={CENTER} cy={CENTER} r={RADIUS} strokeWidth={THICKNESS} />
        {slices.map((slice) =>
          slice.full ? (
            <circle
              key={slice.key}
              className={`donut-slice ${slice.className}`}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              strokeWidth={THICKNESS}
            />
          ) : (
            <path
              key={slice.key}
              className={`donut-slice ${slice.className}`}
              d={slice.d}
              strokeWidth={THICKNESS}
            />
          ),
        )}
        <text className="donut-value" x={CENTER} y={CENTER - 2} textAnchor="middle">
          {percent(successRatio)}
        </text>
        <text className="donut-caption" x={CENTER} y={CENTER + 20} textAnchor="middle">
          success
        </text>
      </svg>

      <ul className="donut-legend">
        <li>
          <span className="dot dot-success" />
          <span className="legend-label">Success</span>
          <strong>{success.toLocaleString()}</strong>
          <span className="legend-share">{percent(successRatio)}</span>
        </li>
        <li>
          <span className="dot dot-failed" />
          <span className="legend-label">Failed</span>
          <strong>{failed.toLocaleString()}</strong>
          <span className="legend-share">{percent(failedRatio)}</span>
        </li>
        <li className="legend-total">
          <span className="legend-label">Total requests</span>
          <strong>{total.toLocaleString()}</strong>
        </li>
      </ul>
    </div>
  )
}
