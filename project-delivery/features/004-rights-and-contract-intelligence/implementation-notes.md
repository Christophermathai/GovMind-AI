# Implementation Notes: Rights & Contract Intelligence

Feature ID: `004-rights-and-contract-intelligence`  
Last Updated: 2026-10-16  

---

## 1. Next.js 16 / React 19 Compatibility (AGENTS.md Enforcement)

Per the workspace rule in `AGENTS.md`:
> *"This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data."*

Key rules for Feature 004:
- **Dynamic Route Params:** In Next.js 16, route `params` are asynchronous Promises (e.g., `const { id } = await params;`).
- **Server Actions:** Mark server action files strictly with `'use server'` at top level. Do not pass non-serializable objects (such as raw browser `File` instances) directly across Server Action boundaries; pass extracted string text or ArrayBuffers.
- **Client Components:** Use `'use client'` on any component handling local UI state, drag-and-drop file inputs, tabs, or modal accordions.

---

## 2. Vercel AI SDK v6 & Local Ollama Streaming

GovMind AI uses AI SDK v6 (`ai` v6.0.219 and `@ai-sdk/openai` v3.0.80):
- **Ollama Compatibility Layer:** Use `createOpenAI` pointed at the local Ollama `/v1` endpoint:
  ```ts
  const ollama = createOpenAI({
    baseURL: (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434') + '/v1',
    apiKey: 'ollama',
  });
  ```
- **Model Target:** Use `phi4-mini` for fast local reasoning.
- **Message Conversion:** Use `convertToModelMessages()` when converting UIMessage arrays for `streamText` or `generateText`.

---

## 3. Statutory & Rights Grounding Reference

When analyzing agreements in the Indian legal context:
- **Non-Compete Restrictions:** Under Section 27 of the *Indian Contract Act, 1872*, post-employment non-compete covenants are generally void and unenforceable as agreements in restraint of trade. Flag any post-termination non-compete clause as High Risk with this explicit statutory citation.
- **Notice Periods & Unilateral Severance:** Clauses mandating long notice periods for employees (e.g., 90 days) but allowing immediate employer termination without severance or cause must be tagged as an unbalanced risk.
- **Tenancy Deposit Ceilings:** Under the *Model Tenancy Act*, residential security deposits are capped at a maximum of 2 months' rent. Clauses demanding 6-10 months' deposit or unilateral forfeiture must be flagged.
- **Mandatory Arbitration / Exclusive Jurisdiction:** Clauses specifying remote or foreign arbitration venues should be highlighted as high potential cost burdens.

---

## 4. Design Token Compliance (Industrial Intelligence Console)

All new components must adhere strictly to the existing design system tokens:
- **Surfaces:** `bg-zinc-950` (base container), `bg-zinc-900` / `bg-zinc-900/50` (cards, panels)
- **Borders:** `border-zinc-800` (hover: `border-zinc-700`)
- **Typography:**
  - Headers & Body: `font-sans text-white` / `text-zinc-300`
  - Badges, Meta, Counters: `font-mono text-xs uppercase tracking-wider`
- **Severity Colors:**
  - High Risk: `border-red-900/60 bg-red-950/20 text-red-400`
  - Warning/Attention: `border-amber-900/60 bg-amber-950/20 text-amber-400`
  - Standard/Fair: `border-emerald-900/60 bg-emerald-950/20 text-emerald-400`
  - Missing Protection: `border-purple-900/60 bg-purple-950/20 text-purple-400`
- **JSX Terminal Strings:** Always escape raw terminal prompts (e.g., use `&gt;` or `{'SYS>'}`) per `project-delivery/learnings.md`.
