import { Router } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { askFinanceAssistant } from '../services/aiService.js';
import { MarketDataService } from '../services/marketDataService.js';
import { db } from '../db/index.js';
import { auditLog } from '../utils/logger.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  chatLimiter,
  [
    body('message').isString().trim().isLength({ min: 1, max: 4000 }),
    body('market').optional().isIn(['ngx', 'crypto', 'global', 'twelvedata']),
    body('symbol').optional().matches(/^[A-Za-z0-9.\-]{1,15}$/),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { message, market, symbol } = req.body;
      const userId = req.user.id;

      let marketContext = null;
      if (market && symbol) {
        try {
          marketContext = await MarketDataService.getQuote(market, symbol);
        } catch {
          marketContext = { note: `Could not fetch live data for ${symbol} on ${market}` };
        }
      }

      const history = db
        .prepare('SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
        .all(userId)
        .reverse();

      const messages = [...history, { role: 'user', content: message }];

      const reply = await askFinanceAssistant({ messages, marketContext });

      const insert = db.prepare(
        'INSERT INTO chat_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)',
      );
      insert.run(uuid(), userId, 'user', message);
      insert.run(uuid(), userId, 'assistant', reply);

      auditLog('chat.message', { userId, market: market || null, symbol: symbol || null });

      res.json({ reply, marketContext });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/history', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 100')
    .all(req.user.id);
  res.json(rows);
});

export default router;
