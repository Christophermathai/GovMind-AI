import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using the service role key.
// ONLY use in Server Actions and Route Handlers — never import into Client Components.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
