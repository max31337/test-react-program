import { getStore } from '../store/datastore.js';

const DEFAULT_USERS = [
  { email: 'user1@example.com', password: 'password1' },
  { email: 'user2@example.com', password: 'password2' },
  { email: 'user3@example.com', password: 'password3' }
];

export async function ensureSeeded() {
  const store = getStore();
  await store.ensureSeedUsers(DEFAULT_USERS);
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  ensureSeeded().then(() => console.log('Seed complete'));
}
