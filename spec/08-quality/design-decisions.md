# Design Decisions

> **Version:** 1.0
> **Last Updated:** 2026-03-20

## Overview

This document records key architectural and design decisions using the ADR (Architectural Decision Record) format. Each decision includes context, the decision made, consequences, and alternatives considered.

---

## DD-01: Tailwind CSS v4 + shadcn/ui + Framer Motion

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | UI Framework           |

### Context

The project needs a UI component library and styling approach that supports a custom "Autumn Soft" design system with warm color tokens, dark mode, and smooth animations. The team is small, and developer velocity matters more than having a large ecosystem of pre-built enterprise components.

### Decision

Use **Tailwind CSS v4** for utility-first styling, **shadcn/ui** for unstyled, accessible component primitives, and **Framer Motion** for animations.

### Consequences

**Positive:**
- Full control over design tokens — "Autumn Soft" palette is trivially configurable in Tailwind.
- shadcn/ui components are copy-pasted into the project — no version lock-in, full ownership.
- Radix UI primitives (underlying shadcn) provide excellent accessibility out of the box.
- Tailwind v4 CSS-first configuration via `@theme` simplifies token management.
- Framer Motion provides declarative, Spring-based animations that align with "Yurufuwa" aesthetic.
- Small bundle size compared to full component libraries.

**Negative:**
- Components must be styled manually — more initial effort than MUI/Chakra.
- Framer Motion adds to bundle size (~25KB gzipped) — mitigated by dynamic imports.
- Team must understand Tailwind utility classes, Radix patterns, and Framer Motion API.

### Alternatives Considered

| Alternative         | Reason for Rejection                                         |
| ------------------- | ------------------------------------------------------------ |
| Material UI (MUI)   | Opinionated Material Design aesthetic conflicts with Autumn Soft; large bundle; difficult to deeply customize. |
| Chakra UI           | Closer to our needs but still has opinionated styling; smaller ecosystem than MUI; not based on Radix. |
| Headless UI         | Fewer components than Radix/shadcn; less community support.   |
| Vanilla CSS Modules | Loses utility-first velocity; harder to maintain design tokens consistently. |

---

## DD-02: No Client State Management — RSC + Server Actions

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | State Management       |

### Context

Traditional React SPAs require client-side state management libraries (Redux, Zustand) for server data. Next.js 15 with React Server Components (RSC) and Server Actions fundamentally changes this by fetching data on the server and mutating via server-side functions.

### Decision

Use **no client-side state management library**. Server data is fetched in RSCs. Mutations use Server Actions. Client state is limited to UI state (modals, theme, locale) managed via React `useState`/`useContext` or URL search params.

### Consequences

**Positive:**
- Eliminates an entire category of complexity (stores, reducers, selectors, cache invalidation).
- Data is always fresh from the server — no stale client caches.
- Smaller bundle — no Redux/Zustand shipped to client.
- Server Actions provide type-safe, co-located mutation logic.
- URL search params for filters/pagination enable shareable, bookmarkable states.

**Negative:**
- Requires understanding of RSC boundaries (server vs. client components).
- Optimistic updates require manual implementation with `useOptimistic`.
- Complex multi-step forms may need client-side state — handled with React `useState`.
- Less familiar pattern for developers experienced with Redux/SPA architecture.

### Alternatives Considered

| Alternative | Reason for Rejection                                         |
| ----------- | ------------------------------------------------------------ |
| Redux Toolkit| Overkill for this project; adds complexity and bundle size.  |
| Zustand     | Lightweight but unnecessary — RSC handles server state.       |
| TanStack Query | Designed for client-side fetching; conflicts with RSC model.|
| Jotai/Recoil| Atomic state is elegant but not needed when RSC handles data. |

---

## DD-03: Cookie-Based i18n Without URL Prefix

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Internationalization   |

### Context

The site supports Japanese and English. The i18n approach affects URL structure, SEO, caching, and user experience. Next.js supports both path-based (`/ja/events`, `/en/events`) and cookie/header-based locale detection.

### Decision

Use **cookie-based locale detection** without URL prefixes. The locale is stored in a `NEXT_LOCALE` cookie set by the language toggle. All URLs are locale-agnostic (e.g., `/events` not `/ja/events`).

### Consequences

**Positive:**
- Clean URLs — no `/ja/` or `/en/` prefixes cluttering the URL.
- Simpler routing — no locale parameter in every route.
- Single URL per resource — avoids duplicate content concerns.
- Middleware reads cookie and sets locale for RSC rendering.

**Negative:**
- SEO limitation — search engines cannot crawl different locale versions via URL. In practice, only Japanese content will be indexed (acceptable for a Japanese VRChat community site).
- Cannot share a link in a specific language — recipient sees their own preferred locale.
- Caching is more complex — CDN must vary by cookie (mitigated by Nginx handling).

### Alternatives Considered

| Alternative              | Reason for Rejection                                    |
| ------------------------ | ------------------------------------------------------- |
| Path-based (`/ja/...`)   | Adds complexity to routing; unnecessary for the primary Japanese audience. |
| Subdomain (`ja.site.com`)| Infrastructure complexity; overkill for two languages.   |
| Accept-Language header   | Unreliable; users cannot manually override easily.       |

---

## DD-04: Same-Domain Nginx Reverse Proxy

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Infrastructure         |

### Context

The frontend (Next.js) and backend (Rust/Actix) are separate services. They need to communicate, and the browser needs to make API calls. CORS configuration is error-prone and adds latency.

### Decision

Use **Nginx as a reverse proxy** on the same domain. Routes are split by path prefix:
- `/api/*` → Backend (Rust/Actix)
- `/*` → Frontend (Next.js)

### Consequences

**Positive:**
- No CORS issues — all requests are same-origin.
- Cookies (auth, locale) work seamlessly — no `SameSite` complications.
- Simpler security model — no cross-origin attack surface.
- Single SSL certificate for the domain.
- Nginx handles TLS termination, compression, static file caching.

**Negative:**
- Requires Nginx configuration and maintenance.
- Tight coupling between frontend and backend at the infrastructure level.
- Cannot independently scale frontend and backend domains (mitigated — not needed at this scale).

### Alternatives Considered

| Alternative              | Reason for Rejection                                    |
| ------------------------ | ------------------------------------------------------- |
| Separate domains + CORS  | Complex CORS config; cookie issues with `SameSite`; additional attack surface. |
| Next.js API routes as proxy | Adds latency; Next.js is not optimized for proxying.  |
| API Gateway (Kong, etc.) | Over-engineered for current scale.                       |

---

## DD-05: MinIO S3-Compatible Storage

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Storage                |

### Context

The site stores user avatars, event images, and gallery photos. These need to be served efficiently, with proper caching, and support image transformations.

### Decision

Use **MinIO** as an S3-compatible object storage backend. Images are uploaded via the backend API and served through the Nginx reverse proxy or directly from MinIO with CDN caching.

### Consequences

**Positive:**
- S3-compatible API — standard tooling and library support.
- Self-hosted — no dependency on cloud providers, full data ownership.
- Supports pre-signed URLs for secure, time-limited uploads.
- Can migrate to AWS S3 or any S3-compatible service with zero code changes.
- Cost-effective for a community project.

**Negative:**
- Self-hosted requires operational maintenance (backups, monitoring, disk space).
- No built-in CDN — must configure Nginx caching or external CDN.
- No built-in image transformation — rely on `next/image` for resizing/optimization.

### Alternatives Considered

| Alternative            | Reason for Rejection                                    |
| ---------------------- | ------------------------------------------------------- |
| Local filesystem       | Not scalable; no pre-signed URLs; complicates deployment. |
| AWS S3                 | Ongoing cost; cloud dependency for a community project.  |
| Cloudflare R2          | Good option but adds external dependency.                |

---

## DD-06: Dark Mode with Warm Dark Palette

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Design System          |

### Context

VRChat users often use their PCs in dim/dark environments. Dark mode is not optional — it is a core requirement. The "Autumn Soft" theme uses warm colors that must carry over into dark mode.

### Decision

Implement **full dark mode with a warm dark palette**. Dark mode uses warm dark backgrounds (not pure black/cold gray) to maintain the "Autumn Soft" aesthetic. Users can toggle between light and dark mode; the default follows system preference.

### Consequences

**Positive:**
- Warm dark palette (amber-tinted dark browns) feels cozy and aligns with the autumn theme.
- VRChat user base strongly prefers dark mode — this serves the primary audience.
- Tailwind CSS `dark:` variants make implementation straightforward.
- CSS custom properties enable clean token switching.

**Negative:**
- Every color token must be defined twice (light + dark) — more design work.
- Warm dark backgrounds are less common — may require extra WCAG contrast verification.
- Some decorative elements may need different treatment in dark mode (e.g., leaf overlays).

### Alternatives Considered

| Alternative       | Reason for Rejection                                         |
| ----------------- | ------------------------------------------------------------ |
| System-only       | No manual toggle — users cannot override system preference.   |
| Light-only        | Alienates VRChat users who predominantly use dark mode.       |
| Pure black dark   | Feels harsh and cold — conflicts with warm autumn aesthetic.  |
| Three modes (light/dark/auto) | Unnecessary complexity; auto + manual toggle covers all needs. |

---

## DD-07: Test Infrastructure from Day One

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Quality                |

### Context

Testing is often deferred in projects due to time pressure. However, adding tests to an existing codebase is exponentially harder than building them alongside the code.

### Decision

Set up **complete test infrastructure in Phase 1** (Foundation), before any feature development begins. This includes Vitest, Testing Library, Playwright, Storybook, MSW, and CI pipeline.

### Consequences

**Positive:**
- Tests are a natural part of the development workflow from the start.
- CI pipeline catches regressions immediately.
- Component tests enforce accessibility from the first component.
- Storybook serves as living documentation.
- Reduces cost of change throughout the project lifecycle.

**Negative:**
- Higher upfront investment in Phase 1.
- Slower initial velocity (perceived, not actual — prevents rework later).
- Team must learn testing tools alongside framework.

### Alternatives Considered

| Alternative              | Reason for Rejection                                    |
| ------------------------ | ------------------------------------------------------- |
| Add tests in Phase 5     | Technical debt accumulates; retrofitting is costly.      |
| Tests for critical paths only | Misses component-level issues and accessibility gaps. |
| Manual QA only           | Not scalable; misses regressions; no CI integration.    |

---

## DD-08: Markdown Rendering — Backend HTML for Display, Client Preview for Edit

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Content Rendering      |

### Context

Event descriptions and member profiles support Markdown input. Markdown must be rendered to HTML for display. The rendering pipeline must prevent XSS attacks.

### Decision

- **Display (read):** The backend renders Markdown to HTML using a safe parser and sanitizes with **ammonia** (Rust HTML sanitizer). The frontend receives sanitized HTML and renders it via `dangerouslySetInnerHTML` (safe because the HTML is backend-sanitized).
- **Preview (edit):** The client renders a live preview using a JavaScript Markdown parser (e.g., `remark` + `rehype-sanitize`) for immediate feedback during editing.

### Consequences

**Positive:**
- Backend sanitization with ammonia is extremely robust against XSS.
- Display path has zero client-side parsing overhead.
- Live preview provides good editing UX without security risk (sanitized client-side too).
- Single source of truth for sanitization rules (backend).

**Negative:**
- Preview rendering may differ slightly from backend rendering.
- Client-side Markdown libraries add to bundle — mitigated by dynamic import on edit pages only.
- `dangerouslySetInnerHTML` requires trust in backend sanitization.

### Alternatives Considered

| Alternative                 | Reason for Rejection                                    |
| --------------------------- | ------------------------------------------------------- |
| Client-only rendering       | XSS risk if user input is not properly sanitized.        |
| No Markdown (plain text)    | Poor UX for content formatting.                          |
| WYSIWYG editor              | Complex, heavy, and harder to sanitize.                  |
| Backend rendering for both  | No live preview possible during editing.                 |

---

## DD-09: embla-carousel via shadcn (vs Swiper, custom)

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Component Library      |

### Context

The home page hero section, event image galleries, and possibly member showcases require carousel functionality. The carousel must be accessible, performant, and customizable.

### Decision

Use **embla-carousel** as provided by the shadcn/ui Carousel component.

### Consequences

**Positive:**
- Already integrated with shadcn/ui — consistent API and styling patterns.
- Lightweight (~8KB gzipped) compared to Swiper (~40KB).
- Accessible — keyboard navigation and ARIA roles.
- Extensible plugin system for autoplay, parallax, etc.
- No CSS framework dependency — works natively with Tailwind.

**Negative:**
- Fewer pre-built features than Swiper (pagination styles, effects).
- Less community examples/tutorials than Swiper.
- Plugin ecosystem is smaller.

### Alternatives Considered

| Alternative     | Reason for Rejection                                         |
| --------------- | ------------------------------------------------------------ |
| Swiper          | Heavy bundle (~40KB); complex API; own CSS conflicting with Tailwind. |
| Custom carousel | Reinventing the wheel; accessibility is hard to get right.    |
| Keen-Slider     | Good option but not integrated with shadcn/ui.                |

---

## DD-10: Custom Lightbox with Framer Motion

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Component Library      |

### Context

Gallery and event detail pages need a full-screen lightbox for viewing images. The lightbox must support gestures, keyboard navigation, and smooth animations consistent with the "Autumn Soft" feel.

### Decision

Build a **custom lightbox component using Framer Motion** for animations rather than using an existing lightbox library.

### Consequences

**Positive:**
- Full design control — animations match the Autumn Soft aesthetic perfectly.
- No additional dependency — Framer Motion is already in the project.
- Custom zoom, pan, and swipe gestures via Framer Motion's gesture API.
- Fully accessible — custom implementation ensures ARIA compliance.

**Negative:**
- More development effort than using a library.
- Must handle edge cases manually (multi-touch, pinch zoom, image preloading).
- Must implement keyboard navigation (arrows, Escape) from scratch.

### Alternatives Considered

| Alternative             | Reason for Rejection                                    |
| ----------------------- | ------------------------------------------------------- |
| yet-another-react-lightbox | Additional dependency; styling may conflict with theme. |
| react-medium-image-zoom | Limited to zoom only, not a full gallery lightbox.       |
| Photoswipe              | Heavy; own CSS; not React-native.                        |

---

## DD-11: CSS Grid Masonry for Gallery

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Layout                 |

### Context

The gallery page displays images of varying aspect ratios. A masonry layout (Pinterest-style) maximizes visual density and looks elegant. CSS Grid now has experimental masonry support.

### Decision

Use **CSS Grid with `grid-template-rows: masonry`** where supported, with a **CSS columns fallback** for browsers that do not support CSS masonry.

### Consequences

**Positive:**
- Zero JavaScript for layout — pure CSS solution.
- No runtime layout calculations or resize observers.
- No additional library dependency.
- Graceful degradation — CSS columns fallback produces a similar visual effect.
- Future-proof — CSS masonry is on track for standardization.

**Negative:**
- CSS masonry is experimental — Firefox (behind flag), Chrome (in development).
- Fallback with CSS columns may have different visual behavior (column-order vs row-order).
- Cannot control exact item placement (items flow by column in fallback).

### Alternatives Considered

| Alternative              | Reason for Rejection                                    |
| ------------------------ | ------------------------------------------------------- |
| Masonry.js               | JavaScript dependency; layout thrashing; complexity.     |
| react-masonry-css        | Additional dependency; not actively maintained.          |
| Uniform grid             | Wastes space with varying aspect ratios; less visually interesting. |
| `@tanstack/virtual`      | Overkill; adds complexity for a non-infinite gallery.    |

---

## DD-12: PC-First Responsive Strategy

| Field    | Value                  |
| -------- | ---------------------- |
| Status   | **Accepted**           |
| Date     | 2026-03-20             |
| Category | Responsive Design      |

### Context

VRChat is a PC-based application. The overwhelming majority of VRChat users access community websites from their PC (desktop or laptop), often with the game running on the same machine. Mobile access exists but is a secondary use case.

### Decision

Adopt a **PC-first (desktop-first) responsive strategy**. Base styles target desktop layouts. Responsive breakpoints **scale down** for tablet and mobile using `max-width` media queries (Tailwind `max-*` variants or custom breakpoints).

### Consequences

**Positive:**
- Optimizes for the primary user base — PC gamers using desktop browsers.
- Desktop layout is the default — no need to progressively enhance from mobile.
- Sidebars, multi-column layouts, and hover interactions are default, not progressive additions.
- Admin dashboard and profile editor (complex UI) are designed desktop-first.

**Negative:**
- Contrary to industry standard "mobile-first" approach — may surprise new team members.
- Must ensure mobile experience does not degrade — still needs testing across mobile breakpoints.
- Tailwind CSS defaults to mobile-first (`sm:`, `md:`, `lg:` = min-width) — requires using `max-*` variants or reversing the approach.

### Alternatives Considered

| Alternative   | Reason for Rejection                                         |
| ------------- | ------------------------------------------------------------ |
| Mobile-first  | Standard approach but optimizes for the wrong primary audience. VRChat users are on PCs. |
| Adaptive (separate layouts) | Over-engineered; maintainability issues with dual layouts. |

### Implementation Note

In practice, because Tailwind CSS's responsive system is mobile-first by default, the implementation uses Tailwind's standard breakpoint system (`sm:`, `md:`, `lg:`, `xl:`) but **designs** from the desktop viewport first. The desktop layout is the "target" design, and mobile adjustments are made by testing at smaller breakpoints and adding responsive utilities as needed.
