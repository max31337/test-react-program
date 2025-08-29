// Development file-based JSON store (replaces SQLite to avoid native build issues)
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

export interface User { id: string; email: string; password: string }
export interface HistoryItem { id: string; userId: string; ip: string; data: any; createdAt: string }

interface Store {
  findUserByEmail(email: string): Promise<User | undefined>;
  addHistory(userId: string, ip: string, data: any): Promise<void>;
  listHistory(userId: string): Promise<HistoryItem[]>;
  deleteHistory(userId: string, ids: string[]): Promise<void>;
  ensureSeedUsers(users: { email: string; password: string }[]): Promise<void>;
}

let store: Store | null = null;

export function getStore(): Store {
  if (store) return store;
  if (process.env.UPSTASH_REDIS_URL && process.env.NODE_ENV === 'production') {
    store = createRedisStore(process.env.UPSTASH_REDIS_URL);
  } else {
    store = createFileStore();
  }
  return store;
}
function createFileStore(): Store {
  const dataPath = join(process.cwd(), 'api', 'dev-data.json');
  type Shape = { users: User[]; history: HistoryItem[] };
  const initial: Shape = { users: [], history: [] };
  let state: Shape = initial;
  function load() {
    if (existsSync(dataPath)) {
      try { state = JSON.parse(readFileSync(dataPath, 'utf8')) as Shape; } catch { state = initial; }
    }
  }
  function persist() {
    try { writeFileSync(dataPath, JSON.stringify(state, null, 2)); } catch {}
  }
  load();
  return {
    async findUserByEmail(email: string) { return state.users.find(u => u.email === email); },
    async addHistory(userId: string, ip: string, data: any) {
      state.history.push({ id: randomUUID(), userId, ip, data, createdAt: new Date().toISOString() });
      persist();
    },
    async listHistory(userId: string) {
      return state.history.filter(h => h.userId === userId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    },
    async deleteHistory(userId: string, ids: string[]) {
      state.history = state.history.filter(h => h.userId !== userId || !ids.includes(h.id));
      persist();
    },
    async ensureSeedUsers(users: { email: string; password: string }[]) {
      let added = false;
      users.forEach(u => { if(!state.users.find(x=>x.email===u.email)) { state.users.push({ id: randomUUID(), email: u.email, password: u.password }); added = true; } });
      if (added) persist();
    }
  };
}

function createRedisStore(url: string): Store {
  const redis = new Redis(url);
  return {
    async findUserByEmail(email: string): Promise<User | undefined> {
      const json = await redis.get(`user:email:${email}`);
      if (!json) return undefined;
      return JSON.parse(json) as User;
    },
    async addHistory(userId: string, ip: string, data: any) {
      const id = randomUUID();
      const item: HistoryItem = { id, userId, ip, data, createdAt: new Date().toISOString() };
      await redis.set(`history:${id}`, JSON.stringify(item));
      await redis.lpush(`history:list:${userId}`, id);
    },
    async listHistory(userId: string) {
      const ids = await redis.lrange(`history:list:${userId}`, 0, 100);
      const pipeline = redis.pipeline();
      ids.forEach(id => pipeline.get(`history:${id}`));
      const results = await pipeline.exec();
      const items: HistoryItem[] = [];
      (results ?? []).forEach(res => {
        const [, val] = res;
        if (typeof val === 'string') {
          items.push(JSON.parse(val));
        }
      });
      return items;
    },
    async deleteHistory(userId: string, ids: string[]) {
      const pipeline = redis.pipeline();
      ids.forEach(id => {
        pipeline.del(`history:${id}`);
        pipeline.lrem(`history:list:${userId}`, 0, id);
      });
      await pipeline.exec();
    },
    async ensureSeedUsers(users: { email: string; password: string }[]) {
      for (const u of users) {
        const existing = await redis.get(`user:email:${u.email}`);
        if (!existing) {
          const user: User = { id: randomUUID(), email: u.email, password: u.password };
          await redis.set(`user:email:${u.email}`, JSON.stringify(user));
        }
      }
    }
  };
}
