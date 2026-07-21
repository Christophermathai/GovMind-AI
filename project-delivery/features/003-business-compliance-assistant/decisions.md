# Decisions: Business Compliance Assistant

- **Database Consistency:** Decided to use Supabase directly for task persistence rather than introducing Prisma/Drizzle (which was mentioned in the brainstorm) in order to maintain architectural consistency with the Knowledge Engine.
- **Layout Architecture:** Opted for a hard split-screen layout on desktop to allow users to view their tasks while simultaneously reading long-form AI explanations, reducing cognitive load.
