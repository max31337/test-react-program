import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { geoRouter } from './routes/geo.js';
import { historyRouter } from './routes/history.js';
import { ensureSeeded } from './scripts/seed.js';
import { authMiddleware, optionalAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
// Trust proxy when behind Vercel / reverse proxy for correct secure cookie handling
app.set('trust proxy', 1);

// Allow one or multiple (comma-separated) frontend origins for CORS
const RAW_ORIGINS = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const ALLOWED_ORIGINS = RAW_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed: ' + origin));
  }
}));
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(express.json());
app.use(cookieParser());

// Basic health (legacy)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Extended healthcheck for monitoring
let startTime = Date.now();
app.get('/api/healthz', (_req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime;
  res.json({
    ok: true,
    service: 'ip-geo-api',
    version: process.env.npm_package_version || '0.1.0',
    env: process.env.NODE_ENV,
    uptimeMs,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRouter);
app.use('/api/geo', optionalAuth, geoRouter);
app.use('/api/history', authMiddleware, historyRouter);

const PORT = process.env.PORT || 4000;

ensureSeeded().then(() => {
  if (process.env.VERCEL) {
    // Export handler for serverless
  } else {
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  }
});

export default app;
