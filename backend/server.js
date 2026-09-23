import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/auth.js';
import marketRoutes from './src/routes/market.js';
import chatRoutes from './src/routes/chat.js';

const app = express();

// SECURITY: behind a reverse proxy (nginx/ELB/etc.) so req.ip and rate-limit
// keys reflect the real client, not the proxy.
app.set('trust proxy', 1);

// Sets sane defaults for HSTS, X-Frame-Options, X-Content-Type-Options,
// Referrer-Policy, and a baseline Content-Security-Policy.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
  }),
);

// SECURITY: only the origins you explicitly list can call this API with
// credentials — a wildcard "*" here plus cookie-based auth is a common
// misconfiguration that lets any site ride the user's session.
app.use(
  cors({
    origin: env.corsAllowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  }),
);

app.use(express.json({ limit: '100kb' })); // cap body size against payload-flood DoS
app.use(cookieParser());
app.use(hpp()); // strips duplicate query params, a classic param-pollution vector
app.use(generalLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port} [${env.nodeEnv}]`);
});

// SECURITY: don't let an unhandled rejection silently corrupt state — log
// loudly and exit so your process manager (pm2/systemd/k8s) restarts clean.
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
  process.exit(1);
});
