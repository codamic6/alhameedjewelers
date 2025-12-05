import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// A little hack to make sure the client is not initialized during build time if env vars are not present
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ error: { message: 'Supabase not initialized' } }),
            remove: () => Promise.resolve({ error: { message: 'Supabase not initialized' } }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        },
      };
