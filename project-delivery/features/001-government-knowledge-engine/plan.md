# Implementation Plan: Government Knowledge Engine

## Phase 1: Database Setup
- **Goal:** Set up Supabase with pgvector.
- **Risk:** Low.
- **Dependencies:** Supabase account.
- **Files:** Supabase migrations/SQL scripts.
- **Steps:** Initialize Supabase, enable pgvector, create `documents` and `document_chunks` tables, create `match_documents` RPC function.
- **Verification:** Run a manual insert and cosine similarity query via SQL.


## Phase 2: Python Ingestion Service Setup
- **Goal:** Create a standalone Python FastAPI service.
- **Risk:** Medium.
- **Dependencies:** Phase 1.
- **Files:** `ingestion-service/main.py`, `requirements.txt`.
- **Steps:** Scaffold FastAPI, install Langchain/PyPDF, setup basic endpoints.
- **Verification:** Start server and hit a health-check endpoint.

## Phase 3: Chunking & Embedding Logic
- **Goal:** Implement the core ingestion logic in Python.
- **Risk:** High (OCR complexity and chunking tuning).
- **Dependencies:** Phase 2.
- **Files:** `ingestion-service/processor.py`.
- **Steps:** Implement PDF parsing, semantic chunking, embedding via a free local model (e.g., `fastembed`), and writing to Supabase via `supabase-py`.
- **Verification:** Upload a test PDF and verify rows appear in Supabase `document_chunks` table.

## Phase 4: Next.js Retrieval Interface
- **Goal:** Build the Next.js retrieval function.
- **Risk:** Low.
- **Dependencies:** Phase 1, Phase 3.
- **Files:** `app/api/retrieve/route.ts` or Server Action.
- **Steps:** Implement an Edge function that takes a query, generates an embedding, and calls Supabase RPC `match_documents`.
- **Verification:** Call the endpoint with a test query and receive relevant chunks back in JSON.

## Critical Path
Database Setup -> Python Ingestion Service -> Next.js Retrieval.

## Riskiest Phase
Phase 3: Tuning chunking logic and handling scanned PDFs efficiently.
