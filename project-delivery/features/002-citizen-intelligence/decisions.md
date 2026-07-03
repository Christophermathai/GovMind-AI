# Decisions: Citizen Intelligence

1. **State Management for Wizard:** `useState` + React Hook Form `useForm` per step. Zustand was considered but ruled out — the wizard state is transient and session-scoped, making global store overhead unjustified. If the wizard grows beyond 5 steps, revisit Zustand.

2. **Anonymous Profile Key:** Session UUID generated client-side and stored in `localStorage`. Supabase Auth was rejected for v1 because adding a sign-in gate before showing scheme results kills conversion. The `session_uuid` approach allows a future migration where an authenticated user links their profile retrospectively.

3. **Rule Engine Location:** Next.js Server Action. The rule engine reads from `scheme_registry` in Supabase, so it must run server-side. Rejected client-side rule evaluation because it would require shipping the full scheme dataset to the browser.

4. **Scheme Registry Storage:** Supabase `scheme_registry` table with typed columns (not JSON blobs). Enables SQL-level filtering and future admin tooling without code changes.

5. **LLM Streaming:** Vercel AI SDK (`ai` package) is the preferred path. Fallback if incompatible with Next.js 16: custom `ReadableStream` + `TextEncoder` in the route handler with a manual fetch-streaming client. Decision to be confirmed in Phase 2.

6. **Dual-Mode UI (Dashboard + Chat):** Both Dashboard Mode and Chat Mode are first-class surfaces on the results page, accessible via a persistent tab switcher (`ModeTab`). Rejected the original single-primary-surface approach because it forced users into one mental model. The tab switcher gives versatility: structured scheme discovery (dashboard) and free-form conversational research (chat) are equally accessible. Mode state is held in `ResultsShell` (Client Component) — no URL change needed on tab switch, which avoids unnecessary navigations.

7. **Retrieval-Augmented Generation:** `POST /api/retrieve` is called from the server-side route handler (`app/api/chat/route.ts`), not from the client. This keeps the retrieval call server-side and prevents exposing the Supabase service key to the browser.
