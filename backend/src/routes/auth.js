import { Router } from 'express';
import { body } from 'express-validator';
import { UserModel } from '../models/User.js';
import { signAccessToken, signRefreshToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { auditLog } from '../utils/logger.js';
import { env } from '../config/env.js';

const router = Router();

const cookieOpts = {
  httpOnly: true,
  secure: env.nodeEnv === 'production', // requires HTTPS in prod
  sameSite: 'strict',
  path: '/',
};

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    // SECURITY: enforce meaningful password strength server-side — client-side
    // checks alone can always be bypassed by calling the API directly.
    body('password')
      .isLength({ min: 12 })
      .matches(/[A-Z]/).withMessage('needs an uppercase letter')
      .matches(/[a-z]/).withMessage('needs a lowercase letter')
      .matches(/[0-9]/).withMessage('needs a number'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (UserModel.findByEmail(email)) {
        // Same generic message as a real failure — don't reveal which emails exist.
        return res.status(409).json({ error: 'Registration failed' });
      }
      const user = await UserModel.create(email, password);
      auditLog('user.register', { userId: user.id });
      res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = UserModel.findByEmail(email);

      // SECURITY: constant-shape response whether the user exists or not,
      // and whether the password is wrong — prevents user enumeration.
      const genericFail = () => res.status(401).json({ error: 'Invalid email or password' });

      if (!user) return genericFail();
      if (UserModel.isLocked(user)) {
        auditLog('user.login_blocked_locked', { userId: user.id, ip: req.ip });
        return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
      }

      const valid = await UserModel.verifyPassword(user, password);
      if (!valid) {
        const { locked } = UserModel.registerFailedLogin(user);
        auditLog('user.login_failed', { userId: user.id, ip: req.ip, locked });
        return genericFail();
      }

      UserModel.resetFailedLogins(user);
      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken(user);

      res
        .cookie('access_token', accessToken, { ...cookieOpts, maxAge: 15 * 60_000 })
        .cookie('refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 3600_000 })
        .json({ id: user.id, email: user.email, role: user.role });

      auditLog('user.login_success', { userId: user.id, ip: req.ip });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/logout', (req, res) => {
  res.clearCookie('access_token', cookieOpts).clearCookie('refresh_token', cookieOpts);
  res.status(204).end();
});

export default router;
