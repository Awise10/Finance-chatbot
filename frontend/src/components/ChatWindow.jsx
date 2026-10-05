import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

const sourceMap = {
  ngx: { label: 'NGX community feed', short: 'NGX', note: 'Unofficial — verify before acting.' },
  crypto: { label: 'CoinGecko', short: 'CG', note: 'Crypto prices + 24h movement.' },
  global: { label: 'Alpha Vantage', short: 'AV', note: 'Requires backend API key.' },
  twelvedata: { label: 'Twelve Data', short: '12D', note: 'Requires backend API key.' },
};

const prompts = ['Analyse DANGCEM', 'What is happening in crypto?', 'Explain the NGX today'];

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [market, setMarket] = useState('ngx');
  const [symbol, setSymbol] = useState('DANGCEM');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { api.history().then(setMessages).catch(() => {}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  async function loadQuote() {
    if (!symbol.trim()) return;
    setError('');
    try { setQuote(await api.quote(market, symbol.trim())); }
    catch (err) { setQuote(null); setError(err.message); }
  }

  async function send(e, preset) {
    e?.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || busy) return;
    setInput(''); setError(''); setMessages((m) => [...m, { role: 'user', content: text }]); setBusy(true);
    try {
      const { reply } = await api.sendMessage(text, market || undefined, symbol || undefined);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  const source = sourceMap[market];

  return <section className="assistant-panel">
    <div className="assistant-head">
      <div><span className="section-kicker">AI ASSISTANT</span><h2>Market conversation</h2></div>
      <div className="provider-badge"><i /> {source.label}</div>
    </div>

    {messages.length === 0 && <div className="empty-state"><div className="empty-icon">✦</div><h3>What would you like to know?</h3><p>Ask for an explanation, market context or a structured analysis. The assistant will use the selected market context when available.</p><div className="prompt-row">{prompts.map((p) => <button key={p} onClick={() => send(null, p)}>{p}<span>→</span></button>)}</div></div>}

    <div className="market-controls">
      <div className="field"><label>Market</label><select value={market} onChange={(e) => { setMarket(e.target.value); setQuote(null); }}><option value="ngx">NGX · Nigeria</option><option value="crypto">Crypto</option><option value="global">Global · Alpha Vantage</option><option value="twelvedata">Global · Twelve Data</option></select></div>
      <div className="field symbol-field"><label>Symbol / coin</label><input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} maxLength={30} placeholder="DANGCEM / bitcoin" /></div>
      <button className="quote-button" onClick={loadQuote} disabled={busy}>Get quote</button>
    </div>

    {quote && <div className="quote-card"><div><span>{quote.symbol || quote.coinId}</span><strong>{quote.priceNgn != null ? `₦${Number(quote.priceNgn).toLocaleString()}` : quote.priceUsd != null ? `$${Number(quote.priceUsd).toLocaleString()}` : quote.price != null ? Number(quote.price).toLocaleString() : '—'}</strong></div><div className="quote-meta"><span>{quote.changePercent ?? quote.change24hUsd ?? '—'}{quote.changePercent != null && !String(quote.changePercent).includes('%') ? '%' : ''}</span><small>{quote.asOf || quote.tradingDay || source.label}</small></div></div>}

    <div className="messages">{messages.map((m, i) => <div key={i} className={`message-row ${m.role}`}><span className="message-avatar">{m.role === 'user' ? 'You' : 'AI'}</span><div className={`bubble ${m.role}`}>{m.content}</div></div>)}{busy && <div className="message-row assistant"><span className="message-avatar">AI</span><div className="bubble assistant typing"><i /><i /><i /></div></div>}<div ref={bottomRef} /></div>

    {error && <p className="error">{error}</p>}
    <form onSubmit={send} className="composer"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a stock, crypto asset, FX, or market trend…" maxLength={4000} /><button type="submit" disabled={busy || !input.trim()}>↑</button></form>
    <div className="source-strip"><span>Context source</span><strong>{source.short}</strong><small>{source.note}</small></div>
  </section>;
}
