# BDD Surface Map

This document maps each product surface to its BDD feature file group and ID prefix. Use it to scope `/capture-behavior` work and navigate feature coverage.

| ID  | Surface Name                   | Feature Prefix | BDD Directory                                      | Status  |
|-----|-------------------------------|----------------|----------------------------------------------------|---------|
| 001 | Government Knowledge Engine   | GKE            | `bdd/001-government-knowledge-engine/`             | Current |

## Surface Descriptions

### 001 · Government Knowledge Engine

The foundational data infrastructure. Covers three observable behavioural contracts:

| File | Scenarios | Covers |
|------|-----------|--------|
| `GKE-01-document-ingestion.feature` | 8 | `/ingest` endpoint — PDF validation, background processing, chunking, batching, empty-PDF handling |
| `GKE-02-query-embedding.feature` | 3 | `/embed-query` endpoint — 384-d vector output, determinism, differentiation |
| `GKE-03-retrieval-api.feature` | 6 | `POST /api/retrieve` — ranked results, threshold filtering, max-count cap, error states |

**Key implementation refs:**
- `ingestion-service/main.py` — FastAPI service, `/health`, `/ingest`, `/embed-query`
- `ingestion-service/processor.py` — PDF parsing, LangChain chunking, fastembed, batched Supabase inserts
- `app/api/retrieve/route.ts` — Next.js POST handler, delegates embed to Python service, calls `match_documents` RPC
- `supabase/migrations/20240101000000_init_knowledge_engine.sql` — `documents`, `document_chunks`, `match_documents()` function
