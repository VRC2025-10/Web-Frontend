# Release Phases

> **Version:** 1.0
> **Last Updated:** 2026-03-20

## Overview

The project is delivered in five sequential phases. Each phase builds on the previous one. A phase gate review confirms acceptance criteria before proceeding to the next phase.

---

## Phase 1: Foundation

### Goal

Establish the technical foundation, design system, and core layout. Nothing is user-visible except structural shells and error/loading states.

### Deliverables

| #   | Component / Task                     | Type         | Notes                                   |
| --- | ------------------------------------ | ------------ | --------------------------------------- |
| 1   | Project scaffolding (Next.js 15)     | Config       | App Router, TypeScript strict, Tailwind v4 |
| 2   | Design system tokens                 | Tokens       | Colors, typography, spacing, elevation, motion, breakpoints |
| 3   | Tailwind `@theme` configuration      | Config       | Light + dark palette, semantic tokens    |
| 4   | shadcn/ui setup + base components    | Components   | Button, Input, Card, Badge, Separator, Skeleton |
| 5   | Header                               | Component    | Logo, navigation, theme toggle, locale toggle, user menu slot |
| 6   | Footer                               | Component    | Links, copyright, social links           |
| 7   | MobileNav (drawer)                   | Component    | Hamburger menu, slide-in drawer          |
| 8   | RootLayout                           | Layout       | HTML structure, font loading, providers  |
| 9   | Theme toggle (light/dark)            | Feature      | Cookie-persisted, system preference default |
| 10  | i18n toggle (ja/en)                  | Feature      | Cookie-based locale switch, middleware   |
| 11  | i18n dictionary structure            | Config       | JSON dictionaries, `useTranslations` helper |
| 12  | Loading page (global)                | Page         | Skeleton with leaf animation             |
| 13  | Error pages (404, 500, generic)      | Pages        | Themed error states with navigation      |
| 14  | Test infrastructure                  | Config       | Vitest, Testing Library, Playwright, MSW, Storybook |
| 15  | CI pipeline                          | Config       | Lint, type-check, test, build, Lighthouse CI |
| 16  | ESLint + Prettier + Stylelint config | Config       | Including jsx-a11y plugin                |

### Acceptance Criteria

- [ ] `next build` succeeds with zero errors and zero warnings.
- [ ] All design tokens are defined and documented in Storybook.
- [ ] Header, Footer, and MobileNav render correctly in light and dark mode.
- [ ] Theme toggle persists across page reloads.
- [ ] Locale toggle switches all visible text between Japanese and English.
- [ ] 404 and 500 error pages render correctly.
- [ ] Loading skeleton page renders correctly.
- [ ] Vitest runs with at least one passing test.
- [ ] Playwright runs with at least one passing test.
- [ ] Storybook builds and serves all foundation components.
- [ ] CI pipeline passes: lint, type-check, test, build.
- [ ] Lighthouse scores meet minimum thresholds (Performance 90+, Accessibility 100).

### Estimated Component Count

~10 components (Button, Input, Card, Badge, Separator, Skeleton, Header, Footer, MobileNav, ThemeToggle)

### Dependencies

- None (this is the first phase).

---

## Phase 2: Public Pages

### Goal

Build all publicly accessible pages. Users can browse events, members, clubs, gallery, and reach the login page.

### Deliverables

| #   | Component / Task                     | Type         | Notes                                   |
| --- | ------------------------------------ | ------------ | --------------------------------------- |
| 1   | Home page                            | Page         | Hero section, featured events, community highlights |
| 2   | HeroCarousel                         | Component    | embla-carousel, auto-play, priority images |
| 3   | EventCard                            | Component    | Image, title, date, tags, status badge   |
| 4   | Events list page                     | Page         | Filterable by status/tag, paginated      |
| 5   | Event detail page                    | Page         | Banner, description (Markdown HTML), date, tags, organizer |
| 6   | MemberCard                           | Component    | Avatar, name, role badge                 |
| 7   | Members list page                    | Page         | Search by name, filterable, paginated    |
| 8   | Member detail page                   | Page         | Profile info, social links, gallery      |
| 9   | ClubCard                             | Component    | Club image, name, member count           |
| 10  | Clubs page                           | Page         | Club list with filtering                 |
| 11  | GalleryGrid (masonry)                | Component    | CSS Grid masonry layout                  |
| 12  | Lightbox                             | Component    | Framer Motion full-screen image viewer   |
| 13  | Gallery page                         | Page         | Masonry grid with lightbox               |
| 14  | Login page                           | Page         | Discord OAuth2 login button, redirect_to handling |
| 15  | Pagination component                 | Component    | Shared pagination for all list pages     |
| 16  | FilterBar component                  | Component    | Tag/status filtering for lists           |
| 17  | SearchInput component                | Component    | Debounced search for members             |
| 18  | EmptyState component                 | Component    | "No results found" state                 |
| 19  | Breadcrumb component                 | Component    | Navigation breadcrumbs for detail pages  |
| 20  | Tag / Badge components               | Component    | Event tags, role badges, status badges   |
| 21  | API integration (public endpoints)   | Integration  | Fetch events, members, clubs, gallery data |
| 22  | ISR configuration                    | Config       | Revalidation periods per route           |

### Acceptance Criteria

- [ ] All public pages render with real data from the backend API.
- [ ] ISR caching works — pages serve cached content and revalidate in background.
- [ ] Events list supports filtering by status (upcoming/past) and by tag.
- [ ] Members list supports search by name.
- [ ] Gallery masonry layout renders correctly at all breakpoints.
- [ ] Lightbox opens, navigates between images, and closes with keyboard and click.
- [ ] Login page redirects to Discord OAuth2 and handles callback.
- [ ] All pages pass Lighthouse Accessibility 100.
- [ ] All new components have Storybook stories.
- [ ] All new components have component tests (Vitest + Testing Library).
- [ ] E2E tests cover: home load, event list → detail, member search, gallery browse.
- [ ] Pages render correctly in both light and dark mode.
- [ ] Pages render correctly in both Japanese and English.

### Estimated Component Count

~15 new components + 8 pages

### Dependencies

- Phase 1 (foundation, layout, design tokens).
- Backend public API endpoints must be available.

---

## Phase 3: Authenticated Features

### Goal

Enable features for logged-in users: profile editing, reporting, user menu, and authentication middleware.

### Deliverables

| #   | Component / Task                     | Type         | Notes                                   |
| --- | ------------------------------------ | ------------ | --------------------------------------- |
| 1   | Auth middleware                       | Middleware   | Cookie-based session validation, redirect to login |
| 2   | UserMenu (Header dropdown)           | Component    | Avatar, name, profile link, admin link (if admin), logout |
| 3   | Profile editor page                  | Page         | Edit display name, bio (Markdown), avatar upload, social links |
| 4   | AvatarUpload component               | Component    | Image crop, preview, upload to MinIO via API |
| 5   | MarkdownEditor component             | Component    | Textarea with live preview, toolbar      |
| 6   | ReportDialog                         | Component    | Modal for reporting users/content, reason selection, description |
| 7   | Form validation (Zod + Server Actions)| Integration | Shared validation schemas, server-side validation |
| 8   | Toast notifications                  | Component    | Success/error feedback for mutations     |
| 9   | Auth context/provider                | Provider     | Current user data, permissions           |
| 10  | Protected route wrappers             | Utility      | HOC or layout-based auth checks          |

### Acceptance Criteria

- [ ] Unauthenticated users are redirected to login when accessing protected routes.
- [ ] After login, users are redirected back to the original page (`redirect_to`).
- [ ] Profile editor allows editing all profile fields with live Markdown preview.
- [ ] Avatar upload works with image cropping and preview.
- [ ] Report dialog submits report to backend API.
- [ ] Form validation shows errors on both client and server side.
- [ ] Toast notifications appear for successful and failed mutations.
- [ ] All new components have Storybook stories and tests.
- [ ] Integration tests cover: login redirect flow, profile edit and save.

### Estimated Component Count

~8 new components + 1 page

### Dependencies

- Phase 2 (public pages, login flow).
- Backend authentication endpoints.
- Backend profile API (GET/PUT).
- Backend report API (POST).
- MinIO upload endpoint.

---

## Phase 4: Admin

### Goal

Build the admin dashboard and all admin management pages for events, users, gallery, tags, reports, and clubs.

### Deliverables

| #   | Component / Task                     | Type         | Notes                                   |
| --- | ------------------------------------ | ------------ | --------------------------------------- |
| 1   | Admin layout                         | Layout       | Sidebar navigation, breadcrumbs, admin-only access |
| 2   | Admin dashboard page                 | Page         | Stats cards (users, events, reports), recent activity |
| 3   | StatsCard component                  | Component    | Metric display with icon and trend       |
| 4   | DataTable component                  | Component    | Sortable, searchable table with actions   |
| 5   | User management page                 | Page         | User list, search, role change, suspension |
| 6   | Event management page                | Page         | Event CRUD, status management             |
| 7   | EventForm component                  | Component    | Create/edit event form with Markdown editor |
| 8   | Gallery management page              | Page         | Image grid with delete capability         |
| 9   | Tag management page                  | Page         | Tag CRUD, color picker                    |
| 10  | Report management page               | Page         | Report list, status change, view context  |
| 11  | Club management page                 | Page         | Club list, edit, delete                   |
| 12  | ConfirmDialog component              | Component    | Destructive action confirmation            |
| 13  | Admin role middleware                 | Middleware   | Admin/moderator role check                |
| 14  | Bulk action support                  | Feature      | Multi-select and bulk operations on tables |

### Acceptance Criteria

- [ ] Non-admin users cannot access admin routes (redirected to home).
- [ ] Dashboard displays accurate stats fetched from the backend.
- [ ] All CRUD operations work: create, read, update, delete for events, tags, clubs.
- [ ] User management supports role changes and suspension.
- [ ] Report management allows status transitions (pending → reviewed → resolved).
- [ ] Gallery management allows image deletion with confirmation.
- [ ] All admin forms validate input with Zod schemas.
- [ ] DataTable supports sorting, searching, and pagination.
- [ ] All destructive actions require confirmation dialog.
- [ ] All admin pages have component tests and Storybook stories.
- [ ] Integration tests cover: admin CRUD operations, role-based access.

### Estimated Component Count

~10 new components + 7 pages

### Dependencies

- Phase 3 (authentication, middleware, form patterns).
- Backend admin API endpoints (see [backend-requirements.md](backend-requirements.md)).
- **Note:** Development can proceed with mock APIs (MSW) while backend endpoints are in progress.

---

## Phase 5: Polish

### Goal

Add animations, finalize Storybook, complete visual regression testing, optimize performance, and implement SEO.

### Deliverables

| #   | Component / Task                     | Type         | Notes                                   |
| --- | ------------------------------------ | ------------ | --------------------------------------- |
| 1   | Leaf particle animation              | Animation    | Canvas-based floating leaves on home page |
| 2   | Page transition animations           | Animation    | Framer Motion `AnimatePresence` for route changes |
| 3   | Stagger animations (lists)           | Animation    | Cards and list items animate in sequence |
| 4   | Micro-interactions                   | Animation    | Button bounce, hover lifts, focus rings  |
| 5   | Card hover effects                   | Animation    | Subtle lift + shadow on hover            |
| 6   | Skeleton loading animations          | Animation    | Shimmer effect for loading states        |
| 7   | Storybook completion                 | Docs         | All components documented with all states |
| 8   | Visual regression test suite         | Tests        | Playwright screenshots for all component variants |
| 9   | Performance optimization             | Optimization | Bundle analysis, code splitting, image optimization |
| 10  | Lighthouse CI enforcement            | CI           | Block merge if scores drop below threshold |
| 11  | Sitemap generation                   | SEO          | `next-sitemap` with ISR-aware URL list   |
| 12  | OGP meta tags                        | SEO          | Per-page Open Graph images and descriptions |
| 13  | JSON-LD structured data              | SEO          | Event, Organization, Person schemas      |
| 14  | `robots.txt`                         | SEO          | Proper crawl directives                  |
| 15  | Favicon and PWA manifest             | Assets       | App icons, manifest.json                 |
| 16  | `prefers-reduced-motion` support     | A11y         | Disable all animations when user prefers |

### Acceptance Criteria

- [ ] Leaf particle animation runs smoothly at 60fps on desktop.
- [ ] All animations respect `prefers-reduced-motion` — disabled when set.
- [ ] Storybook documents every component with all variants and states.
- [ ] Visual regression tests pass for all components across themes and breakpoints.
- [ ] Lighthouse Performance score ≥ 95 on all public pages.
- [ ] Lighthouse Accessibility score = 100 on all pages.
- [ ] Bundle size within budget: initial JS < 150KB gzipped, per-route < 50KB.
- [ ] Sitemap is generated and accessible at `/sitemap.xml`.
- [ ] OGP meta tags render correctly (testable via social media debuggers).
- [ ] JSON-LD structured data validates via Google Rich Results Test.
- [ ] All critical E2E paths pass in CI.

### Estimated Component Count

~5 new animation components + enhancements to existing components

### Dependencies

- Phase 4 (all features complete).
- All backend APIs finalized and stable.

---

## Phase Summary

| Phase | Name                    | New Components | New Pages | Key Milestone                      |
| ----- | ----------------------- | -------------- | --------- | ---------------------------------- |
| 1     | Foundation              | ~10            | 3         | Design system + layout + CI        |
| 2     | Public Pages            | ~15            | 8         | All public content browsable       |
| 3     | Authenticated Features  | ~8             | 1         | Users can edit profiles + report   |
| 4     | Admin                   | ~10            | 7         | Full admin functionality           |
| 5     | Polish                  | ~5             | 0         | Animations + SEO + performance     |
| **Total** |                     | **~48**        | **19**    |                                    |

---

## Phase Gate Process

At the end of each phase:

1. **Code Review** — All code reviewed and merged to main.
2. **QA Checklist** — Acceptance criteria verified (manual + automated).
3. **Performance Check** — Lighthouse CI scores meet thresholds.
4. **Accessibility Audit** — axe-core scan on all new pages.
5. **Stakeholder Demo** — Walk through new functionality.
6. **Go/No-Go Decision** — Proceed to next phase or address issues.
