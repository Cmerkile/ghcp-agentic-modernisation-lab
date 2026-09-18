import { useEffect, useState } from 'react'
import UploadPage from './pages/UploadPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'

function parseHash(hash) {
  const path = hash.replace(/^#\/?/, '')
  if (path === 'upload') {
    return { name: 'upload' }
  }
  const detail = /^reports\/(.+)$/.exec(path)
  if (detail) {
    return { name: 'detail', id: detail[1] }
  }
  return { name: 'reports' }
}

export function navigate(path) {
  window.location.hash = path
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>JMeter Reports</h1>
        <nav>
          <a className={route.name === 'reports' ? 'active' : ''} href="#/reports">
            Saved reports
          </a>
          <a className={route.name === 'upload' ? 'active' : ''} href="#/upload">
            Import .jtl
          </a>
        </nav>
      </header>

      <main className="app-main">
        {route.name === 'upload' && <UploadPage />}
        {route.name === 'reports' && <ReportsPage />}
        {route.name === 'detail' && <ReportDetailPage id={route.id} />}
      </main>
    </div>
  )
}
