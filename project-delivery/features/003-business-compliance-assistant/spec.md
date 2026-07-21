# Specification: Business Compliance Assistant

## 1. Description
The Business Compliance Assistant translates complex legal and regulatory landscapes into actionable, personalized checklists for MSMEs and startups. It pairs these task lists with a context-aware AI assistant to answer specific questions about individual compliance requirements.

## 2. Functional Requirements
- **Split-Screen Layout:** A dual-pane interface containing a checklist (left) and an AI assistant (right).
- **Dynamic Checklists:** Render a list of compliance tasks (e.g., GST Registration, Fire Safety NOC). Users must be able to toggle tasks as "completed".
- **Contextual Chat:** The AI chat interface allows users to ask questions related to their compliance burden.
- **Persistence:** Task completion status must be saved to the database.

## 3. Non-Functional Requirements
- **Aesthetic Consistency:** Must strictly adhere to the "Industrial Intelligence Console" design language (sharp 1px borders, deep black backgrounds, Bricolage Grotesque/JetBrains Mono fonts).
- **Data Fetching:** Leverage Next.js App Router caching for static compliance rules, and Server Actions for database mutations.
- **Database:** Use Supabase for persistence to match the existing system architecture (superseding the Prisma/Drizzle brainstorm idea).
