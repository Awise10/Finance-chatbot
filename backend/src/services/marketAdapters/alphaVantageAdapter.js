import axios from 'axios';
import { env } from '../../config/env.js';

const BASE_URL = 'https://www.alphavantage.co/query';

export async function getGlobalQuote(symbol) {
  if (!env.alphaVantageApiKey) throw Object.assign(new Error('Alpha Vantage not configured'), { status: 503 });

  const { data } = await axios.get(BASE_URL, {
    params: { function: 'GLOBAL_QUOTE', symbol, apikey: env.alphaVantageApiKey },
    timeout: 8000,
  });

  const quote = data['Global Quote'];
  if (!quote || !quote['05. price']) {
    throw Object.assign(new Error(`No data for symbol ${symbol}`), { status: 404 });
  }

  return {
    source: 'alpha_vantage',
    symbol: quote['01. symbol'],
    price: Number(quote['05. price']),
    change: Number(quote['09. change']),
    changePercent: quote['10. change percent'],
    volume: Number(quote['06. volume']),
    tradingDay: quote['07. latest trading day'],
  };
}
