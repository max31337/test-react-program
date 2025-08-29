import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getStore } from '../store/datastore.js';
import { setAuthCookie, clearAuthCookie } from '../util/cookies.js';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const store = getStore();
  const user = await store.findUserByEmail(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '1h' });
  setAuthCookie(res, token);
  res.json({ user: { id: user.id, email: user.email } });
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', (req: Request & { cookies?: any }, res: Response) => {
  try {
    const token = req.cookies?.token || null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as any;
    res.json({ user: { id: payload.sub, email: payload.email } });
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
