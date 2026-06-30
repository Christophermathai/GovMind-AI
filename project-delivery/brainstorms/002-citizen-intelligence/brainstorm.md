# Brainstorm: Citizen Intelligence

## Problem Statement
Citizens, students, and job seekers do not know which government schemes they qualify for. The system must collect their personal context (age, location, occupation, etc.) and intelligently map it to relevant schemes and benefits.

## Research Findings (Next.js / React Constraints)
- **State Management:** The user's context is highly dynamic and multi-faceted. We need a robust client-side state management solution (Zustand or React Context) to hold this profile temporarily during a session before persisting it.
- **Form Handling:** Complex eligibility criteria require dynamic, multi-step forms. React Hook Form integrated with Zod validation is ideal for performance and strict typing.
- **Streaming UI:** The AI's reasoning for *why* a user is eligible should be streamed to the client using Vercel AI SDK's `useChat` or `useCompletion` hooks for a responsive feel.

## Chosen Approach
- **Wizard Interface:** Implement a Next.js multi-step onboarding wizard using React Hook Form to collect baseline citizen profiles.
- **Context-Aware Chat:** A chat interface where the user's profile is injected into the system prompt invisibly as context.
- **Server Actions:** Use Next.js Server Actions to execute the deterministic rule engine (checking age/income bounds) before falling back to the LLM for semantic matching.

## Rejected Alternatives
- **Static Form Submission:** Rejected because querying the RAG pipeline synchronously via standard REST POST requests leads to poor UX while waiting for LLM generation.
- **Server-Side Rendered (SSR) Chat:** Chat interfaces need heavy client-side interactivity, making pure SSR (Server Components only) unsuitable for the actual chat window; Client Components are required.

## Open Questions
- How much of the user's profile should we persist in the database vs. keeping it ephemeral in the session for privacy reasons?
- Should the primary UI be a dashboard of matched schemes, or a conversational AI assistant?

## Recommended Path
- Standard pipeline: `/spec-task -> /plan-task -> /implement-task -> /review-task`
