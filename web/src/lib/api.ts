/// <reference types="vite/client" />
import axios from 'axios';
import { GeoInfo } from '../types';

// In Vercel serverless unified deploy, the API is served under the same origin /api
// Fallback to localhost dev server if explicit env not set and running locally
const API_BASE = import.meta.env.VITE_API_BASE || (window?.location?.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');

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
