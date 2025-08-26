import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = path.join(__dirname, '../data/users.json');

async function seed () {
  const saltRounds = 12;
  const passwordPlain = 'Password123!';
  const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);
  const user = {
    id: crypto.randomUUID(),
    email: 'user@example.com',
    name: 'Sample User',
    password_hash: passwordHash, // hashed + salted
    password_plain: passwordPlain, // explicit requirement, don't use in auth logic
    created_at: new Date().toISOString()
  };
  await fs.writeFile(usersFile, JSON.stringify([user], null, 2));
  console.log('Seeded user:', { email: user.email, password: passwordPlain });
}

seed().catch(e => { console.error(e); process.exit(1); });
