import axios from 'axios';
import { env } from '../../config/env.js';

// IMPORTANT: there is no official free real-time NGX (Nigerian Exchange) API.
// This adapter targets a free community-maintained data source as a starting
// point for development/demo purposes only. Before production use:
//   1. Verify the endpoint's current response shape (unofficial sources change
//      without notice) and its terms of use.
//   2. For a commercial product, get a licensed feed instead — e.g. NGX's own
//      X-Data / X-DaaS market data licensing program, or an aggregator that
//      has a proper NGX license (contact NGX Regulation Ltd / NGX Data).
//   3. Add a circuit breaker + cache: if this endpoint goes down, the whole
//      "Nigerian markets" feature should degrade gracefully, not crash.
export async function getNgxQuote(symbol) {
  const { data } = await axios.get(`${env.ngxDataBaseUrl}/${encodeURIComponent(symbol)}.json`, {
    timeout: 8000,
  });

  if (!data || !data.price) {
    throw Object.assign(new Error(`No NGX data for ${symbol}`), { status: 404 });
  }

  return {
    source: 'ngx_unofficial',
    symbol: symbol.toUpperCase(),
    price: Number(data.price),
    change: data.change ?? null,
    changePercent: data.changePercent ?? null,
    asOf: data.date ?? null,
    disclaimer: 'Unofficial/community source — verify before acting on this data.',
  };
}

export async function listNgxTopMovers() {
  const { data } = await axios.get(`${env.ngxDataBaseUrl}/gainers.json`, { timeout: 8000 });
  return { source: 'ngx_unofficial', movers: data };
}
