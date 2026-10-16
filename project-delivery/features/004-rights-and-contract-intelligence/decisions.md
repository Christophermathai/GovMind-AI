# Architectural Decisions: Rights & Contract Intelligence

Feature ID: `004-rights-and-contract-intelligence`  
Last Updated: 2026-10-16  
Status: Approved

---

### Decision 1: Hybrid Deterministic Rule Matching + Local LLM Synthesis
- **Context:** Analyzing contracts solely with LLMs can be slow on local machines or prone to formatting drift, while purely regex-based analysis misses subtle legal nuances.
- **Decision:** Implement a hybrid engine:
  1. A deterministic clause scanner detects known high-friction clause types (liquidated damages, non-compete covenants, arbitration venues, unilateral lock-ins, auto-renewal windows).
  2. The local Ollama instance (`phi4-mini`) generates the plain-English translations, contextual risk assessments, and interactive Q&A answers.
- **Rationale:** Ensures immediate UI feedback and 100% reliable clause taxonomy while retaining rich conversational capabilities without external API costs.

---

### Decision 2: Pre-Loaded Representative Legal Contracts
- **Context:** Many users or reviewers testing the system will not have an unencrypted employment or tenancy contract readily available in PDF format.
- **Decision:** Provide two built-in demo templates on the `/rights` landing page:
  1. *Tech Startup Employment Agreement (with aggressive 90-day non-compete, 3-month notice, and full IP lock-in).*
  2. *Residential Lease Agreement (with automatic 10% rent hike auto-renewal and deposit forfeiture clause).*
- **Rationale:** Allows instantaneous end-to-end evaluation of the clause decomposition and chat counsel without requiring document upload.

---

### Decision 3: Document Privacy & Local-First Processing
- **Context:** Legal agreements often contain sensitive personal data (salaries, addresses, identification numbers).
- **Decision:** All PDF parsing, clause extraction, and LLM reasoning happen strictly within the local environment (FastAPI / Next.js server actions and local Ollama). No document content is sent to third-party AI APIs. Analyses stored in Supabase are indexed by anonymous session UUID.
- **Rationale:** Aligns with GovMind AI's core privacy guarantees and self-hosted architectural thesis.

---

### Decision 4: Split-Screen Industrial Layout
- **Context:** Users reviewing legal documents need to inspect specific clauses side-by-side with the AI assistant's explanations to build trust.
- **Decision:** Adopt the dual-column console layout established in Module 003 (`ComplianceChecklist` + `ComplianceChat`). The left pane hosts the categorized risk cards and clause filter, while the right pane hosts the streaming AI counsel.
- **Rationale:** Reduces visual context-switching and maintains strict design system continuity across the platform.
