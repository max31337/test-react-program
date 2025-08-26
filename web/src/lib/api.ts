/// <reference types="vite/client" />
import axios from 'axios';
import { GeoInfo } from '../types';

// Resolve API base:
// 1. If VITE_API_BASE provided, use it (can be full URL)
// 2. If running locally (localhost / 127.x.x.x / ::1), use local Express port 8000
// 3. Otherwise assume same-origin serverless functions at /api (Vercel production)
function resolveApiBase () {
  const explicit = import.meta.env.VITE_API_BASE;
  if (explicit && explicit.trim().length) return explicit.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host.startsWith('127.') || host === '::1';
    if (isLocal) return 'http://localhost:8000/api';
  }
  return '/api';
}
const API_BASE = resolveApiBase();

export async function loginRequest (email: string, password: string) {
  const res = await axios.post(`${API_BASE}/login`, { email, password });
  return res.data as { token: string; user: any };
}

export async function fetchGeo (ip?: string): Promise<GeoInfo> {
  const base = 'https://ipinfo.io';
  const url = ip ? `${base}/${ip}/geo` : `${base}/geo`;
  const res = await axios.get(url, { timeout: 8000 });
  return res.data;
}
