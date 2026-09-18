import { useEffect, useState } from 'react';
import UploadPage from './pages/UploadPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import ReportDetailPage from './pages/ReportDetailPage.tsx';

type Route = { name: 'reports' } | { name: 'upload' } | { name: 'detail'; id: string };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  if (path === 'upload') {
    return { name: 'upload' };
  }
  const detail = /^reports\/(.+)$/.exec(path);
  if (detail) {
    return { name: 'detail', id: detail[1]! };
  }
  return { name: 'reports' };
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
  );
}
