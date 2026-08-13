import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

function getValidSupabaseUrl(urlRaw?: string): string {
  if (!urlRaw || typeof urlRaw !== 'string') return 'https://demo.supabase.co';
  let formatted = urlRaw.trim();
  if (!formatted) return 'https://demo.supabase.co';
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }
  try {
    const parsed = new URL(formatted);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return formatted;
    }
  } catch {
    // fallback if URL constructor fails
  }
  return 'https://demo.supabase.co';
}

const supabaseUrl = getValidSupabaseUrl(env.VITE_SUPABASE_URL);
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY && String(env.VITE_SUPABASE_ANON_KEY).trim()) || 'demo-anon-key';

export const isSupabaseConfigured = (): boolean => {
  const rawUrl = env.VITE_SUPABASE_URL;
  const rawKey = env.VITE_SUPABASE_ANON_KEY;
  if (!rawUrl || !rawKey) return false;
  const strUrl = String(rawUrl).trim();
  const strKey = String(rawKey).trim();
  if (strUrl.includes('your-supabase-project') || strUrl.includes('demo.supabase.co')) return false;
  if (strKey.includes('your-supabase-anon-key') || strKey === 'demo-anon-key') return false;
  
  try {
    const formatted = strUrl.startsWith('http') ? strUrl : `https://${strUrl}`;
    new URL(formatted);
    return true;
  } catch {
    return false;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

