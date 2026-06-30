# Brainstorm: Government Knowledge Engine

## Problem Statement
The platform requires a foundational data infrastructure to ingest, structure, and query complex government Acts, Rules, Policies, and Schemes. This forms the backbone of the Retrieval-Augmented Generation (RAG) system, upon which all other GovMind AI modules rely.

## Research Findings (Next.js / React Constraints)
- **Data Ingestion:** Next.js API routes have timeout limits (especially on serverless deployments like Vercel). Heavy OCR, document chunking, and embedding generation should ideally be offloaded to a background job runner (e.g., Inngest, Trigger.dev) or a separate microservice.
- **Vector Storage:** We need a vector database (e.g., Supabase pgvector, Pinecone). Next.js Server Actions can easily interface with these for fast retrieval during user queries.
- **Edge Computing:** For low latency, the retrieval and LLM generation step can be run on the Edge runtime using Next.js Edge API routes and streaming (Vercel AI SDK).
- **Knowledge Graph:** Managing graph relationships might require a specialized graph DB (Neo4j) or clever relational mapping in Postgres, integrated via Prisma/Drizzle ORM in Next.js.

## Chosen Approach
- **Ingestion Pipeline:** Use Inngest integrated with Next.js for asynchronous background processing of government PDFs (chunking, embedding, knowledge graph extraction).
- **Retrieval Pipeline:** Next.js Server Actions running on Edge, utilizing the Vercel AI SDK to stream responses back to the React client.
- **Database:** Supabase with `pgvector` for vector search, keeping the stack unified if using Postgres.

## Rejected Alternatives
- **Processing in standard Next.js API routes:** Rejected due to Vercel's strict 10s-60s timeout limits, which are insufficient for processing large PDF Acts.
- **Client-side embedding:** Rejected due to heavy bundle size and slow performance on mobile devices.

## Open Questions
- Should we build a custom Python microservice for ingestion (using Langchain/LlamaIndex) and keep Next.js strictly for the frontend and retrieval, or handle ingestion in Next.js via Node-based AI libraries?
- Which specific Vector DB and Graph DB combination will we standardize on?

## Recommended Path
- Full pipeline: `/spec-task -> /plan-task -> /implement-task -> /review-task -> /capture-behavior`
