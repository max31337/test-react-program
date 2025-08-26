// Serverless login function (ESM) for Vercel: POST /api/login
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// users.json sits at web/data/users.json relative to this file (../data)
const usersFile = path.join(__dirname, '../data/users.json');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

async function loadUsers () {
  const raw = await fs.readFile(usersFile, 'utf8');
  return JSON.parse(raw);
}

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    // Body may already be parsed; if not, attempt manual parse
    let body = req.body;
    if (!body || typeof body !== 'object') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const text = Buffer.concat(chunks).toString();
      if (text) {
        try { body = JSON.parse(text); } catch { body = {}; }
      } else body = {};
    }
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid login payload' });
    }
    const { email, password } = parsed.data;
    const users = await loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'changeme_dev_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn });
    return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error('Login error', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
