'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { INCOME_BRACKET_ORDER } from '@/lib/schemas/citizenProfile';

export type EligibilityStatus = 'eligible' | 'ineligible' | 'check-required';

export interface SchemeResult {
  scheme_id: string;
  scheme_name: string;
  ministry: string;
  description: string;
  eligibility_status: EligibilityStatus;
  matched_criteria: string[];
  unmet_criteria: string[];
}

interface SchemeRow {
  id: string;
  name: string;
  ministry: string;
  description: string;
  min_age: number | null;
  max_age: number | null;
  max_income_bracket: string | null;
  eligible_categories: string[] | null;
  eligible_occupations: string[] | null;
  eligible_genders: string[] | null;
}

interface ProfileRow {
  age: number;
  state: string;
  occupation: string;
  income_bracket: string;
  social_category: string;
  gender: string;
}

export type CheckEligibilityResult =
  | { success: true; results: SchemeResult[]; profile: ProfileRow }
  | { success: false; error: string };

/**
 * Deterministic rule engine: matches a citizen profile against all schemes in the registry.
 * Runs server-side only — reads from Supabase, never exposed to the client directly.
 */
export async function checkEligibility(
  sessionUuid: string,
): Promise<CheckEligibilityResult> {
  // 1. Fetch the citizen profile
  const { data: profile, error: profileError } = await supabaseServer
    .from('citizen_profiles')
    .select('age, state, occupation, income_bracket, social_category, gender')
    .eq('session_uuid', sessionUuid)
    .single<ProfileRow>();

  if (profileError || !profile) {
    return { success: false, error: 'Citizen profile not found. Please complete the wizard first.' };
  }

  // 2. Fetch all schemes
  const { data: schemes, error: schemesError } = await supabaseServer
    .from('scheme_registry')
    .select('id, name, ministry, description, min_age, max_age, max_income_bracket, eligible_categories, eligible_occupations, eligible_genders');

  if (schemesError || !schemes) {
    return { success: false, error: 'Failed to load scheme registry.' };
  }

  // 3. Evaluate each scheme
  const results: SchemeResult[] = (schemes as SchemeRow[]).map((scheme) => {
    const matched: string[] = [];
    const unmet: string[] = [];

    // Age — lower bound
    if (scheme.min_age !== null) {
      if (profile.age >= scheme.min_age) {
        matched.push(`Age ≥ ${scheme.min_age}`);
      } else {
        unmet.push(`Age must be ≥ ${scheme.min_age} (yours: ${profile.age})`);
      }
    }

    // Age — upper bound
    if (scheme.max_age !== null) {
      if (profile.age <= scheme.max_age) {
        matched.push(`Age ≤ ${scheme.max_age}`);
      } else {
        unmet.push(`Age must be ≤ ${scheme.max_age} (yours: ${profile.age})`);
      }
    }

    // Income bracket (≤ max means any bracket with order ≤ max bracket's order)
    if (scheme.max_income_bracket !== null) {
      const userOrder = INCOME_BRACKET_ORDER[profile.income_bracket] ?? 99;
      const maxOrder = INCOME_BRACKET_ORDER[scheme.max_income_bracket] ?? 0;
      if (userOrder <= maxOrder) {
        matched.push(`Income ≤ ₹${scheme.max_income_bracket}`);
      } else {
        unmet.push(`Annual income must be ≤ ₹${scheme.max_income_bracket} (yours: ₹${profile.income_bracket})`);
      }
    }

    // Social category
    if (scheme.eligible_categories !== null) {
      if (scheme.eligible_categories.includes(profile.social_category)) {
        matched.push(`Category: ${profile.social_category}`);
      } else {
        unmet.push(`Category must be one of: ${scheme.eligible_categories.join(', ')} (yours: ${profile.social_category})`);
      }
    }

    // Occupation
    if (scheme.eligible_occupations !== null) {
      if (scheme.eligible_occupations.includes(profile.occupation)) {
        matched.push(`Occupation: ${profile.occupation}`);
      } else {
        unmet.push(`Occupation must be one of: ${scheme.eligible_occupations.join(', ')} (yours: ${profile.occupation})`);
      }
    }

    // Gender
    if (scheme.eligible_genders !== null) {
      if (scheme.eligible_genders.includes(profile.gender)) {
        matched.push(`Gender: ${profile.gender}`);
      } else {
        unmet.push(`Gender must be one of: ${scheme.eligible_genders.join(', ')} (yours: ${profile.gender})`);
      }
    }

    // Determine eligibility status
    let eligibility_status: EligibilityStatus;
    if (unmet.length === 0) {
      eligibility_status = 'eligible';
    } else if (matched.length > 0 && unmet.length <= 1) {
      eligibility_status = 'check-required';
    } else {
      eligibility_status = 'ineligible';
    }

    return {
      scheme_id: scheme.id,
      scheme_name: scheme.name,
      ministry: scheme.ministry,
      description: scheme.description,
      eligibility_status,
      matched_criteria: matched,
      unmet_criteria: unmet,
    };
  });

  // Sort: eligible first, then check-required, then ineligible
  const order: Record<EligibilityStatus, number> = { eligible: 0, 'check-required': 1, ineligible: 2 };
  results.sort((a, b) => order[a.eligibility_status] - order[b.eligibility_status]);

  return { success: true, results, profile };
}
