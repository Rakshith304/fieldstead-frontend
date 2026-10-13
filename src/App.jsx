import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  Cpu,
  Globe,
  Leaf,
  LogOut,
  MapPin,
  MessageCircle,
  Radio,
  ShieldCheck,
  Tractor,
  Zap,
} from 'lucide-react';
import Equipment from './pages/Equipment.jsx';
import EquipmentDetail from './pages/EquipmentDetail.jsx';
import Login from './pages/Login.jsx';
import Rentals from './pages/Rentals.jsx';

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem('user') || 'null');
    if (session?.token && session?.id && session?.role) return session;
  } catch {
    localStorage.removeItem('user');
  }
  return null;
}

function Guard({ user, role, children }) {
  const location = useLocation();
  if (!user?.token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to="/catalog" replace />;
  return children;
}

function AppFrame({ user, onLogout }) {
  const location = useLocation();
  const onCatalog = location.pathname === '/catalog' || location.pathname.startsWith('/equipment/');
  return (
    <div className="app-frame cyber-theme">
      {/* Futuristic Header */}
      <header className="site-header cyber-header">
        <Link className="brand cyber-brand" to="/catalog" aria-label="Fieldstead TerraPulse home">
          <span className="brand-mark cyber-brand-mark">
            <Tractor size={22} strokeWidth={1.8} />
          </span>
          <span className="brand-text">
            <strong>FIELDSTEAD <span className="brand-pulse">// TERRAPULSE</span></strong>
            <small>Autonomous Fleet Exchange</small>
          </span>
        </Link>

        {/* Global Live Telemetry Status Pill */}
        <div className="header-telemetry-pill">
          <Radio size={12} className="pulse-icon" />
          <span>RTK LOCK: 12 SATS &bull; SECTOR 04 ONLINE</span>
        </div>

        <nav className="main-nav cyber-nav" aria-label="Main navigation">
          <Link className={onCatalog ? 'nav-link active' : 'nav-link'} to="/catalog">
            <Boxes size={15} /> Fleet Grid
          </Link>
          {user && (
            <Link className={location.pathname === '/rentals' ? 'nav-link active' : 'nav-link'} to="/rentals">
              <Cpu size={15} /> {user.role === 'ADMIN' ? 'Dispatch Desk' : 'My Dispatches'}
            </Link>
          )}
          <Link className="nav-link" to="/catalog#advisory">
            <Radio size={14} /> Telemetry
          </Link>
          <Link className="nav-link nav-location" to="/catalog#location">
            <MapPin size={14} /> Station
          </Link>
        </nav>

        <div className="header-account">
          {user ? (
            <>
              <div className="account-pill">
                <span className="online-dot" />
                <span className="account-user-name">{user.name}</span>
                <span className="role-tag">{user.role}</span>
              </div>
              <button
                className="icon-button cyber-logout-btn"
                type="button"
                onClick={onLogout}
                aria-label="Sign out"
                title="Disconnect station session"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link className="header-login cyber-login-btn" to="/login">
              <span>Connect Station</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </header>

      <main className="main-content"><Outlet /></main>

      {/* Futuristic Footer */}
      <footer className="site-footer cyber-footer" id="location">
        <div className="footer-brand">
          <Link className="brand footer-logo cyber-brand" to="/catalog">
            <span className="brand-mark cyber-brand-mark"><Tractor size={19} /></span>
            <span className="brand-text">
              <strong>FIELDSTEAD</strong>
              <small>TerraPulse Agritech Protocol</small>
            </span>
          </Link>
          <p>
            Decentralized autonomous farm machinery protocol. Real-time RTK GPS,
            instant sector dispatch, zero upfront capital lock.
          </p>
          <div className="footer-system-status">
            <span className="dot-pulse" /> NETWORK STATUS: ALL SECTORS NOMINAL
          </div>
        </div>

        <div className="footer-links">
          <strong>Fleet Navigation</strong>
          <Link to="/catalog">Autonomous Fleet Grid</Link>
          {user && <Link to="/rentals">{user.role === 'ADMIN' ? 'Fleet Dispatch Console' : 'Active Field Dispatches'}</Link>}
          <a href="mailto:ops@fieldstead.grid">Operations Dispatch</a>
        </div>

        <div className="footer-contact">
          <strong>Station Telemetry</strong>
          <a href="mailto:telemetry@fieldstead.grid">telemetry@fieldstead.grid</a>
          <span className="telemetry-code">GRID_COORDINATES: 12.9716° N, 77.5946° E</span>
          <span className="telemetry-code">STATION: BLR_CENTRAL_HUB</span>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} FIELDSTEAD TERRAPULSE &bull; AUTONOMOUS AGRICULTURAL PROTOCOL</span>
          <span>CALIBRATED FOR HIGH-EFFICIENCY FOOD PRODUCTION</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(readSession);
  useEffect(() => {
    const expireSession = () => { localStorage.removeItem('user'); setUser(null); };
    window.addEventListener('auth:expired', expireSession);
    return () => window.removeEventListener('auth:expired', expireSession);
  }, []);

  function login(session) {
    localStorage.setItem('user', JSON.stringify(session));
    setUser(session);
  }

  function logout() {
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppFrame user={user} onLogout={logout} />}>
          <Route index element={<Navigate to="/catalog" replace />} />
          <Route path="catalog" element={<Equipment user={user} />} />
          <Route path="equipment/:id" element={<EquipmentDetail user={user} />} />
          <Route path="login" element={user ? <Navigate to="/catalog" replace /> : <Login onLogin={login} />} />
          <Route path="rentals" element={<Guard user={user}><Rentals user={user} /></Guard>} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
