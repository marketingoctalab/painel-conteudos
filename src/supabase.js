import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Avisa no console se as credenciais não estiverem configuradas no .env
export const supabaseReady = Boolean(url && key && !url.includes('SEU-PROJETO'));
if (!supabaseReady) {
  console.warn('[Supabase] Credenciais ausentes. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env');
}

export const supabase = supabaseReady ? createClient(url, key) : null;
