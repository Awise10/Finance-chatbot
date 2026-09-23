import 'dotenv/config';

// Fail fast: a misconfigured secret in production is a security incident
// waiting to happen (e.g. an empty JWT secret lets anyone forge tokens).
const required = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ANTHROPIC_API_KEY',
];

const missing = required.filter((key) => !process.env[key] || process.env[key].startsWith('replace_me'));

if (missing.length && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.error(`FATAL: missing/placeholder required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173').split(','),

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '7d',

  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',

  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY,
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY,
  coingeckoBaseUrl: process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3',
  ngxDataBaseUrl: process.env.NGX_DATA_BASE_URL || 'https://afx.kwayisi.org/ngx',
  newsApiKey: process.env.NEWS_API_KEY,

  sqliteDbPath: process.env.SQLITE_DB_PATH || './data/app.db',

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  chatRateLimitMax: Number(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS) || 10,

  logLevel: process.env.LOG_LEVEL || 'info',
};
