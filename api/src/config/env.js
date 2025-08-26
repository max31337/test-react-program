import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'changeme_dev_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h'
};
