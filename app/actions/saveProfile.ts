'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { citizenProfileSchema, CitizenProfileInput } from '@/lib/schemas/citizenProfile';

export type SaveProfileResult =
  | { success: true; sessionUuid: string }
  | { success: false; error: string };

/**
 * Upserts a citizen profile keyed by session_uuid.
 * Idempotent — safe to call multiple times with the same session UUID (EC-6, AC-5).
 * Returns the session UUID on success so the client can navigate to the dashboard.
 * Does NOT call router.push — the Client Component handles navigation.
 */
export async function saveProfile(
  sessionUuid: string,
  data: CitizenProfileInput,
): Promise<SaveProfileResult> {
  // Validate on the server as a second layer (client already validates with Zod)
  const parsed = citizenProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { error } = await supabaseServer
    .from('citizen_profiles')
    .upsert(
      {
        session_uuid: sessionUuid,
        age: parsed.data.age,
        state: parsed.data.state,
        occupation: parsed.data.occupation,
        income_bracket: parsed.data.income_bracket,
        social_category: parsed.data.social_category,
        gender: parsed.data.gender,
      },
      { onConflict: 'session_uuid' },
    );

  if (error) {
    console.error('[saveProfile] Supabase upsert error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, sessionUuid };
}
