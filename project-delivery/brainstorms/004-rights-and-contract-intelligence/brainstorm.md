# Brainstorm: Rights & Contract Intelligence

## Problem Statement
Users need to upload complex legal documents (employment contracts, rental agreements) so the AI can identify high-risk clauses, auto-renewals, and missing protections, translating them into plain language.

## Research Findings (Next.js / React Constraints)
- **File Uploads:** Next.js API routes can handle file uploads, but passing large PDFs directly through Vercel's serverless functions is risky due to payload limits (4.5MB).
- **Direct-to-Storage:** We must implement direct-to-storage uploads (e.g., AWS S3 pre-signed URLs or Supabase Storage) from the React client to bypass Next.js API payload limits.
- **Document Viewer:** We need a robust client-side PDF viewer (e.g., `react-pdf`) to display the document alongside the AI's analysis.

## Chosen Approach
- **Architecture:** Client uses `react-dropzone` -> requests pre-signed URL from Next.js -> uploads to S3/Supabase -> triggers an asynchronous processing job (Inngest).
- **UI Layout:** Split-pane interface. Left pane renders the PDF using `react-pdf`. Right pane displays the Vercel AI SDK streaming chat and highlighted risk clauses.
- **Analysis:** LLM is instructed to return specific quote snippets, which the React UI uses to highlight text within the PDF viewer.

## Rejected Alternatives
- **Synchronous Upload & Process:** Uploading and running LLM analysis in a single Next.js API route will trigger serverless timeouts.
- **Sending files in base64 to LLM:** Too heavy for Next.js API route bodies; sending storage URLs to the LLM backend is much safer.

## Open Questions
- How do we handle extremely long contracts that exceed the LLM's context window? (Require chunking and mapping, but we need to ensure holistic analysis isn't lost).
- Which OCR/Document parsing service will we use to extract text from scanned PDFs? (e.g., LlamaParse, Azure Document Intelligence).

## Recommended Path
- Full pipeline: `/spec-task -> /plan-task -> /implement-task -> /review-task -> /capture-behavior`
