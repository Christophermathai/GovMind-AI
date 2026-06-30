# Brainstorm: Opportunity Recommendation Engine

## Problem Statement
Users shouldn't have to manually search for grants, scholarships, or startup funds. The platform should proactively recommend opportunities based on the user's saved profile and evolving government datasets.

## Research Findings (Next.js / React Constraints)
- **Data Matching at Scale:** Running semantic vector similarity searches (comparing user profiles against scheme requirements) for every user synchronously is computationally expensive.
- **Background Processing:** Similar to the Regulation Change Monitor, this matching logic must happen asynchronously in the background (using Inngest/Trigger.dev).
- **UI/UX:** The Next.js frontend needs a "Discover" feed or a notifications bell (using React Server Components for initial load, polling or WebSockets/Server-Sent Events for real-time updates).

## Chosen Approach
- **Asynchronous Matching:** When a new scheme is ingested, or when a user updates their profile via Next.js Server Actions, trigger a background job.
- **Recommendation DB:** The job calculates eligibility and writes "Opportunity Matches" to the relational database.
- **Next.js Feed:** The user's dashboard simply fetches these pre-calculated matches from the database (fast, cacheable using Next.js data cache) rather than calculating them on the fly.

## Rejected Alternatives
- **On-the-fly Calculation:** Running the matching engine synchronously every time the user visits the dashboard will result in unacceptable page load times and high DB/LLM costs.

## Open Questions
- Should recommendations be purely algorithmic (vector similarity/rule-engine), or should an LLM summarize *why* this opportunity is a strong match in the notification?
- How do we handle "fuzzy" matches where the user is *almost* eligible?

## Recommended Path
- Standard pipeline: `/spec-task -> /plan-task -> /implement-task -> /review-task`
