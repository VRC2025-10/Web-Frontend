# Frontend Design Specification

> **VRC October Cohort Community Site — Frontend (Next.js)**
>
> Version: 3.0 | Last updated: 2026-03-19

This directory contains the complete, implementation-ready design specification for the frontend application. Every file is structured so that an engineer can implement without asking clarifying questions.

Backend API documentation lives in the root-level `docs/` directory and is maintained separately.

## How to Use This Spec

1. **Starting a new feature?** → Find the relevant page in `04-pages/`, then follow references to component specs in `03-components/` and token definitions in `02-tokens/`.
2. **Creating a component?** → Check the component spec for variants, states, accessibility, and animation requirements.
3. **Need a design token?** → All visual values (colors, spacing, typography, shadows, motion, breakpoints) are in `02-tokens/`. **Never hardcode values.**
4. **Checking accessibility?** → Each component and page spec includes ARIA/keyboard requirements. Cross-reference `06-patterns/accessibility.md` for global rules.
5. **Architecture question?** → `07-architecture/` covers data fetching, auth, i18n, and infrastructure.

## File Tree

```
spec/
├── README.md                          ← You are here
├── AESTHETIC-DIRECTION.md             # Mood → design attribute mapping rationale
│
├── 01-foundation/
│   ├── design-philosophy.md           # Core principles, "Autumn Soft" concept
│   ├── personas.md                    # User personas, scenarios, device strategy
│   └── tech-stack.md                  # Technology choices with rationale
│
├── 02-tokens/
│   ├── colors.md                      # Light + Dark palettes, semantic tokens, contrast
│   ├── typography.md                  # Type scale, fonts, loading strategy
│   ├── spacing.md                     # 8px grid, layout containers, density
│   ├── elevation.md                   # Shadows, borders, border-radius scale
│   ├── motion.md                      # Duration, easing, animation catalogue
│   └── breakpoints.md                 # Responsive strategy, breakpoint scale
│
├── 03-components/
│   ├── README.md                      # Component catalogue overview
│   ├── layout/
│   │   ├── header.md                  # Sticky header with blur, nav, user menu
│   │   ├── footer.md                  # Site footer with links
│   │   ├── mobile-nav.md              # Sheet-based mobile navigation
│   │   └── admin-sidebar.md           # Admin dashboard sidebar
│   ├── data-display/
│   │   ├── event-card.md              # Event listing card
│   │   ├── member-card.md             # Member avatar card
│   │   ├── club-card.md               # Club cover card
│   │   ├── stat-card.md               # Admin dashboard stat card
│   │   └── data-table.md              # Admin data table (TanStack)
│   ├── input/
│   │   ├── forms.md                   # Form patterns, validation UX
│   │   ├── profile-form.md            # Profile editor form
│   │   ├── image-dropzone.md          # Image upload dropzone
│   │   └── search.md                  # Debounced search input
│   ├── feedback/
│   │   ├── toast.md                   # Toast notifications (Sonner)
│   │   ├── loading.md                 # Skeleton + spinner patterns
│   │   ├── empty-state.md             # Empty state component
│   │   └── error-state.md             # Inline error display
│   ├── overlay/
│   │   ├── dialog.md                  # Modal dialog + confirmation
│   │   ├── lightbox.md                # Gallery image lightbox
│   │   └── dropdown.md                # Dropdown menu patterns
│   └── shared/
│       ├── leaf-particles.md          # Autumn leaf floating animation
│       ├── section-header.md          # Section title + action link
│       ├── pagination.md              # Page-number pagination
│       └── tag-chip.md                # Colored tag chip
│
├── 04-pages/
│   ├── README.md                      # Route table, layouts, middleware
│   ├── 01-home.md                     # / — Hero + events + members
│   ├── 02-events.md                   # /events, /events/[id]
│   ├── 03-members.md                  # /members, /members/[id]
│   ├── 04-profile-editor.md           # /settings/profile
│   ├── 05-clubs-gallery.md            # /clubs, /clubs/[id]
│   ├── 06-admin.md                    # /admin/* (all sub-pages)
│   ├── 07-login.md                    # /login
│   └── 08-error-pages.md             # 404, 500, forbidden handling
│
├── 05-interactions/
│   ├── micro-interactions.md          # Button, card, input animations
│   ├── page-transitions.md            # Route transitions, streaming
│   ├── loading-choreography.md        # Skeleton, stagger, progressive reveal
│   └── feedback-animations.md         # Success, error, toast animations
│
├── 06-patterns/
│   ├── accessibility.md               # WCAG AA checklist, ARIA patterns
│   ├── forms.md                       # Validation UX, error display, submission
│   ├── navigation.md                  # Browser back, breadcrumbs, deep links
│   ├── error-handling.md              # API error recovery, retry, fallback
│   ├── empty-states.md                # All empty state definitions
│   └── responsive.md                  # Breakpoint-specific behavior rules
│
├── 07-architecture/
│   ├── directory-structure.md         # src/ file tree and conventions
│   ├── data-fetching.md               # RSC fetch, ISR, Server Actions, caching
│   ├── auth-flow.md                   # Discord OAuth2, middleware, session
│   ├── i18n.md                        # next-intl, Cookie-based, message structure
│   ├── seo.md                         # Per-page meta, OGP, sitemap, robots
│   ├── infrastructure.md              # Docker, Nginx, Cloudflare, MinIO
│   └── api-types.md                   # TypeScript type definitions for API
│
├── 08-quality/
│   ├── testing-strategy.md            # Playwright, Vitest, Storybook plan
│   ├── performance-budget.md          # Lighthouse targets, bundle limits
│   └── design-decisions.md            # ADR-style decision log
│
└── 09-roadmap/
    ├── phases.md                      # Phased release plan (Phase 1–4)
    ├── risks.md                       # Risks and countermeasures
    └── backend-requirements.md        # Required backend API additions
```

## Cross-Reference Conventions

- `→ [02-tokens/colors.md]` means "see that file for token values"
- `→ §3.2` means "see section 3.2 within the same file"
- Component references use the format `<ComponentName>` (e.g., `<EventCard>`)
