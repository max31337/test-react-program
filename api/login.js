// Root-level serverless login (fallback) POST /api/login
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const usersFile = path.join(process.cwd(), 'web', 'data', 'users.json');
const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

async function loadUsers () { return JSON.parse(await fs.readFile(usersFile, 'utf8')); }

export default async function handler (req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    let body = req.body;
    if (!body || typeof body !== 'object') {
      const chunks = []; for await (const c of req) chunks.push(c); const txt = Buffer.concat(chunks).toString();
      try { body = txt ? JSON.parse(txt) : {}; } catch { body = {}; }
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid login payload' });
    const { email, password } = parsed.data;
    const users = await loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const secret = process.env.JWT_SECRET || 'changeme_dev_secret';
    const exp = process.env.JWT_EXPIRES_IN || '1h';
    const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: exp });
    return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error('login error root fn', e); return res.status(500).json({ error: 'Internal server error' });
  }
}
