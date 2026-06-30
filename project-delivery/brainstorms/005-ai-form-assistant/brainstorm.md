# Brainstorm: AI Form Assistant

## Problem Statement
Government forms are notorious for confusing language and complex requirements. The AI Form Assistant explains required fields, identifies missing information, and guides users through common mistakes.

## Research Findings (Next.js / React Constraints)
- **UI Overlay:** A conversational UI floating over or alongside a digitized form is the ideal UX. React Portals or a global side-drawer component in Next.js will be useful here.
- **Digitization vs. PDF:** We must decide if the system digitizes government forms into React forms (React Hook Form), or if the user uploads a blank PDF and the AI helps them fill it out. Digitized React forms allow for much deeper validation integration.
- **Field-level AI Context:** If using digitized React forms, we can attach AI context to individual input `onFocus` events, triggering the Vercel AI SDK to stream explanations for that specific field.

## Chosen Approach
- **Interactive Digitized Forms:** Convert high-priority government forms into Next.js React components using a unified schema (e.g., Zod).
- **Contextual Help Panel:** A floating assistant panel that listens to the active form field and proactively offers guidance and validation using Server Actions.

## Rejected Alternatives
- **Uploading Blank PDFs:** Trying to overlay AI on top of a blank PDF is technically fraught and leads to a disjointed user experience compared to native HTML/React forms.

## Open Questions
- Is it feasible to manually convert hundreds of forms into React code, or do we need an automated schema-to-form builder?
- Should the AI physically fill out the form for the user (auto-fill), or just guide them?

## Recommended Path
- Light pipeline: `/spec-task -> /implement-task`
