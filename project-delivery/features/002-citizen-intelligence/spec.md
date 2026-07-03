# Functional Spec: Citizen Intelligence

## Overview

Citizens, students, and job seekers do not know which government schemes and benefits they qualify for. The Citizen Intelligence module collects a user's personal context through a guided multi-step wizard, persists a profile, and then surfaces relevant schemes through two complementary experiences: a **deterministic eligibility dashboard** (rule engine) and a **context-aware conversational AI assistant** (LLM + RAG). The feature builds directly on top of the Government Knowledge Engine (001) as its retrieval backbone.

---

## What Exists Today

- **001 – Government Knowledge Engine** is live: PDF ingestion, chunking, embeddings via fastembed, Supabase pgvector, and a retrieval API at `POST /api/retrieve` are all implemented.
- **008 – Global Frontend Shell** provides the Sidebar, Omnibar, and BentoCard layout primitives in the Industrial/Obsidian design system.
- No citizen-facing UI exists. No citizen profile schema exists in the database. No eligibility rule engine exists.

---

## What Changes

1. **Citizen Profile Wizard** — a multi-step onboarding flow that collects baseline profile data (age, state, occupation, income bracket, category, gender).
2. **Citizen Profile persistence** — a Supabase `citizen_profiles` table that stores profile data with an optional Supabase Auth user association. Profiles are keyed by session UUID for anonymous users.
3. **Deterministic Rule Engine** — a Next.js Server Action that checks hard eligibility bounds (age ranges, income caps, occupation codes) against a structured scheme registry and returns matched/unmatched schemes.
4. **Mode Switcher** — a persistent tab/toggle on the results page letting the user switch between Dashboard Mode and Chat Mode without losing context.
5. **Dashboard Mode (primary)** — a results surface showing matched scheme cards with eligibility status, matched/unmet criteria, and a per-scheme "Ask AI →" CTA.
6. **Chat Mode (primary)** — a standalone full-panel conversational AI assistant that has the citizen profile injected into the system prompt. The user can ask free-form questions about any scheme, right, or benefit — not limited to pre-matched results.
7. **Per-scheme Chat (from Dashboard)** — clicking "Ask AI →" on a scheme card switches to Chat Mode with that scheme pre-seeded as the opening message.
8. **Retrieval Integration** — all chat interactions (both standalone Chat Mode and per-scheme chat) call `POST /api/retrieve` to ground LLM responses in actual Government Knowledge Engine document chunks.

---

## Functional Requirements

- **FR-1:** The wizard must collect: age (integer), state (Indian state/UT), occupation category (student / employed / self-employed / farmer / unemployed / other), annual income bracket (₹ range), social category (General / OBC / SC / ST / EWS), and gender.
- **FR-2:** All wizard fields must be validated client-side with Zod before submission.
- **FR-3:** On completion, the wizard must persist the profile to Supabase `citizen_profiles` and redirect the user to the results page, defaulting to Dashboard Mode.
- **FR-4:** The results page must expose a persistent mode switcher (tab or toggle) allowing the user to move between Dashboard Mode and Chat Mode at any time without data loss.
- **FR-5:** The rule engine Server Action must return an array of scheme results, each with: `scheme_id`, `scheme_name`, `ministry`, `eligibility_status` (eligible | ineligible | check-required), `matched_criteria`, `unmet_criteria`.
- **FR-6:** Dashboard Mode must render scheme results as BentoCards within the existing shell layout.
- **FR-7:** Clicking "Ask AI →" on any scheme BentoCard must switch to Chat Mode with the scheme name pre-injected as the opening user message.
- **FR-8:** Chat Mode must be a standalone full-panel conversational assistant — the user can ask about any scheme or right, not only the matched ones.
- **FR-9:** Both Chat Mode and the per-scheme chat must inject the citizen profile invisibly into the LLM system prompt on every turn.
- **FR-10:** Both chat surfaces must call `POST /api/retrieve` to fetch relevant document chunks and include them in the LLM context window.
- **FR-11:** LLM responses must be streamed to the client (not buffered).
- **FR-12:** The wizard must be completable anonymously; no sign-in gate before profile creation.

---

## Edge Cases

- **EC-1:** User submits an age outside realistic bounds (e.g. 0, 150) — wizard must reject with a Zod error.
- **EC-2:** Retrieval API returns zero chunks for a scheme query — the chat assistant must not hallucinate; it must tell the user it has no specific document context and answer from general knowledge only with a clear disclaimer.
- **EC-3:** User navigates back mid-wizard — state must be preserved across steps without re-rendering the entire form.
- **EC-4:** The rule engine finds no matching schemes — the dashboard must show an empty state with a CTA to chat with the general assistant.
- **EC-5:** LLM stream is interrupted — the UI must show a partial response and a retry affordance, not a blank screen.
- **EC-6:** Multiple browser tabs with the same session — profile writes must be idempotent (upsert, not insert).

---

## Out of Scope

- User authentication / sign-in (profile keyed by session UUID is sufficient for v1).
- Real-time scheme updates / webhooks from government portals.
- Multi-language support (English-only for v1).
- Mobile-native apps.
- Admin tooling for managing the scheme registry.

---

## Dependencies

- **001 – Government Knowledge Engine:** `POST /api/retrieve` must be live and returning results.
- **008 – Global Frontend Shell:** Sidebar, BentoCard, and design tokens must be present.
- **Supabase:** `citizen_profiles` migration must be applied. Auth is optional but the table must support nullable `user_id`.
- **Vercel AI SDK** (`ai` package): Required for streaming LLM responses. Must confirm compatibility with Next.js 16.2.9 before install.
- **React Hook Form + Zod:** Required for wizard form handling and validation.
- **LLM Provider:** An LLM API key (e.g. OpenAI or a compatible provider) must be present in `.env`.

---

## Acceptance Criteria

- **AC-1:** A user can complete the 6-field wizard in under 2 minutes and land on a populated Eligibility Dashboard.
- **AC-2:** The Eligibility Dashboard correctly shows at least one scheme as "eligible" for a test profile of: age=22, state=Kerala, occupation=student, income=₹0–2.5L, category=General, gender=Male.
- **AC-3:** Clicking "Ask AI" on a scheme card switches to Chat Mode with the scheme pre-seeded and a streaming response is visible within 3 seconds.
- **AC-3b:** Switching to Chat Mode directly (without clicking a scheme card) presents an empty input and a welcome prompt; the citizen profile is confirmed injected by checking server logs.
- **AC-4:** The chat response cites at least one retrieved document chunk for a scheme that has coverage in the Knowledge Engine.
- **AC-5:** Re-submitting the same session UUID results in an upsert, not a duplicate row, in `citizen_profiles`.
- **AC-6:** The application builds without TypeScript errors (`next build`).

---

## Glossary

| Term | Definition |
|---|---|
| Citizen Profile | A structured object capturing the personal context of a user used to determine eligibility |
| Eligibility Dashboard | The UI surface showing matched government schemes for a citizen profile |
| Rule Engine | A deterministic function that checks hard eligibility criteria (age, income, category) against a scheme registry |
| Scheme Registry | A structured in-code (or Supabase table) list of government schemes with their eligibility rules |
| Context-Aware Chat | A chat session where the citizen profile is injected into the LLM system prompt on every turn |
| Session UUID | A client-generated UUID persisted in `localStorage` to identify anonymous citizen profiles |
