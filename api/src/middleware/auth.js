import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authRequired (req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }
  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
