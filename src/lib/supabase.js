import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please verify that VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) are defined in your .env.local file.'
  );
}

// Security guard: Ensure service role / secret keys are not exposed in client code
if (supabaseAnonKey.startsWith('sb_secret_')) {
  throw new Error(
    'Security violation: Secret key detected in client-side configuration. Use only publishable/anon keys on the frontend.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
