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

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
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
