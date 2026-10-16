# Implementation Plan: Rights & Contract Intelligence

Feature ID: `004-rights-and-contract-intelligence`  
Last Updated: 2026-10-16  
Status: Planned

---

## Phase 1: Database Schema & Migration
- [ ] Create Supabase migration `supabase/migrations/20240103000000_contract_intelligence.sql`.
- [ ] Define `contract_analyses` table:
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `session_uuid uuid NOT NULL`
  - `contract_name text NOT NULL`
  - `contract_type text NOT NULL`
  - `risk_score text NOT NULL` (e.g. `'high'`, `'moderate'`, `'low'`)
  - `summary text NOT NULL`
  - `clauses jsonb NOT NULL DEFAULT '[]'::jsonb`
  - `missing_protections jsonb NOT NULL DEFAULT '[]'::jsonb`
  - `created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL`
- [ ] Run migration using `npm run migrate`.

---

## Phase 2: Domain Schemas, Prompts & Pre-Loaded Contract Fixtures
- [ ] Create `lib/schemas/contractAnalysis.ts`:
  - TypeScript types and Zod schemas for `ClauseItem`, `MissingProtection`, `ContractAnalysisResult`.
- [ ] Create `lib/prompts/contractSystemPrompt.ts`:
  - System prompt for clause risk breakdown, plain-language simplification, and conversational Q&A.
- [ ] Create `lib/fixtures/sampleContracts.ts`:
  - Two realistic test contracts:
    1. *Tech Startup Employment Agreement* (with aggressive 90-day notice, non-compete, full IP assignment, and penalty clauses).
    2. *Residential Lease Agreement* (with 10% rent escalation, 3-year lock-in, and security deposit forfeiture rules).

---

## Phase 3: Server Actions & Analysis Engine
- [ ] Create `app/rights/actions.ts`:
  - `analyzeContractAction(text: string, title: string, type: string, sessionUuid: string)`:
    - Runs heuristic clause categorization + semantic risk assessment.
    - Saves analysis result to `contract_analyses`.
  - `chatWithContractCounsel(analysisId: string, query: string, history: Message[])`:
    - Retrieves contract context from database.
    - Calls local Ollama `phi4-mini` via `@ai-sdk/openai`.
    - Returns plain-language advice with specific clause citations.

---

## Phase 4: UI Components (Industrial Console Design)
- [ ] `components/rights/ContractUploader.tsx`:
  - Clean dropzone + "Try Sample Contract" quick selection cards.
- [ ] `components/rights/RiskScoreBanner.tsx`:
  - Top visual summary of document risk, high-risk clause count, and statutory warnings.
- [ ] `components/rights/ClauseCard.tsx` & `components/rights/ClauseList.tsx`:
  - Category filters: `All`, `High Risk`, `Termination & Notice`, `Auto-Renewal`, `Non-Compete`, `Missing Protections`.
  - Expandable card with: Verbatim Quote, Plain English Meaning, Real-World Impact, and Negotiation Counter-Proposal.
- [ ] `components/rights/ContractChat.tsx`:
  - Industrial terminal chat with prompt suggestions ("Is this notice period normal?", "What happens if I break the lease early?").

---

## Phase 5: Page Assembly (`app/rights/page.tsx`)
- [ ] Build `app/rights/page.tsx` connecting all components in a responsive, split-screen layout.
- [ ] Add legal disclaimer notice in accordance with project ethics standards.
- [ ] Verify navigation link in `components/ui/Sidebar.tsx`.

---

## Phase 6: End-to-End Validation
- [ ] Test sample employment contract analysis.
- [ ] Test sample residential lease analysis.
- [ ] Test conversational Q&A via local Ollama `phi4-mini`.
- [ ] Verify error states (empty file, model timeout, unsupported file formats).
