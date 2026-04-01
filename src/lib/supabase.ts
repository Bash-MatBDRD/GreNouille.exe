import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __NEXUS_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
  }
}

let _client: SupabaseClient | null = null;

function getConfig() {
  return {
    url: window.__NEXUS_CONFIG__?.supabaseUrl || (import.meta.env.VITE_SUPABASE_URL as string) || '',
    key: window.__NEXUS_CONFIG__?.supabaseAnonKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
  };
}

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const { url, key } = getConfig();
  _client = createClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-anon-key'
  );
  return _client;
}

export const isSupabaseConfigured = () => {
  const { url, key } = getConfig();
  return Boolean(url && key && url !== 'https://placeholder.supabase.co');
};

export async function initSupabase(): Promise<void> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      window.__NEXUS_CONFIG__ = {
        supabaseUrl: data.supabaseUrl || '',
        supabaseAnonKey: data.supabaseAnonKey || '',
      };
    }
  } catch {
    // fall back to env vars
  }
  // Force re-init client with loaded config
  _client = null;
  getSupabase();
}

// Lazy proxy so imports work even before initSupabase() is called
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = (client as any)[prop];
    if (typeof value === 'function') return value.bind(client);
    return value;
  },
});
