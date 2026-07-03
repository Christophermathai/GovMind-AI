import { createClient } from '@supabase/supabase-js';

// Browser-safe Supabase client using the publishable key.
// Used only in Client Components for anonymous reads/writes.
// Never use SUPABASE_SERVICE_ROLE_KEY on the client side.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabaseBrowser = createClient(supabaseUrl, supabaseKey);
