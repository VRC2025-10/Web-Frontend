# Directory Structure

> Version: 1.0 | Last updated: 2026-03-20

This document defines the complete source directory structure, file organization rules, naming conventions, and the Server Component vs Client Component decision tree.

---

## 1. Full Directory Tree

```
src/
├── app/                              # Next.js App Router — file-based routing
│   ├── layout.tsx                    # Root layout: ThemeProvider, NextIntlClientProvider, Toaster, fonts
│   ├── loading.tsx                   # Global loading fallback (skeleton)
│   ├── not-found.tsx                 # 404 page (minimal layout, no Header/Footer)
│   ├── error.tsx                     # Global error boundary (minimal layout)
│   ├── sitemap.ts                    # Dynamic sitemap.xml generation
│   ├── robots.ts                     # robots.txt generation
│   │
│   ├── (public)/                     # Route group — Public layout (Header + Footer)
│   │   ├── layout.tsx                # Public layout: Header, <main>, Footer
│   │   ├── page.tsx                  # / (Home) — ISR 60s
│   │   ├── events/
│   │   │   ├── page.tsx              # /events — SSR (URL query params)
│   │   │   └── [id]/
│   │   │       └── page.tsx          # /events/[id] — ISR 60s
│   │   ├── members/
│   │   │   ├── page.tsx              # /members — ISR 60s + client search
│   │   │   └── [id]/
│   │   │       └── page.tsx          # /members/[id] — ISR 60s
│   │   ├── clubs/
│   │   │   ├── page.tsx              # /clubs — ISR 60s
│   │   │   └── [id]/
│   │   │       └── page.tsx          # /clubs/[id] — ISR 60s
│   │   └── login/
│   │       └── page.tsx              # /login — Static (redirect if authenticated)
│   │
│   ├── admin/                        # Admin section — AdminSidebar layout
│   │   ├── layout.tsx                # Admin layout: AdminSidebar + main content
│   │   ├── page.tsx                  # /admin (Dashboard) — SSR no-store
│   │   ├── users/
│   │   │   └── page.tsx              # /admin/users — SSR no-store
│   │   ├── galleries/
│   │   │   └── page.tsx              # /admin/galleries — SSR no-store
│   │   ├── events/
│   │   │   └── page.tsx              # /admin/events — SSR no-store
│   │   ├── tags/
│   │   │   └── page.tsx              # /admin/tags — SSR no-store
│   │   ├── reports/
│   │   │   └── page.tsx              # /admin/reports — SSR no-store
│   │   └── clubs/
│   │       └── page.tsx              # /admin/clubs — SSR no-store
│   │
│   └── settings/
│       └── profile/
│           └── page.tsx              # /settings/profile — SSR no-store (auth required)
│
├── components/
│   ├── ui/                           # shadcn/ui primitives (generated via CLI)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   ├── switch.tsx
│   │   ├── checkbox.tsx
│   │   └── ...                       # Additional shadcn/ui components as needed
│   │
│   ├── layout/                       # Layout-level structural components
│   │   ├── header.tsx                # Site header with nav, logo, user menu, locale toggle
│   │   ├── footer.tsx                # Site footer with links and locale toggle
│   │   ├── mobile-nav.tsx            # Sheet-based mobile navigation
│   │   └── admin-sidebar.tsx         # Admin dashboard sidebar navigation
│   │
│   ├── features/                     # Domain-specific feature components
│   │   ├── events/
│   │   │   ├── event-card.tsx        # Event listing card
│   │   │   ├── event-detail.tsx      # Event detail content
│   │   │   ├── event-filters.tsx     # Event list filter controls
│   │   │   └── event-list.tsx        # Event card grid
│   │   ├── members/
│   │   │   ├── member-card.tsx       # Member avatar card
│   │   │   ├── member-detail.tsx     # Member profile detail
│   │   │   ├── member-search.tsx     # Client-side debounced search
│   │   │   └── member-grid.tsx       # Member card grid
│   │   ├── clubs/
│   │   │   ├── club-card.tsx         # Club cover card
│   │   │   ├── club-detail.tsx       # Club detail content
│   │   │   ├── club-gallery.tsx      # Gallery image grid + lightbox
│   │   │   └── club-list.tsx         # Club card grid
│   │   ├── profile/
│   │   │   ├── profile-form.tsx      # Profile editor form (react-hook-form)
│   │   │   ├── bio-preview.tsx       # Markdown bio live preview
│   │   │   └── avatar-display.tsx    # Avatar with fallback
│   │   ├── admin/
│   │   │   ├── data-table.tsx        # Generic admin data table (@tanstack/react-table)
│   │   │   ├── stat-card.tsx         # Dashboard statistics card
│   │   │   ├── user-role-select.tsx  # Role change dropdown
│   │   │   ├── gallery-status.tsx    # Gallery image approval controls
│   │   │   └── report-detail.tsx     # Report review dialog
│   │   └── auth/
│   │       ├── login-button.tsx      # Discord OAuth login button
│   │       ├── user-menu.tsx         # Authenticated user dropdown menu
│   │       └── auth-guard.tsx        # RSC auth check wrapper
│   │
│   └── shared/                       # Reusable non-domain components
│       ├── leaf-particles.tsx        # Autumn leaf floating animation
│       ├── empty-state.tsx           # Empty state with icon + message
│       ├── pagination.tsx            # Page-number pagination controls
│       ├── section-header.tsx        # Section title with optional action link
│       ├── tag-chip.tsx              # Colored tag badge
│       ├── error-display.tsx         # Inline error message component
│       └── image-lightbox.tsx        # Full-screen image viewer
│
├── lib/
│   ├── api/                          # API client layer
│   │   ├── client.ts                 # Base fetch wrapper: cookie forwarding, error handling, timeouts
│   │   ├── events.ts                 # Event API functions: getEvents(), getEventById()
│   │   ├── members.ts               # Member API functions: getMembers(), getMemberById()
│   │   ├── clubs.ts                  # Club API functions: getClubs(), getClubById(), getClubGallery()
│   │   ├── auth.ts                   # Auth API functions: getMe(), logout()
│   │   ├── profile.ts               # Profile API functions: getMyProfile(), updateMyProfile()
│   │   ├── admin.ts                  # Admin API functions: getAdminUsers(), updateUserRole(), etc.
│   │   └── types.ts                  # API response TypeScript type definitions
│   ├── utils.ts                      # General utilities: cn() (clsx + tailwind-merge)
│   ├── date.ts                       # date-fns wrappers with locale support
│   └── validations/                  # Zod schemas for form validation
│       ├── profile.ts                # ProfileFormSchema
│       ├── report.ts                 # ReportFormSchema
│       └── admin.ts                  # Admin form schemas
│
├── actions/                          # Server Actions (form mutations)
│   ├── profile.ts                    # updateProfile action
│   ├── report.ts                     # submitReport action
│   ├── auth.ts                       # logout action
│   └── admin.ts                      # Admin mutation actions (role change, gallery approval)
│
├── hooks/                            # Custom React hooks
│   ├── use-debounce.ts               # Debounced value hook
│   └── use-media-query.ts            # Responsive breakpoint hook
│
├── i18n/                             # Internationalization
│   ├── config.ts                     # next-intl configuration
│   ├── request.ts                    # getRequestConfig for next-intl
│   └── messages/
│       ├── ja.json                   # Japanese translations (primary)
│       └── en.json                   # English translations (secondary)
│
└── middleware.ts                      # Next.js middleware: auth redirects, locale handling
```

---

## 2. File Organization Rules

### 2.1 Route Files (`app/`)

| Rule | Description |
|---|---|
| **One page per route** | Each route maps to exactly one `page.tsx` file |
| **Route groups for layouts** | `(public)` wraps pages sharing Header + Footer |
| **Colocation** | Route-specific loading/error files live next to their `page.tsx` |
| **No component logic in pages** | Pages are thin wrappers: fetch data → pass to components |
| **Dynamic segments** | Use `[id]` folders for parameterized routes |

### 2.2 Components (`components/`)

| Directory | Purpose | Examples |
|---|---|---|
| `ui/` | shadcn/ui primitives, never modified directly | `button.tsx`, `dialog.tsx`, `card.tsx` |
| `layout/` | App shell structural components | `header.tsx`, `footer.tsx`, `admin-sidebar.tsx` |
| `features/{domain}/` | Domain-specific business components | `event-card.tsx`, `profile-form.tsx` |
| `shared/` | Reusable across domains, not tied to a feature | `pagination.tsx`, `empty-state.tsx` |

**Placement decision:**
1. Is it a shadcn/ui primitive? → `ui/`
2. Is it part of the app shell (header, footer, sidebar)? → `layout/`
3. Is it tied to a specific domain (events, members, etc.)? → `features/{domain}/`
4. Is it reused across multiple domains? → `shared/`

### 2.3 API Layer (`lib/api/`)

| Rule | Description |
|---|---|
| **One file per domain** | `events.ts`, `members.ts`, `clubs.ts`, etc. |
| **Typed returns** | All functions return typed promises: `Promise<PublicEvent[]>` |
| **No direct fetch in components** | Components import from `lib/api/`, never call `fetch()` directly |
| **Central client** | `client.ts` handles base URL, cookie forwarding, error handling |
| **Types in one file** | All API response types centralized in `types.ts` |

### 2.4 Server Actions (`actions/`)

| Rule | Description |
|---|---|
| **One file per domain** | Mirrors the `lib/api/` structure |
| **`"use server"` directive** | Every file starts with `"use server"` |
| **Validation first** | Parse input with Zod before calling API |
| **Return typed results** | Return `{ success: true, data }` or `{ success: false, error }` |

---

## 3. Naming Conventions

### 3.1 Files and Directories

| Pattern | Convention | Example |
|---|---|---|
| Components | `kebab-case.tsx` | `event-card.tsx`, `admin-sidebar.tsx` |
| Hooks | `use-{name}.ts` | `use-debounce.ts` |
| API client files | `{domain}.ts` | `events.ts`, `auth.ts` |
| Zod schemas | `{domain}.ts` | `validations/profile.ts` |
| Server Actions | `{domain}.ts` | `actions/profile.ts` |
| Pages | `page.tsx` (Next.js convention) | `app/(public)/events/page.tsx` |
| Layouts | `layout.tsx` (Next.js convention) | `app/admin/layout.tsx` |

### 3.2 Exports

| Pattern | Convention | Example |
|---|---|---|
| Components | Named export, PascalCase | `export function EventCard()` |
| Hooks | Named export, camelCase with `use` prefix | `export function useDebounce()` |
| API functions | Named export, camelCase with verb prefix | `export async function getEvents()` |
| Server Actions | Named export, camelCase with verb prefix | `export async function updateProfile()` |
| Types/Interfaces | Named export, PascalCase | `export interface PublicEvent` |
| Zod schemas | Named export, PascalCase with `Schema` suffix | `export const ProfileFormSchema` |

### 3.3 Component File Structure

```tsx
// 1. "use client" directive (only if needed)
"use client";

// 2. External imports
import { motion } from "framer-motion";

// 3. Internal imports
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 4. Types (inline or imported)
interface EventCardProps { ... }

// 5. Component definition (named export)
export function EventCard({ event }: EventCardProps) {
  return ( ... );
}
```

---

## 4. Server Component vs Client Component Decision Tree

```
                    ┌─────────────────────────────┐
                    │   Does this component need:  │
                    │   • useState / useReducer     │
                    │   • useEffect                │
                    │   • Event handlers (onClick)  │
                    │   • Browser APIs             │
                    │   • Framer Motion            │
                    │   • react-hook-form          │
                    │   • Third-party client libs  │
                    └──────────────┬───────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                        YES                  NO
                         │                   │
                         ▼                   ▼
                  ┌──────────────┐   ┌──────────────────┐
                  │   "use client"│   │ Server Component  │
                  │   Client     │   │ (default)         │
                  │   Component  │   │ Can fetch data    │
                  └──────────────┘   │ Can use async/    │
                                     │ await directly    │
                                     └──────────────────┘
```

### Decision Table

| Component | Type | Reason |
|---|---|---|
| `page.tsx` (all routes) | **Server** | Data fetching with `async/await`, no interactivity needed |
| `layout.tsx` (root) | **Server** | Static shell, provider setup |
| `layout.tsx` (public) | **Server** | Static structure wrapping Header + Footer |
| `layout.tsx` (admin) | **Server** | Static structure wrapping AdminSidebar |
| `header.tsx` | **Client** | User menu dropdown, mobile nav toggle, locale switch |
| `footer.tsx` | **Server** | Static content with links (locale toggle can be a nested client component) |
| `mobile-nav.tsx` | **Client** | Sheet open/close state, navigation interactions |
| `admin-sidebar.tsx` | **Client** | Active link highlighting, mobile collapse, sheet state |
| `event-card.tsx` | **Client** | Framer Motion hover/tap animations |
| `member-card.tsx` | **Client** | Framer Motion animations |
| `club-card.tsx` | **Client** | Framer Motion animations |
| `event-filters.tsx` | **Client** | URL state management, filter interactions |
| `member-search.tsx` | **Client** | Debounced input, client-side fetch |
| `profile-form.tsx` | **Client** | react-hook-form, Zod validation, onChange handlers |
| `data-table.tsx` | **Client** | @tanstack/react-table, sorting, filtering, pagination |
| `login-button.tsx` | **Client** | onClick handler for OAuth redirect |
| `user-menu.tsx` | **Client** | Dropdown state, logout handler |
| `leaf-particles.tsx` | **Client** | Framer Motion continuous animation |
| `pagination.tsx` | **Client** | Click handlers, URL updates |
| `empty-state.tsx` | **Server** | Static display |
| `section-header.tsx` | **Server** | Static display |
| `tag-chip.tsx` | **Server** | Static display |
| `stat-card.tsx` | **Server** | Static display (data passed as props) |

### Key Principle: Push `"use client"` Down

Pages remain Server Components. Interactive elements are isolated into the smallest possible Client Component leaf nodes. This maximizes server-side rendering and minimizes client JavaScript bundle.

```
page.tsx (Server) ─── fetches data
  └── EventList (Server) ─── maps over data
        └── EventCard (Client) ─── Framer Motion animation
              └── TagChip (Server) ─── static display
```

When a Server Component child needs to be nested inside a Client Component, use the `children` prop pattern:

```tsx
// Client Component
"use client";
export function InteractiveWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div onClick={() => setOpen(!open)}>{children}</div>;
}

// Server Component parent
export default async function Page() {
  const data = await fetchData();
  return (
    <InteractiveWrapper>
      <ServerRenderedContent data={data} />
    </InteractiveWrapper>
  );
}
```

---

## 5. Import Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

All imports use the `@/` alias to reference `src/`:

```tsx
import { getEvents } from "@/lib/api/events";
import { EventCard } from "@/components/features/events/event-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

---

## 6. Special Files

| File | Purpose |
|---|---|
| `middleware.ts` | Auth redirects (`/settings/*`, `/admin/*` → `/login`), login redirect if authenticated |
| `app/sitemap.ts` | Dynamic sitemap.xml generation for public routes |
| `app/robots.ts` | robots.txt: allow public, disallow `/admin`, `/settings` |
| `app/not-found.tsx` | Custom 404 page |
| `app/error.tsx` | Global error boundary |
| `app/loading.tsx` | Global loading skeleton fallback |
| `i18n/config.ts` | next-intl locale configuration |
| `i18n/request.ts` | `getRequestConfig()` for server-side locale resolution |
