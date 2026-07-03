# Implementation Plan: Citizen Intelligence

## Phase 1: Database Migration
- **Goal:** Add `citizen_profiles` table and seed a minimal scheme registry to Supabase.
- **Risk:** Low.
- **Dependencies:** Supabase project credentials in `.env`.
- **Files:**
  - `supabase/migrations/20240102000000_citizen_profiles.sql` [NEW]
  - `supabase/migrations/20240102000001_scheme_registry.sql` [NEW]
- **Steps:**
  1. Create `citizen_profiles` table with columns: `id uuid PK default gen_random_uuid()`, `session_uuid uuid UNIQUE NOT NULL`, `user_id uuid nullable FK auth.users`, `age int`, `state text`, `occupation text`, `income_bracket text`, `social_category text`, `gender text`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`.
  2. Create `scheme_registry` table with columns: `id uuid PK`, `name text`, `ministry text`, `min_age int nullable`, `max_age int nullable`, `max_income_bracket text nullable`, `eligible_categories text[]`, `eligible_occupations text[]`, `eligible_genders text[] nullable`.
  3. Seed 5–8 representative schemes (PM-KISAN, NSP, Beti Bachao, PMEGP, etc.) covering diverse eligibility profiles to enable AC-2 testing.
  4. Run migrations via Supabase CLI or SQL editor.
- **Anti-patterns:** Do not use a single stringified JSON blob for eligibility rules — use typed columns so the rule engine can do direct comparisons.
- **Verification:** Confirm both tables exist and the seed rows are visible in the Supabase Table Editor.

---

## Phase 2: Install Dependencies
- **Goal:** Add required client-side and server-side packages without breaking the existing build.
- **Risk:** Medium — Next.js 16.2.9 is a cutting-edge version; package compatibility must be validated before install. Per AGENTS.md, read `node_modules/next/dist/docs/` before writing code.
- **Dependencies:** Phase 1 complete; dev server must be stopped during install.
- **Files:**
  - `package.json` [MODIFY]
  - `package-lock.json` [MODIFY]
- **Steps:**
  1. Read `node_modules/next/dist/docs/` to confirm Server Actions and streaming response APIs for v16.
  2. Install `react-hook-form`, `zod`, `@hookform/resolvers`.
  3. Install `ai` (Vercel AI SDK) — pin to a version confirmed compatible with Next.js 16 and React 19.
  4. Install `@supabase/supabase-js` if not already present (check `.env` and existing imports first).
  5. Run `npm run build` to verify zero TypeScript errors before proceeding.
- **Anti-patterns:** Do not assume `useChat` / `useCompletion` hook API signatures match training data — verify from installed package types.
- **Verification:** `npm run build` exits with code 0. `npm ls react-hook-form zod ai` shows installed versions.

---

## Phase 3: Citizen Profile Wizard
- **Goal:** Build the multi-step onboarding wizard that collects the 6 profile fields and writes to Supabase.
- **Risk:** Medium — multi-step form state management with React Hook Form requires careful Controller/register usage.
- **Dependencies:** Phase 2.
- **Files:**
  - `app/onboarding/page.tsx` [NEW] — Server Component shell
  - `components/citizen/ProfileWizard.tsx` [NEW] — Client Component, 3-step wizard
  - `components/citizen/WizardStep.tsx` [NEW] — reusable step wrapper
  - `lib/schemas/citizenProfile.ts` [NEW] — Zod schema for all 6 fields
  - `lib/supabase/client.ts` [NEW or REUSE] — browser Supabase client
  - `app/actions/saveProfile.ts` [NEW] — Server Action for upsert to `citizen_profiles`
- **Steps:**
  1. Define the Zod schema in `lib/schemas/citizenProfile.ts` covering all 6 fields with min/max constraints (age: 1–120, state: enum of 36 states/UTs, etc.).
  2. Build `ProfileWizard.tsx` as a Client Component with local step state (`useState`) and `useForm` from React Hook Form with the Zod resolver.
  3. Split fields across 3 logical steps: Step 1 (age, gender, state), Step 2 (occupation, income bracket), Step 3 (social category + review).
  4. On final step submit: generate a session UUID (or retrieve from `localStorage`), call the `saveProfile` Server Action.
  5. `saveProfile` Server Action: `upsert` to `citizen_profiles` on `session_uuid` conflict key. Return the `session_uuid` on success.
  6. On success, `router.push('/dashboard/[session_uuid]')`.
  7. Apply Industrial/Obsidian design tokens (zinc palette, mono font for labels, accent color for CTA button) consistent with Shell design.
- **Anti-patterns:** Do not use a single giant form — use `useFormContext` or pass `control` prop per step. Do not call `router.push` from a Server Action — return the session UUID and let the Client Component navigate.
- **Verification:** Complete wizard end-to-end in browser. Confirm row appears in Supabase `citizen_profiles`. Confirm back-navigation preserves field values.

---

## Phase 4: Mode Switcher, Rule Engine & Dashboard Mode
- **Goal:** Build the deterministic rule engine, the mode-switcher tab bar, and the Dashboard Mode results surface.
- **Risk:** Low-Medium — rule matching logic must be tested against the seed data; tab state must persist across mode switches without re-fetching.
- **Dependencies:** Phase 1 (scheme_registry table), Phase 3 (session_uuid available).
- **Files:**
  - `app/actions/checkEligibility.ts` [NEW] — Server Action
  - `app/dashboard/[sessionId]/page.tsx` [NEW] — Server Component, fetches profile + runs rule engine, passes data to Client layout
  - `components/citizen/ResultsShell.tsx` [NEW] — Client Component housing the mode switcher tab bar and conditional rendering of Dashboard/Chat panels
  - `components/citizen/ModeTab.tsx` [NEW] — tab/toggle component (Dashboard | Chat) in Industrial style
  - `components/citizen/SchemeCard.tsx` [NEW] — BentoCard variant for scheme results
  - `components/citizen/EmptyEligibilityState.tsx` [NEW] — empty state with CTA to Chat Mode
- **Steps:**
  1. `checkEligibility` Server Action: fetch `citizen_profiles` by `session_uuid`, fetch all `scheme_registry` rows, apply filter logic, return structured result array per FR-5.
  2. `app/dashboard/[sessionId]/page.tsx`: call `checkEligibility`, render `ResultsShell` with profile + results as props.
  3. `ResultsShell.tsx`: Client Component with `activeMode` state (`'dashboard' | 'chat'`). Renders `ModeTab` at the top and conditionally renders the Dashboard panel or the Chat panel below it. Mode state persists across switches — neither panel re-mounts on tab change (use CSS show/hide or conditional rendering with stable keys).
  4. `ModeTab.tsx`: two-tab bar (`Dashboard` / `Ask AI`) styled with accent underline for active tab, zinc for inactive. Clicking "Ask AI" on a `SchemeCard` calls `setActiveMode('chat')` and sets a `preSeededScheme` state that the Chat panel reads.
  5. Dashboard panel: renders scheme `SchemeCard` grid. Each card has an "Ask AI →" button that switches mode and pre-seeds the chat.
  6. Handle EC-4: render `EmptyEligibilityState` with CTA that switches to Chat Mode.
- **Anti-patterns:** Do not run the rule engine on the client side. Do not re-fetch the profile on every mode switch.
- **Verification:** Load `/dashboard/[uuid]` for the AC-2 test profile, confirm at least one "eligible" scheme. Switch to Chat Mode and back — confirm no re-fetch and no layout flash.

---

## Phase 5: Chat Mode (Standalone + Per-Scheme)
- **Goal:** Build the full-panel Chat Mode as a first-class surface — both standalone (free-form) and pre-seeded from a scheme card.
- **Risk:** High — Vercel AI SDK streaming compatibility with Next.js 16.2.9 / React 19 is unknown and must be validated in Phase 2 before assuming hook API shapes.
- **Dependencies:** Phase 2 (AI SDK installed), Phase 4 (ResultsShell + mode switcher scaffolded, session profile available), 001 Knowledge Engine (`POST /api/retrieve` live).
- **Files:**
  - `app/api/chat/route.ts` [NEW] — streaming chat route handler
  - `components/citizen/ChatPanel.tsx` [NEW] — full-panel Client Component chat UI (renders inside `ResultsShell` when mode = 'chat')
  - `lib/prompts/citizenSystemPrompt.ts` [NEW] — system prompt builder
- **Steps:**
  1. `lib/prompts/citizenSystemPrompt.ts`: function that takes a `CitizenProfile` and an optional `schemeName` and returns a system prompt string. When `schemeName` is null, the prompt frames the assistant as a general Government Rights & Benefits Advisor. When set, it focuses on the named scheme.
  2. `app/api/chat/route.ts`: POST handler that (a) reads `messages`, `profile`, `schemeName` from request body, (b) calls `POST /api/retrieve` with the latest user message as query, (c) injects retrieved chunks + system prompt into LLM context, (d) returns a streaming response via the Vercel AI SDK stream helper (verify API from installed package types before coding).
  3. `ChatPanel.tsx`: Client Component that renders inside `ResultsShell`. Uses AI SDK chat hook (verify hook name from types). Accepts `preSeededScheme` prop — when non-null, submits the scheme name as the first message on mount. When null, shows a welcome prompt and empty input. Renders Industrial-styled message bubbles, streaming spinner, and a retry affordance for EC-5 partial failures.
  4. `ResultsShell.tsx` (update from Phase 4): pass `preSeededScheme` down to `ChatPanel` when the user clicks "Ask AI →" from a SchemeCard.
- **Anti-patterns:** Do not buffer the full LLM response before sending. Do not expose the raw system prompt in the client response. Do not re-instantiate `ChatPanel` on every scheme click — update `preSeededScheme` prop and let the component handle the new seed message.
- **Verification:**
  - AC-3: Click "Ask AI" on a scheme — Chat Mode opens with scheme pre-seeded, streaming response visible within 3s.
  - AC-3b: Switch to Chat Mode directly — welcome prompt shown, profile confirmed injected via server logs.
  - AC-4: Chat response cites at least one retrieved document chunk.
  - EC-2: Query a scheme with no document coverage — response prefixed with `[No document context available]`.

---

## Critical Path

```
Phase 1 (DB) → Phase 2 (Deps) → Phase 3 (Wizard) → Phase 4 (Dashboard) → Phase 5 (Chat)
```

Each phase is a hard dependency on its predecessor.

---

## Riskiest Phase

**Phase 5 (Chat).** The Vercel AI SDK streaming compatibility with Next.js 16.2.9 and React 19 is the single biggest unknown. If the SDK does not support this version cleanly, the fallback is a custom `ReadableStream` response from the route handler and a manual `EventSource` or `fetch` with streaming on the client — more code, same outcome.

---

## Project-Specific Constraints

- **Next.js 16.2.9 / React 19:** Per AGENTS.md, read `node_modules/next/dist/docs/` before writing route handlers or Server Actions. APIs may differ from training data.
- **Industrial/Obsidian design system:** All new UI must use existing design tokens (zinc palette, accent color, mono font for data labels). No new global CSS without explicit justification.
- **Free infrastructure target:** Do not introduce paid-only AI APIs without a fallback. Prefer models accessible via free tiers (OpenAI free tier, or a local Ollama instance).
