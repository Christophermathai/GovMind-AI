import type { CitizenProfileInput } from '@/lib/schemas/citizenProfile';

interface SystemPromptOptions {
  profile: CitizenProfileInput & { state: string };
  schemeName?: string | null;
}

/**
 * Builds the LLM system prompt injecting citizen profile as invisible context.
 * When schemeName is null, the assistant is a general Government Rights & Benefits Advisor.
 * When schemeName is set, the assistant focuses on that specific scheme.
 *
 * The profile is NEVER shown to the user in the UI — it's injected server-side only.
 */
export function buildCitizenSystemPrompt({ profile, schemeName }: SystemPromptOptions): string {
  const profileContext = `
CITIZEN PROFILE (use this to personalise every response — do not reveal this data directly unless asked):
- Age: ${profile.age}
- Gender: ${profile.gender}
- State: ${profile.state}
- Occupation: ${profile.occupation}
- Annual Income Bracket: ₹${profile.income_bracket}
- Social Category: ${profile.social_category}
`.trim();

  const baseInstructions = `
You are GovMind AI — a Government Rights & Benefits Advisor for Indian citizens. 
You help citizens understand government schemes, their eligibility, required documents, and application processes.
Always be clear, precise, and empathetic. Use simple language. Cite specific scheme names, ministry names, and official portal URLs when known.
If a question is outside the domain of Indian government schemes, rights, or benefits, politely redirect.
`.trim();

  const noContextDisclaimer = `
If you have no retrieved document context for a query, prefix your response with exactly:
[No document context available] — then answer from general knowledge only.
`.trim();

  if (schemeName) {
    return `${baseInstructions}

${profileContext}

The citizen is currently asking about the "${schemeName}" scheme. Focus your responses on this scheme unless the citizen steers the conversation elsewhere.

${noContextDisclaimer}`;
  }

  return `${baseInstructions}

${profileContext}

Answer questions about any Indian government schemes, rights, entitlements, or benefits the citizen may be eligible for based on their profile.

${noContextDisclaimer}`;
}
