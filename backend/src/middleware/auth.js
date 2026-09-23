import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl,
    issuer: 'finance-chatbot',
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, typ: 'refresh' }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl,
    issuer: 'finance-chatbot',
  });
}

// SECURITY: tokens are read from an httpOnly cookie, never from localStorage —
// that closes off the most common XSS-token-theft path. See frontend api/client.js.
export function requireAuth(req, res, next) {
  const token = req.cookies?.access_token || extractBearer(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret, { issuer: 'finance-chatbot' });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

function extractBearer(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}
