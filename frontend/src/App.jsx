import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import { api } from './api/client.js';

const sources = [
  { name: 'NGX / Nigerian equities', detail: 'Community data adapter; verify prices before acting.', url: 'https://ngxgroup.com/' },
  { name: 'CoinGecko', detail: 'Crypto prices and 24h movement in USD/NGN.', url: 'https://www.coingecko.com/' },
  { name: 'Alpha Vantage', detail: 'Global equity quotes when configured.', url: 'https://www.alphavantage.co/' },
  { name: 'Twelve Data', detail: 'Global market quotes when configured.', url: 'https://twelvedata.com/' },
  { name: 'SEC Nigeria', detail: 'Investor and regulatory information.', url: 'https://sec.gov.ng/' },
  { name: 'CBN', detail: 'Official Nigerian monetary and FX context.', url: 'https://www.cbn.gov.ng/' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.history().then(() => setUser({ authenticated: true })).catch(() => {}).finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <div className="loading-screen"><div className="brand-mark">₦</div><span>Loading Finance Assistant…</span></div>;
  }

  if (!user) return <AuthForm onAuthed={setUser} />;

  async function logout() {
    await api.logout().catch(() => {});
    setUser(null);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo-row"><div className="brand-mark">₦</div><div><strong>FinSight</strong><small>Market intelligence</small></div></div>
        <nav>
          <a className="active" href="#assistant">⌂ <span>Assistant</span></a>
          <a href="#markets">◈ <span>Markets</span></a>
          <a href="#sources" onClick={() => setShowSources(true)}>◎ <span>Sources</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="security-note"><span>●</span><div><strong>Live data</strong><small>Provider availability varies</small></div></div>
          <button className="ghost-button" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="main-content" id="assistant">
        <header className="topbar">
          <div><p className="eyebrow">PERSONAL FINANCE INTELLIGENCE</p><h1>Good to see you.</h1></div>
          <div className="top-actions"><button className="source-button" onClick={() => setShowSources(true)}>◎ Sources</button><button className="mobile-logout" onClick={logout}>Log out</button></div>
        </header>

        <section className="hero-grid">
          <div className="hero-card">
            <div className="hero-copy"><span className="pill">AI MARKET ASSISTANT</span><h2>Ask better questions<br /><em>about your money.</em></h2><p>Explore Nigerian, crypto and global markets with context from multiple market-data providers.</p></div>
            <div className="hero-orb"><span>₦</span></div>
          </div>
          <div className="quick-card" id="markets"><span className="card-label">SUPPORTED MARKETS</span><div className="market-stat"><strong>4</strong><span>market routes</span></div><div className="market-list"><span>NGX</span><span>Crypto</span><span>Global</span><span>Twelve Data</span></div></div>
        </section>

        <ChatWindow />

        <footer><span>Informational use only — not financial, investment or tax advice.</span><button onClick={() => setShowSources(true)}>View data sources</button></footer>
      </main>

      {showSources && <div className="modal-backdrop" onClick={() => setShowSources(false)}><section className="sources-modal" id="sources" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">TRANSPARENCY</p><h2>Data &amp; reference sources</h2></div><button className="close-button" onClick={() => setShowSources(false)}>×</button></div><p className="modal-intro">The assistant can use market providers configured by the backend. Availability, coverage and freshness can vary.</p><div className="source-grid">{sources.map((source) => <a className="source-item" href={source.url} target="_blank" rel="noreferrer" key={source.name}><div><strong>{source.name}</strong><span>{source.detail}</span></div><b>↗</b></a>)}</div></section></div>}
    </div>
  );
}
