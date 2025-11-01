import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const xfwd = (req.headers['x-forwarded-for'] || '').toString();
  const ip = xfwd ? xfwd.split(',')[0].trim() : (req.socket.remoteAddress || '');
  return res.status(200).json({ ip });
}

