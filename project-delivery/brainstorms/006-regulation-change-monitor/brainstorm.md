# Brainstorm: Regulation Change Monitor

## Problem Statement
Laws, tax regulations, and labor compliance requirements change frequently. Users (especially MSMEs) need to be automatically notified when a change affects them, rather than manually checking.

## Research Findings (Next.js / React Constraints)
- **Asynchronous Monitoring:** Next.js is fundamentally a request/response web framework, not a cron server. We cannot rely on Next.js `setInterval` or long-running processes for continuous monitoring.
- **Background Jobs:** We need an external trigger. Vercel Cron Jobs are good for simple schedules, but for complex, long-running web scraping or document diffing, we need an orchestration engine like Inngest, Trigger.dev, or Temporal.
- **Email/Push Notifications:** We will need to integrate Resend (for emails) or a push notification service, triggered by the background job, linking back to dynamic Next.js routes showing the specific change.

## Chosen Approach
- **Orchestration:** Use Inngest to schedule daily checks against the Government Knowledge Engine data sources.
- **Diffing Engine:** When a change is detected, an Inngest worker triggers an LLM to summarize the impact.
- **Targeted Alerts:** The system queries the database (via Prisma/Drizzle) for users whose profiles intersect with the changed regulation, enqueuing email notifications via Resend.
- **User Dashboard:** A Next.js dashboard where users can view their alert history and manage subscription preferences.

## Rejected Alternatives
- **Native Next.js Polling:** Rejected due to serverless execution limits and potential for memory leaks in Vercel/Next.js hosting environments.

## Open Questions
- What is the canonical source of truth for detecting "changes"? (e.g., scraping government gazettes, RSS feeds, or manual admin entry).
- How do we prevent notification fatigue for users in highly volatile regulatory sectors?

## Recommended Path
- Standard pipeline: `/spec-task -> /plan-task -> /implement-task -> /review-task`
