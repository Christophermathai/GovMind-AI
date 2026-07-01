# Functional Spec: Government Knowledge Engine

## Overview
The Government Knowledge Engine is the foundational data infrastructure for GovMind AI. It ingests, chunks, embeds, and stores complex government documents (Acts, Rules, Policies) so they can be retrieved efficiently by the RAG system.

## What Exists Today
A fresh Next.js environment. No database or ingestion pipeline exists yet.

## What Changes
- Implement a Python-based ingestion microservice for heavy PDF/OCR processing and embedding generation.
- Implement a Supabase pgvector database for unified relational and vector storage.
- Expose a retrieval interface (Next.js Edge API / Server Action) that takes a user query and returns relevant document chunks from Supabase.

## Functional Requirements
- **FR-1:** Python service must accept raw PDF documents.
- **FR-2:** Python service must extract text (with OCR fallback) from PDFs.
- **FR-3:** Python service must chunk text semantically.
- **FR-4:** Python service must generate embeddings using a free, local open-source model (e.g., `fastembed` or HuggingFace `all-MiniLM-L6-v2`).
- **FR-5:** Python service must store chunks and vectors in Supabase pgvector.
- **FR-6:** Next.js application must expose a retrieval interface that accepts a query and returns top-K results from Supabase.

## Edge Cases
- Massive documents (hundreds of pages) causing memory issues in Python.
- Legacy scanned PDFs requiring advanced OCR.

## Out of Scope
- User-facing Chat UI.
- Automated web scraping.
- Knowledge Graph creation.

## Dependencies
- Supabase project and credentials.

## Acceptance Criteria
- Uploading a PDF to the Python service results in properly chunked text and vectors in the Supabase database.
- A query to the Next.js retrieval interface returns the correct text chunk related to the query.
