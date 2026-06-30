# Brainstorm: Business Compliance Assistant

## Problem Statement
MSMEs and entrepreneurs struggle to understand compliance requirements (licenses, GST, labor laws, environmental regulations) specific to their industry. They need a system that distills this complex legal landscape into an actionable checklist.

## Research Findings (Next.js / React Constraints)
- **Dashboard UI:** This feature leans more heavily into dashboard mechanics rather than pure chat. We need a robust Next.js layout with Server Components for fetching compliance status and Client Components for interaction (checking off tasks).
- **Data Fetching:** Next.js App Router's native `fetch` caching is perfect for loading static compliance rules that rarely change, reducing database load.
- **Persistence:** Compliance is an ongoing process. We must persist user progress using a database (via Prisma/Drizzle) through Next.js Server Actions.

## Chosen Approach
- **Dynamic Checklists:** An interactive React component that generates a personalized compliance checklist based on the business's NAICS/industry code and location.
- **Hybrid UI:** A split-screen layout: the compliance checklist on the left (Server-rendered), and an AI Assistant on the right (Client-rendered) that can answer specific questions about the active checklist item.

## Rejected Alternatives
- **Pure Chatbot Approach:** Rejected because businesses need structured, trackable task lists (checklists) to prove compliance, rather than just ephemeral chat answers.

## Open Questions
- Can we safely cache the generated compliance checklist for a specific business archetype, or must it be generated dynamically via the LLM for every single user?
- How do we handle edge cases where a business spans multiple complex regulatory domains?

## Recommended Path
- Standard pipeline: `/spec-task -> /plan-task -> /implement-task -> /review-task`
