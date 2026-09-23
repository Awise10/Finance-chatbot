import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// SECURITY: rate limiting protects against (a) brute-forcing login, (b) scraping
// market data past provider quotas, (c) running up your Anthropic API bill via
// a scripted flood of chat requests ("denial of wallet").
export const generalLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, try again later.' },
});

export const chatLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.chatRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Chat rate limit reached, please wait a moment.' },
});
