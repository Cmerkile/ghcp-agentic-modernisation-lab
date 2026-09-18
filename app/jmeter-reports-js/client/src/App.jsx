import { useEffect, useState } from 'react'
import Icon from './components/Icon.jsx'
import LatestUploadsPage from './pages/LatestUploadsPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'

const NAV = [
  { name: 'latest', href: '#/latest', icon: 'dashboard', label: 'Latest uploads' },
  { name: 'reports', href: '#/reports', icon: 'reports', label: 'Saved reports' },
  { name: 'upload', href: '#/upload', icon: 'upload', label: 'Import .jtl' },
]

function parseHash(hash) {
  const path = hash.replace(/^#\/?/, '')
  if (path === 'upload') {
    return { name: 'upload' }
  }
  if (path === 'reports') {
    return { name: 'reports' }
  }
  const detail = /^reports\/(.+)$/.exec(path)
  if (detail) {
    return { name: 'detail', id: detail[1] }
  }
  return { name: 'latest' }
}

export function navigate(path) {
  window.location.hash = path
}

const TITLES = {
  latest: 'Welcome back 👋',
  reports: 'Saved reports',
  upload: 'Import a run',
  detail: 'Report detail',
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // The search box only makes sense on the two list views.
  const searchable = route.name === 'latest' || route.name === 'reports'
  useEffect(() => {
    if (!searchable) {
      setSearch('')
    }
  }, [searchable])

  return (
    <div className="app">
      <div className="shell">
        <nav className="rail" aria-label="Main">
          <span className="rail-logo" aria-hidden="true" />
          <ul>
            {NAV.map((item) => {
              const active =
                item.name === route.name || (item.name === 'reports' && route.name === 'detail')
              return (
                <li key={item.name}>
                  <a
                    className={active ? 'rail-link active' : 'rail-link'}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon name={item.icon} />
                    <span className="rail-label">{item.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="workspace">
          <header className="topbar">
            <h1>{TITLES[route.name]}</h1>
            <div className="topbar-tools">
              {searchable && (
                <label className="search">
                  <Icon name="search" size={18} />
                  <input
                    type="search"
                    value={search}
                    placeholder="Search a file…"
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search a file"
                  />
                </label>
              )}
              <span className="avatar" aria-hidden="true">
                JM
              </span>
            </div>
          </header>

          <main className="workspace-body">
            {route.name === 'latest' && <LatestUploadsPage search={search} />}
            {route.name === 'reports' && <ReportsPage search={search} />}
            {route.name === 'upload' && <UploadPage />}
            {route.name === 'detail' && <ReportDetailPage id={route.id} />}
          </main>
        </div>
      </div>
    </div>
  )
}
