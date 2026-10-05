import { useState } from 'react';
import { api } from '../api/client.js';

export default function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { if (mode === 'register') await api.register(email, password); await api.login(email, password); onAuthed({ authenticated: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="auth-page"><div className="auth-visual"><div className="logo-row"><div className="brand-mark">₦</div><div><strong>FinSight</strong><small>Market intelligence</small></div></div><div className="visual-copy"><span className="pill">FINANCE, REIMAGINED</span><h1>Understand the market.<br /><em>Make informed decisions.</em></h1><p>One place for Nigerian equities, crypto and global market analysis — backed by multiple data sources.</p><div className="visual-stats"><span><b>NGX</b> Nigerian equities</span><span><b>24/7</b> AI analysis</span><span><b>6+</b> reference sources</span></div></div></div><form onSubmit={submit} className="auth-form"><span className="section-kicker">WELCOME BACK</span><h2>{mode === 'login' ? 'Sign in to FinSight' : 'Create your account'}</h2><p className="auth-intro">{mode === 'login' ? 'Continue your market research session.' : 'Start exploring market intelligence in one place.'}</p><label>Email<input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" placeholder="Minimum 12 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={12} required /></label>{error && <p className="error">{error}</p>}<button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}</button><button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button><small className="auth-disclaimer">Your session uses secure httpOnly cookies. Never share your password.</small></form></div>;
}
