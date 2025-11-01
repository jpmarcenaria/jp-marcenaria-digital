import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const canLogToDb = !!(supabaseUrl && supabaseKey);
const supabase = canLogToDb ? createClient(String(supabaseUrl), String(supabaseKey)) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ip, path, ua, trusted, at } = req.body || {};

  const entry = {
    ip: String(ip || ''),
    path: String(path || ''),
    user_agent: String(ua || req.headers['user-agent'] || ''),
    trusted: !!trusted,
    created_at: at ? String(at) : new Date().toISOString(),
  };

  // Best-effort: log to DB if configured, otherwise just console
  try {
    if (supabase) {
      await supabase.from('access_logs').insert(entry);
    } else {
      console.log('[access_log]', entry);
    }
  } catch (e) {
    console.warn('Failed to persist access log:', e);
  }

  return res.status(200).json({ ok: true });
}

