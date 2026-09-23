import { Router } from 'express';
import { param, query } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { MarketDataService } from '../services/marketDataService.js';

const router = Router();

router.get(
  '/quote/:market/:symbol',
  requireAuth,
  [
    param('market').isIn(['ngx', 'crypto', 'global', 'twelvedata']),
    // SECURITY: whitelist the symbol character set — this value flows into
    // outbound HTTP calls (SSRF/injection surface) and must never contain
    // path separators, protocol prefixes, or shell/query metacharacters.
    param('symbol').matches(/^[A-Za-z0-9.\-]{1,15}$/),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { market, symbol } = req.params;
      const data = await MarketDataService.getQuote(market, symbol);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/ngx/movers', requireAuth, async (req, res, next) => {
  try {
    res.json(await MarketDataService.getNgxMovers());
  } catch (err) {
    next(err);
  }
});

export default router;
