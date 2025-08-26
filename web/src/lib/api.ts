/// <reference types="vite/client" />
import axios from 'axios';
import { GeoInfo } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

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
