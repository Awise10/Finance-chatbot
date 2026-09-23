import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export const UserModel = {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  },

  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  async create(email, password) {
    // SECURITY: bcrypt with cost factor 12 — tune upward as hardware improves.
    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuid();
    db.prepare(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ).run(id, email.toLowerCase(), passwordHash, 'user');
    return { id, email: email.toLowerCase(), role: 'user' };
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  },

  isLocked(user) {
    return user.locked_until && new Date(user.locked_until) > new Date();
  },

  registerFailedLogin(user) {
    const count = user.failed_login_count + 1;
    const lockedUntil =
      count >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
        : null;
    db.prepare(
      'UPDATE users SET failed_login_count = ?, locked_until = ? WHERE id = ?',
    ).run(count, lockedUntil, user.id);
    return { locked: !!lockedUntil };
  },

  resetFailedLogins(user) {
    db.prepare(
      'UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = ?',
    ).run(user.id);
  },
};
