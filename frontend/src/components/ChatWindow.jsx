import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [market, setMarket] = useState('ngx');
  const [symbol, setSymbol] = useState('DANGCEM');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.history().then(setMessages).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    // Render only as text — never dangerouslySetInnerHTML on model output,
    // which would open a stored-XSS hole if the model ever echoes user HTML.
    const text = input.trim();
    if (!text) return;
    setInput('');
    setError('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setBusy(true);
    try {
      const { reply } = await api.sendMessage(text, market || undefined, symbol || undefined);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-window">
      <div className="market-bar">
        <select value={market} onChange={(e) => setMarket(e.target.value)}>
          <option value="ngx">NGX (Nigeria)</option>
          <option value="crypto">Crypto</option>
          <option value="global">Global (Alpha Vantage)</option>
          <option value="twelvedata">Global (Twelve Data)</option>
        </select>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol e.g. DANGCEM"
          maxLength={15}
        />
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
        ))}
        {busy && <div className="bubble assistant">Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={send} className="composer">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about NGX stocks, naira, crypto, or global markets…"
          maxLength={4000}
        />
        <button type="submit" disabled={busy}>Send</button>
      </form>
      <p className="disclaimer">
        Informational only — not financial, investment, or tax advice.
      </p>
    </div>
  );
}
