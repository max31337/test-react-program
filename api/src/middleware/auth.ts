import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getStore } from '../store/datastore.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || extractTokenFromHeader(req.headers['cookie']);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as any;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Optional auth: attaches user if token valid; otherwise proceeds without error.
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || extractTokenFromHeader(req.headers['cookie']);
    if (!token) return next();
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as any;
    req.user = { id: payload.sub, email: payload.email };
  } catch {
    // silently ignore invalid token
  }
  next();
}

function extractTokenFromHeader(cookieHeader: string | string[] | undefined) {
  if (!cookieHeader) return null;
  const header = Array.isArray(cookieHeader) ? cookieHeader.join(';') : cookieHeader;
  const parts = header.split(';').map(p => p.trim());
  for (const part of parts) {
    if (part.startsWith('token=')) return part.substring('token='.length);
  }
  return null;
}
