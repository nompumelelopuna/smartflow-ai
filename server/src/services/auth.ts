import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dataDir, db } from '../db';

declare global {
  namespace Express {
    interface Request { user?: { id: number; email: string; name: string; role: 'admin' | 'user' } }
  }
}

function loadSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(dataDir, '.jwt-secret');
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(file, 'utf8');
}
const SECRET = loadSecret();
export const COOKIE = 'smartflow_token';
export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export const signToken = (id: number) => jwt.sign({ sub: id }, SECRET, { algorithm: 'HS256', expiresIn: '8h' });

export const cookieOptions = {
  httpOnly: true, sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production', maxAge: 8 * 3600 * 1000,
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE];
    const payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as unknown as { sub: number };
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(payload.sub) as Request['user'];
    if (!user) throw new Error('no user');
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Not authenticated' });
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admin only' });
