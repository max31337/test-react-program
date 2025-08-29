import { Router, Response, Request } from 'express';
import fetch from 'node-fetch';
import { AuthRequest } from '../middleware/auth.js';
import { getStore } from '../store/datastore.js';

export const geoRouter = Router();

geoRouter.get('/lookup', async (req: AuthRequest, res: Response) => {
  try {
    let ip = getRequestedIp(req);
    if (!ip) return res.status(400).json({ error: 'IP required' });
    if (isPrivateOrLocal(ip)) {
      // Resolve public IP using ipify
      try {
        const r = await fetch('https://api.ipify.org?format=json');
        if (r.ok) {
          const j: any = await r.json();
          if (j.ip) ip = j.ip;
        }
      } catch {/* ignore */}
    }
  const data = await lookupIp(ip as string);
    if (req.user) {
      const store = getStore();
  await store.addHistory(req.user.id, ip as string, data);
    }
    res.json({ ip, data });
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'Lookup failed' });
  }
});

function getRequestedIp(req: Request): string | null {
  const q = (req.query.ip as string) || '';
  if (q) return sanitizeIp(q);
  const xf = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  if (xf) return sanitizeIp(xf);
  const xr = (req.headers['x-real-ip'] as string | undefined);
  if (xr) return sanitizeIp(xr);
  const ra = (req.socket.remoteAddress || '').replace('::ffff:', '');
  return ra ? sanitizeIp(ra) : null;
}

function sanitizeIp(ip: string) {
  return ip.replace(/^::ffff:/, '');
}

function isPrivateOrLocal(ip: string) {
  return (
    ip === '::1' || ip === '127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    ip.startsWith('fc') || ip.startsWith('fd')
  );
}

async function lookupIp(ip: string) {
  const apiKey = process.env.IP_GEOLOCATION_API_KEY;
  if (apiKey) {
    const url = `https://ipinfo.io/${ip}?token=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Failed IP lookup');
    return r.json();
  } else {
    // fallback to ip-api (no key needed)
    const url = `http://ip-api.com/json/${ip}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Failed IP lookup');
    return r.json();
  }
}
