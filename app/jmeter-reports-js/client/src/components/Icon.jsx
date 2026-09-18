const paths = {
  dashboard:
    'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  reports:
    'M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM9 8h5M9 12h5',
  upload: 'M12 16V5M8 9l4-4 4 4M5 18h14',
  arrow: 'M7 17 17 7M9 7h8v8',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l3 2',
  trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13',
  back: 'M15 5l-7 7 7 7',
}

/** Single-source inline icon set: keeps the UI dependency-free. */
export default function Icon({ name, size = 20, className = '' }) {
  const d = paths[name]
  if (!d) {
    return null
  }
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}
