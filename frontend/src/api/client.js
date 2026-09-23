const BASE = '/api';

// SECURITY: `credentials: 'include'` sends the httpOnly auth cookies set by
// the backend. We deliberately never store tokens in localStorage/sessionStorage
// — those are readable by any injected script (XSS), while httpOnly cookies
// are not.
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  sendMessage: (message, market, symbol) =>
    request('/chat', { method: 'POST', body: JSON.stringify({ message, market, symbol }) }),
  history: () => request('/chat/history'),
  quote: (market, symbol) => request(`/market/quote/${market}/${symbol}`),
};
