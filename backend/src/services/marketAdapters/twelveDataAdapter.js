import axios from 'axios';
import { env } from '../../config/env.js';

const BASE_URL = 'https://api.twelvedata.com';

// NOTE: verify exact symbol/exchange formatting in Twelve Data's docs for
// Nigerian tickers before relying on this in production — coverage and
// symbol conventions change over time.
export async function getQuote(symbol) {
  if (!env.twelveDataApiKey) throw Object.assign(new Error('Twelve Data not configured'), { status: 503 });

  const { data } = await axios.get(`${BASE_URL}/quote`, {
    params: { symbol, apikey: env.twelveDataApiKey },
    timeout: 8000,
  });

  if (data.status === 'error') {
    throw Object.assign(new Error(data.message || `No data for ${symbol}`), { status: 404 });
  }

  return {
    source: 'twelve_data',
    symbol: data.symbol,
    name: data.name,
    price: Number(data.close),
    change: Number(data.change),
    changePercent: Number(data.percent_change),
    exchange: data.exchange,
  };
}
