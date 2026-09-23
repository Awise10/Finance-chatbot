import winston from 'winston';
import { env } from '../config/env.js';

// SECURITY: never log request bodies, tokens, passwords, or API keys wholesale.
// Redact known-sensitive keys defensively even if a caller forgets to.
const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'apikey', 'api_key', 'secret', 'refreshtoken'];

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = redact(clone[key]);
    }
  }
  return clone;
}

const redactFormat = winston.format((info) => redact(info))();

export const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(
    redactFormat,
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    // In production, ship these to a managed log sink (CloudWatch, Datadog, etc.)
    // rather than local files, and set retention/PII-scrubbing policy there too.
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export function auditLog(event, meta = {}) {
  logger.info(`AUDIT: ${event}`, redact(meta));
}
