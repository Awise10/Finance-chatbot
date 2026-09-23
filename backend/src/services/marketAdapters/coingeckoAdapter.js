import axios from 'axios';
import { env } from '../../config/env.js';

export async function getCryptoPrice(coinId, vsCurrency = 'usd') {
  const { data } = await axios.get(`${env.coingeckoBaseUrl}/simple/price`, {
    params: { ids: coinId, vs_currencies: `${vsCurrency},ngn`, include_24hr_change: true },
    timeout: 8000,
  });

  const entry = data[coinId];
  if (!entry) throw Object.assign(new Error(`Unknown coin id ${coinId}`), { status: 404 });

  return {
    source: 'coingecko',
    coinId,
    priceUsd: entry.usd,
    priceNgn: entry.ngn,
    change24hUsd: entry.usd_24h_change,
  };
}
