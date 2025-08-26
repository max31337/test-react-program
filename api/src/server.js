import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import { env } from './config/env.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});
