# Functional Specification: Rights & Contract Intelligence

Feature ID: `004-rights-and-contract-intelligence`  
Last Updated: 2026-10-16  
Status: Draft

---

## 1. Executive Summary

Millions of citizens, employees, tenants, and MSME owners enter into binding legal agreements without understanding dense, adversarial legalese. Hidden lock-in clauses, automatic renewals without notice, unreasonable non-compete agreements, and one-sided indemnity burdens frequently disadvantage signers.

The **Rights & Contract Intelligence** module provides an automated, explainable document audit and advisory system. Users can upload contracts (employment contracts, rental/lease agreements, loan terms, and vendor SLAs) to receive:
1. **Automated Clause Risk Assessment** (categorizing clauses by risk severity: High, Medium, Standard, and Missing Protections).
2. **Plain-Language Explanations** ("What this says" vs. "What it actually means for you").
3. **Statutory Rights Benchmarking** (checking whether clauses violate or fall short of baseline labor laws, tenant protections, or standard consumer rights).
4. **Interactive Contract AI Counsel** (an interactive chat assistant grounded directly in the uploaded contract's text).

---

## 2. What Exists Today vs. What Changes

### Existing System Capabilities
- **001 (Knowledge Engine):** FastAPI document processor (`/ingest`, `/embed-query`), Supabase vector search (`match_documents`).
- **002 (Citizen Intelligence):** Multi-step wizard, deterministic rule engine for citizen schemes, streaming chat via Ollama.
- **003 (Business Compliance):** Compliance task checklist and business advisory chat.
- **008 (Global Frontend Shell):** Industrial terminal aesthetic, Bento grid primitives, fixed navigation sidebar (`/rights` route already reserved in `Sidebar.tsx`).

### New Additions for Module 004
1. **New Route & Layout (`app/rights/page.tsx`):**
   - Upload & Analysis View: Drag-and-drop contract uploader.
   - Dual-pane Audit View:
     - **Left Pane:** Executive summary, risk score meter, categorized clause list with filter badges (All, High Risk, Auto-Renewals, Termination, Missing Protections).
     - **Right Pane:** Interactive Contract Intelligence Chat panel with pre-seeded quick-prompt buttons ("Is this termination clause standard?", "What happens if I leave before 1 year?", "Can the landlord increase rent mid-term?").
2. **Database Table (`supabase/migrations/20240103000000_contract_intelligence.sql`):**
   - `contract_analyses`: Stores analyzed contract records, parsed clauses, identified risks, and session associations.
3. **Backend & Extraction Pipeline:**
   - Server Action / API endpoint for contract text extraction & structural clause analysis.
   - Analysis engine utilizing structured LLM analysis (`phi4-mini` via Ollama).
4. **Dedicated System Prompt (`lib/prompts/contractSystemPrompt.ts`):**
   - High-rigor legal extraction instructions instructing the model to extract verbatim quotes, explain implications in plain language, flag potential statutory friction, and present missing protective covenants.
5. **Ethical Legal Disclaimer Banner:**
   - Explicit disclaimer that the tool provides educational document simplification and risk highlighting, not certified legal representation or legal validity opinions.

---

## 3. Functional Requirements

### FR-1: Document Upload & Input
- **FR-1.1:** Support PDF and plain-text file uploads up to 10MB.
- **FR-1.2:** Provide pre-loaded demo contract templates (e.g., "Standard Startup Employment Agreement", "Residential Tenancy Agreement") so users can immediately test the module without having to supply a sensitive personal contract.
- **FR-1.3:** Display upload progress, page count, and status indicators.

### FR-2: Clause Extraction & Classification
- **FR-2.1:** Extract and segment clauses into standard legal categories:
  - `termination_and_notice`: Notice period requirements, severance, grounds for immediate dismissal, cure periods.
  - `auto_renewal`: Lock-in periods, automatic extension deadlines, price hike triggers on renewal.
  - `non_compete_and_ip`: Post-employment restrictions, IP assignment breadth, moonlighting clauses.
  - `penalties_and_indemnity`: Financial penalties, liquidated damages, unilateral liability.
  - `dispute_resolution`: Mandatory arbitration, governing law, jurisdiction limitations.
- **FR-2.2:** Assign a risk severity badge to each analyzed clause:
  - **High Risk (Red):** Overly punitive, one-sided, or likely unenforceable/abusive clauses.
  - **Caution / Attention (Yellow):** Clauses requiring negotiation or clarification before signing.
  - **Standard / Fair (Green):** Industry-standard, balanced protections.
  - **Missing Protection (Purple):** Expected standard protections that are conspicuously absent (e.g., lack of employer notice, no security deposit refund timeline).

### FR-3: Plain-Language Translation & Actionable Advice
- **FR-3.1:** For every flagged clause, provide:
  - Verbatim excerpt from the document.
  - "Plain English Meaning": 1-2 sentence translation free of legalese.
  - "Why This Matters": Concrete risks or real-world implications for the signer.
  - "Suggested Counter-Proposal": Sample revision wording the user can request.

### FR-4: Overall Risk Score & Executive Summary
- **FR-4.1:** Compute a contract risk rating (e.g., High / Moderate / Balanced) and an overall score.
- **FR-4.2:** Provide a 3-bullet executive summary highlight reel of key contract takeaways.

### FR-5: Grounded Contract Intelligence Chat
- **FR-5.1:** Allow free-form questions about the document in the right-hand split-pane.
- **FR-5.2:** Inject the contract text and analysis summary into the conversational context.
- **FR-5.3:** Stream conversational responses using Vercel AI SDK and the local Ollama instance (`phi4-mini`).
- **FR-5.4:** Provide clickable prompt chips (e.g., "Summarize notice period", "Check non-compete validity", "What are my obligations on exit?").

### FR-6: Persistence & Session Handling
- **FR-6.1:** Associate contract audits with anonymous session UUIDs (compatible with existing Citizen profile sessions).
- **FR-6.2:** Allow users to revisit their analyzed contract during their session.

---

## 4. Non-Functional & UI Requirements

- **Design System Consistency:** Strictly adhere to GovMind AI's Industrial Intelligence aesthetic (deep zinc `#09090b` / `#18181b` surfaces, 1px border grid, monospace metadata, bright accent indicators).
- **Performance:** Initial clause decomposition should render in under 5 seconds for standard contracts.
- **Local-First & Privacy:** Contract text must never be sent to external third-party cloud LLM APIs; inference is executed completely locally on Ollama.
- **Ethical Safeguards:** Permanent disclaimer banner displayed at the top and footer of the analysis view.

---

## 5. Edge Cases & Error Handling

- **EC-1: Empty or Scanned/Image-Only PDF:** If no text can be extracted from the PDF, inform the user with a clear error and suggest pasting text or providing an unflattened digital document.
- **EC-2: Unusually Long Contracts (>30 pages):** Truncate or chunk sections gracefully with a warning that preliminary analysis focuses on primary operational clauses.
- **EC-3: Non-Contract Documents:** If the user uploads a completely unrelated file (e.g., a recipe or generic news article), the analyzer should flag that the document does not appear to be a legal contract and offer to analyze it as general text.
- **EC-4: Local Model Offline:** If Ollama is not reachable or still downloading, display an actionable fallback notice rather than a broken blank screen.

---

## 6. Acceptance Criteria

- [ ] **AC-1:** User can access `/rights` via sidebar navigation and see the Contract Intelligence dashboard.
- [ ] **AC-2:** User can upload a contract PDF or select a demo contract (Employment / Rental).
- [ ] **AC-3:** System extracts clauses and categorizes them with risk badges (High, Medium, Standard, Missing Protection).
- [ ] **AC-4:** Clicking a clause expands the plain-English translation and suggested negotiation revision.
- [ ] **AC-5:** User can chat with the Contract AI Assistant and receive streaming, grounded responses citing specific clauses.
- [ ] **AC-6:** Legal disclaimer is prominently visible at all times.
