import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

type RateRecord = { count: number; reset: number };
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 20);

// Simple in-memory rate limiter (per serverless instance)
const rateMap: Map<string, RateRecord> = (global as any).__loginRateMap || new Map();
(global as any).__loginRateMap = rateMap;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const rec = rateMap.get(key);
  if (!rec || now > rec.reset) {
    rateMap.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (rec.count >= RATE_LIMIT_MAX) return true;
  rec.count += 1;
  return false;
}

function signPayload(payloadB64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

function mergeIps(existing: any, newEntry: { ip: string; exp: number }) {
  const ips: Array<{ ip: string; exp: number }> = Array.isArray(existing?.ips) ? existing.ips : [];
  const filtered = ips.filter((e) => e.ip !== newEntry.ip);
  filtered.push(newEntry);
  return filtered;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, remember, ip } = req.body || {};
  const clientIp = (typeof ip === 'string' && ip) || (req.headers['x-forwarded-for']?.toString().split(',')[0].trim()) || req.socket.remoteAddress || '0.0.0.0';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many attempts. Try later.' });
  }

  const envUser = process.env.AUTH_USERNAME;
  const passHash = process.env.AUTH_PASSWORD_BCRYPT;
  const secret = process.env.VERCEL_IP_TRUST_SECRET;

  if (!envUser || !passHash || !secret) {
    return res.status(500).json({ error: 'Server not configured for login (missing env).' });
  }

  if (username !== envUser) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(String(password || ''), String(passHash));
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ttlDays = remember ? 90 : 1; // remember IP for 90 days, otherwise 1 day
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

  // Merge with existing cookie if present
  const existingCookie = (req.cookies || {})['trusted_ip_token'];
  let existingPayload: any = null;
  try {
    if (existingCookie) {
      const [payloadB64] = existingCookie.split('.');
      existingPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    }
  } catch {}

  const payload = {
    user: envUser,
    ips: mergeIps(existingPayload, { ip: clientIp, exp }),
    iat: Date.now(),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signatureB64 = signPayload(payloadB64, secret);
  const token = `${payloadB64}.${signatureB64}`;

  // Set secure, httpOnly cookie
  const cookie = `trusted_ip_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttlDays * 24 * 60 * 60}; Secure`;
  res.setHeader('Set-Cookie', cookie);

  return res.status(200).json({ ok: true, ip: clientIp, trusted_until: new Date(exp).toISOString() });
}

