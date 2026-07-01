# Implementation Notes

- Ensure `supabase-py` and `@supabase/supabase-js` are kept in sync with the database schema.
- For Supabase vector search, we will need to create a Postgres function (RPC) `match_documents` to handle the cosine similarity query natively in SQL.
- Python service should use `asyncio` and `FastAPI` for non-blocking file processing if handling multiple uploads.
