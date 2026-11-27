import { createClient } from '@supabase/supabase-js';

export function supabaseClients(requireAuth = true) {
  const env = process.env;
  const url = (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL)?.trim();
  const publicKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY
    || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY)?.trim();
  const key = (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key || (requireAuth && !publicKey)) throw new Error('SUPABASE_CONFIGURATION_MISSING');
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  return { db: createClient(url, key, options), auth: requireAuth ? createClient(url, publicKey, options).auth : null };
}
