import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db } from '../db';
import { BCRYPT_ROUNDS, COOKIE, cookieOptions, requireAuth, signToken } from '../services/auth';

export const authRouter = Router();
authRouter.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test' }));

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS); // equalises timing for unknown emails
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

authRouter.post('/register', (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (typeof email !== 'string' || !EMAIL.test(email)) return res.status(400).json({ error: 'Valid email is required' });
  if (typeof password !== 'string' || password.length < 10 || password.length > 128)
    return res.status(400).json({ error: 'Password must be 10-128 characters' });
  const e = email.trim().toLowerCase();
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(e))
    return res.status(409).json({ error: 'An account with that email already exists' });
  const isFirst = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c === 0;
  if (!isFirst && process.env.ALLOW_REGISTRATION === 'false')
    return res.status(403).json({ error: 'Registration is closed' });
  const info = db.prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,?)')
    .run(e, name.trim(), bcrypt.hashSync(password, BCRYPT_ROUNDS), isFirst ? 'admin' : 'user'); // first account = admin
  res.cookie(COOKIE, signToken(Number(info.lastInsertRowid)), cookieOptions);
  res.status(201).json({ id: info.lastInsertRowid, email: e, name: name.trim(), role: isFirst ? 'admin' : 'user' });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const u = typeof email === 'string'
    ? db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any : undefined;
  const pw = typeof password === 'string' && password.length <= 128 ? password : '';
  const ok = bcrypt.compareSync(pw, u?.password_hash ?? DUMMY_HASH) && pw !== '';
  if (!u || !ok) return res.status(401).json({ error: 'Invalid email or password' });
  res.cookie(COOKIE, signToken(u.id), cookieOptions);
  res.json({ id: u.id, email: u.email, name: u.name, role: u.role });
});

authRouter.post('/logout', (_req, res) => { res.clearCookie(COOKIE); res.status(204).end(); });
authRouter.get('/me', requireAuth, (req, res) => res.json(req.user));
