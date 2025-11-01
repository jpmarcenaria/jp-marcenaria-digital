import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

function verifyToken(token: string | undefined, secret: string): any | null {
  if (!token) return null;
  try {
    const [payloadB64, signatureB64] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
    if (expected !== signatureB64) return null;
    return JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function issueCookie(payload: any, secret: string, days: number): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signatureB64 = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const token = `${payloadB64}.${signatureB64}`;
  const maxAge = days * 24 * 60 * 60;
  return `trusted_ip_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.VERCEL_IP_TRUST_SECRET;
  if (!secret) return res.status(500).json({ error: 'Missing secret' });

  const token = (req.cookies || {})['trusted_ip_token'];
  const payload = verifyToken(token, secret) || { ips: [], user: process.env.AUTH_USERNAME || 'user', iat: Date.now() };

  if (req.method === 'GET') {
    return res.status(200).json({ ips: payload.ips || [] });
  }

  if (req.method === 'DELETE') {
    const ip = String(req.query.ip || '');
    payload.ips = (payload.ips || []).filter((e: any) => e.ip !== ip);
    const cookie = issueCookie(payload, secret, 90);
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST') {
    const { ip, days = 90 } = req.body || {};
    const exp = Date.now() + Number(days) * 24 * 60 * 60 * 1000;
    const list = (payload.ips || []).filter((e: any) => e.ip !== ip);
    list.push({ ip: String(ip), exp });
    payload.ips = list;
    const cookie = issueCookie(payload, secret, Number(days));
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true, ip });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

