# Feature Brainstorm: Global Frontend Shell

## 1. Problem Statement
GovMind AI needs a unified, production-grade frontend shell that breaks away from typical, hard-to-navigate government websites and avoids generic "AI chatbot" aesthetics. It needs to look like a high-end, authoritative intelligence tool that instills trust while remaining deeply functional.

## 2. Research Findings
- The Next.js `app` directory currently contains only standard `create-next-app` boilerplate.
- The system has multiple distinct modules (Citizen Intelligence, Business Compliance, Rights & Contracts) that need to be accessible from a unified navigation structure.
- Following the `@frontend-design` skill, we must avoid generic fonts (Inter, Arial) and typical AI aesthetics (purple gradients, soft shadows).

## 3. Proposed Approaches

### Approach A: The "Industrial Intelligence Console"
- **Aesthetic:** Utilitarian, brutalist, and sharp. Deep black backgrounds (`#0a0a0a`), stark white text, sharp 1px solid borders separating all sections (visible structural grids). No soft shadows, no emojis, no glassmorphism.
- **Typography:** `Bricolage Grotesque` for authoritative, sharp headings. `JetBrains Mono` for data points, tags, and small utility text. 
- **Layout:** A persistent dense left sidebar for module navigation. The main dashboard uses a tight bento-box grid. The core interaction is a massive, central "Command Input" (like a terminal) for querying the Knowledge Engine.
- **Pros:** Perfectly matches an "Industrial/Obsidian" aesthetic. Looks highly professional, serious, and purpose-built. 
- **Cons:** High contrast requires careful attention to typography and spacing to remain legible.
- **Effort:** L (Requires building a robust layout shell and custom UI components from scratch).
- **Recommendation:** **WINNER.** This perfectly captures the essence of a "decision-support platform" rather than just another chatbot.

### Approach B: The "Editorial Legal Document"
- **Aesthetic:** High-end editorial layout. Off-white/cream backgrounds, dark charcoal text, elegant serif fonts for headings.
- **Layout:** Top navigation, centered single-column flows (like reading a physical legal document or broadsheet).
- **Pros:** Feels extremely trustworthy, humanistic, and accessible.
- **Cons:** Harder to represent complex, multi-module dashboard data and real-time AI agents.
- **Effort:** M.

## 4. Recommended Delivery Path
**Standard pipeline:** `/spec-task -> /plan-task -> /implement-task -> /review-task`
