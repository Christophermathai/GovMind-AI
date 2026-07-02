# Implementation Plan: Global Frontend Shell

## Phase 1: Foundation & Typography
- Configure `next/font/google` for `Bricolage Grotesque` and `JetBrains Mono`.
- Update `tailwind.config.ts` with the industrial color palette.
- Overwrite `globals.css` to strip boilerplate and set deep dark backgrounds.

## Phase 2: Layout & Navigation
- Create `components/ui/Sidebar.tsx` with sharp minimalist icons.
- Update `app/layout.tsx` to wrap the application in the global shell.

## Phase 3: Dashboard Components
- Create `components/ui/Omnibar.tsx` (the central search input).
- Create `components/ui/BentoCard.tsx` (a reusable 1px bordered dashboard container).
- Update `app/page.tsx` with the bento grid and Omnibar layout.
