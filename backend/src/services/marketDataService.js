import { getGlobalQuote } from './marketAdapters/alphaVantageAdapter.js';
import { getQuote } from './marketAdapters/twelveDataAdapter.js';
import { getCryptoPrice } from './marketAdapters/coingeckoAdapter.js';
import { getNgxQuote, listNgxTopMovers } from './marketAdapters/ngxAdapter.js';
import { logger } from '../utils/logger.js';

// Simple in-memory TTL cache. SECURITY/RELIABILITY: this also protects your
// paid API quotas from being drained by repeated identical requests, and
// keeps the chatbot responsive if an upstream provider is slow.
const cache = new Map();
const TTL_MS = 30_000;

function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL_MS) return Promise.resolve(hit.value);
  return fn().then((value) => {
    cache.set(key, { value, ts: Date.now() });
    return value;
  });
}

export const MarketDataService = {
  async getQuote(market, symbol) {
    const key = `${market}:${symbol}`;
    try {
      switch (market) {
        case 'ngx':
          return await cached(key, () => getNgxQuote(symbol));
        case 'crypto':
          return await cached(key, () => getCryptoPrice(symbol));
        case 'global':
          return await cached(key, () => getGlobalQuote(symbol));
        case 'twelvedata':
          return await cached(key, () => getQuote(symbol));
        default:
          throw Object.assign(new Error(`Unknown market "${market}"`), { status: 400 });
      }
    } catch (err) {
      logger.warn('Market data fetch failed', { market, symbol, error: err.message });
      throw err;
    }
  },

  async getNgxMovers() {
    return cached('ngx:movers', listNgxTopMovers);
  },
};
