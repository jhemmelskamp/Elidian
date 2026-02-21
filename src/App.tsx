import { NavLink, Route, Routes } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <h1>Elidian Post Builder</h1>
          <p className="muted">Social-Media-Bilder aus Text in Sekunden erstellen</p>
        </div>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Editor
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            History
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Konfiguration
          </NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

