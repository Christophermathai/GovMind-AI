# Implementation Notes: Citizen Intelligence

## Next.js 16 / React 19 Compatibility

**Read `node_modules/next/dist/docs/` before writing any route handler or Server Action.** This is a hard rule from AGENTS.md. Key areas to verify before coding:

- Server Action declaration syntax (may differ from `'use server'` + exported async function pattern known from earlier versions).
- `ReadableStream` / streaming response API shape in route handlers.
- `cookies()` / `headers()` API if session management is needed.

## Vercel AI SDK Streaming

Before using any `useChat`, `useCompletion`, or `streamText` call, check the installed version's type signatures:

```
node_modules/ai/dist/index.d.ts
```

Do not assume the hook or function names match training data. The API surface has changed significantly across AI SDK versions.

## Supabase Upsert for Citizen Profiles

Use `.upsert({ ...data }, { onConflict: 'session_uuid' })` — not `.insert()`. This satisfies EC-6 (idempotent writes) and AC-5.

## Design Token Compliance

All new components must use the existing Industrial/Obsidian tokens:
- Background: `bg-zinc-950` / `bg-zinc-900`
- Border: `border-zinc-800` (hover: `border-zinc-700`)
- Primary text: `text-white` / `text-zinc-300`
- Muted text: `text-zinc-500` / `text-zinc-400`
- Accent: `text-accent` (CSS variable defined in `globals.css`)
- Font: `font-sans` for body, `font-mono` for data labels and metadata

Do not introduce new color values or a new CSS file without first checking `globals.css` and existing component patterns.

## Scheme Registry Seed Data

The seed must cover at least the AC-2 test profile: age=22, state=Kerala, occupation=student, income=₹0–2.5L, category=General, gender=Male. Suggested seed schemes to confirm this:

- **National Scholarship Portal (NSP):** age 15–30, student, income ≤ ₹2.5L — will match.
- **PM-KISAN:** farmer only — will not match, confirming unmet criteria display.
- **Beti Bachao Beti Padhao:** female only — will not match on gender, confirming gender filter.

## EC-2: Zero Retrieval Chunks

If `POST /api/retrieve` returns an empty array, the system prompt must include an explicit instruction:

> "No document context was retrieved for this scheme. Answer from general knowledge only and clearly prefix your response with: '[No document context available]'."

This prevents silent hallucination.
