import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// SECURITY: stack traces and internal error messages are never sent to the
// client — they can reveal file paths, library versions, and query structure
// that help an attacker fingerprint the stack.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error('Unhandled error', {
    message: err.message,
    path: req.path,
    method: req.method,
  });

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    ...(env.nodeEnv !== 'production' && { debug: err.stack }),
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}
