import { NavLink, Route, Routes } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand-row">
          <div className="brand-meta">
            <h1>Elidian</h1>
          </div>
        </div>
        <nav className="nav" aria-label="Hauptnavigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Bild Erstellen
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Verlauf auf diesem Gerät
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Einstellungen
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
