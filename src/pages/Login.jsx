import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Navigation,
  Radio,
  ShieldCheck,
  UserRound,
  Zap,
} from 'lucide-react';
import api, { errorText } from '../api';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function setDemoAccount(email, password) {
    setIsRegister(false);
    setForm({ name: '', email, password });
    setMessage('Demo credentials loaded. Click "Authorize Access" to connect.');
    setIsError(false);
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    if (isRegister && form.password.length < 12) {
      setMessage('Security protocol requires at least 12 characters.');
      setIsError(true);
      return;
    }
    setIsBusy(true);
    try {
      if (isRegister) {
        await api.post('/users/register', form);
        setIsRegister(false);
        setForm((current) => ({ ...current, password: '' }));
        setIsError(false);
        setMessage('Operator profile registered. Authenticate to proceed.');
      } else {
        const { data } = await api.post('/users/login', { email: form.email, password: form.password });
        onLogin(data);
        navigate(location.state?.from?.pathname || '/catalog', { replace: true });
      }
    } catch (error) {
      setMessage(errorText(error));
      setIsError(true);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="auth-layout cyber-auth">
      {/* Left Holographic Story Section */}
      <div className="auth-story cyber-auth-story">
        <div className="auth-story-shade" />
        <div className="auth-grid-scan" />
        
        <div className="auth-story-copy">
          <div className="telemetry-pill">
            <Radio size={12} className="pulse-icon" />
            <span>TERRAGRID NETWORK // AUTHENTICATION</span>
          </div>

          <h1 className="auth-hero-title">
            Autonomous Agri-Fleet<br />
            <span className="gradient-text">Exchange Network.</span>
          </h1>

          <p className="auth-hero-p">
            Decentralized agricultural machinery exchange powered by RTK precision autosteer,
            live IoT telemetry, and automated dispatch protocols.
          </p>

          <div className="auth-telemetry-stats">
            <div className="auth-stat-box">
              <span className="stat-label"><Navigation size={12} /> SATELLITE LOCK</span>
              <strong>12 SATS ACTIVE</strong>
            </div>
            <div className="auth-stat-box">
              <span className="stat-label"><ShieldCheck size={12} /> SMART PROTOCOL</span>
              <strong>ZERO CAPITAL HOLD</strong>
            </div>
          </div>
        </div>

        <div className="story-index telemetry-code">
          STATION://BLR_01 &bull; PROTOCOL 2.4 ONLINE
        </div>
      </div>

      {/* Right Cyber Auth Panel */}
      <div className="auth-panel cyber-auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-badge-row">
            <span className="cyber-badge">
              <Lock size={12} /> ACCESS TERMINAL
            </span>
            <span className="telemetry-status-dot">
              <span className="dot-pulse" /> GATEWAY READY
            </span>
          </div>

          <h2>{isRegister ? 'Register Field Operator' : 'Operator Access'}</h2>
          <p className="auth-subtitle">
            {isRegister
              ? 'Initialize verified farmer credentials to request machinery dispatch.'
              : 'Sign in with your station credentials to control field operations.'}
          </p>

          {/* Quick Demo Credentials Bar */}
          {!isRegister && (
            <div className="demo-credentials-box">
              <span className="demo-box-label"><Zap size={12} /> Instant Demo Credentials:</span>
              <div className="demo-buttons-row">
                <button
                  type="button"
                  className="demo-chip"
                  onClick={() => setDemoAccount('admin@gmail.com', 'admin123')}
                >
                  ⚡ Admin Console
                </button>
                <button
                  type="button"
                  className="demo-chip"
                  onClick={() => setDemoAccount('sita@gmail.com', 'farmer123')}
                >
                  ⚡ Farmer Portal
                </button>
              </div>
            </div>
          )}

          <form className="auth-form cyber-form" onSubmit={submit}>
            {isRegister && (
              <label className="field-label cyber-field">
                <span>Full Name</span>
                <span className="input-wrap">
                  <UserRound size={17} className="cyber-icon-muted" />
                  <input
                    name="name"
                    autoComplete="name"
                    maxLength="80"
                    placeholder="e.g. Sita Devi"
                    value={form.name}
                    onChange={change}
                    required
                  />
                </span>
              </label>
            )}

            <label className="field-label cyber-field">
              <span>Station Email</span>
              <span className="input-wrap">
                <Mail size={17} className="cyber-icon-muted" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength="254"
                  placeholder="operator@fieldstead.grid"
                  value={form.email}
                  onChange={change}
                  required
                />
              </span>
            </label>

            <label className="field-label cyber-field">
              <span>Security Passcode</span>
              <span className="input-wrap">
                <KeyRound size={17} className="cyber-icon-muted" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  minLength={isRegister ? 12 : 1}
                  maxLength="72"
                  placeholder={isRegister ? '12+ character security protocol' : 'Security passcode'}
                  value={form.password}
                  onChange={change}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            <button className="button button-primary cyber-submit-btn" type="submit" disabled={isBusy}>
              {isBusy ? 'Authenticating...' : isRegister ? 'Initialize Operator Account' : 'Authorize Access'}
              <ArrowRight size={17} />
            </button>
          </form>

          {message && (
            <p className={isError ? 'cyber-message error' : 'cyber-message success'} role="status">
              {message}
            </p>
          )}

          <p className="auth-switch">
            {isRegister ? 'Already have an authorized profile?' : 'New operator station?'}
            <button
              type="button"
              className="cyber-switch-btn"
              onClick={() => { setIsRegister((v) => !v); setMessage(''); }}
            >
              {isRegister ? 'Sign In' : 'Create Operator Account'}
            </button>
          </p>

          <p className="auth-legal">
            Encrypted station link. Autonomous equipment dispatch requires certified safety protocol compliance.
          </p>
        </div>
      </div>
    </section>
  );
}
