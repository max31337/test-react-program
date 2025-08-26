import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = path.join(__dirname, '../data/users.json');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

async function loadUsers () {
  const json = await fs.readFile(usersFile, 'utf8');
  return JSON.parse(json);
}

export async function login (req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid login payload', details: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;
    const users = await loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
