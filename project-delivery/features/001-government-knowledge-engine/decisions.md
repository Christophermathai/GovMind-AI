# Decisions

1. **Ingestion Service Language:** Python. Chosen due to superior ecosystem for heavy PDF processing, OCR, and AI orchestration (Langchain/LlamaIndex) compared to Node.js.
2. **Vector Database:** Supabase pgvector. Chosen to keep relational data and vectors unified in Postgres, reducing infrastructure complexity.
3. **Retrieval Layer:** Next.js Edge APIs. Chosen for low latency and seamless integration with the future Vercel AI SDK chat interface.
4. **Embedding Model:** Free local open-source model (e.g., `fastembed`). Chosen to avoid OpenAI API costs and keep the infrastructure 100% free to run.
