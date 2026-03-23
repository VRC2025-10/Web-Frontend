# Component Catalogue

## Overview

This catalogue defines every UI component used in the VRChat October Cohort community website.  
All components follow the **"Autumn Soft"** design language — warm ivory base, coral/mustard accents, generous rounded corners (`rounded-2xl` default), soft brown shadows, and Framer Motion spring animations.

---

## Component Classification Tree

```
components/
├── ui/                         # shadcn/ui primitives (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── tabs.tsx
│   ├── sheet.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tooltip.tsx
│   ├── skeleton.tsx
│   ├── separator.tsx
│   ├── form.tsx
│   ├── label.tsx
│   ├── alert.tsx
│   ├── pagination.tsx
│   ├── sidebar.tsx
│   ├── carousel.tsx
│   ├── sonner.tsx
│   ├── select.tsx
│   └── popover.tsx
├── layout/                     # Page-level structural components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── mobile-nav.tsx
│   └── admin-sidebar.tsx
├── features/                   # Domain-specific components
│   ├── events/
│   │   └── event-card.tsx
│   ├── members/
│   │   └── member-card.tsx
│   ├── clubs/
│   │   └── club-card.tsx
│   └── admin/
│       ├── stat-card.tsx
│       └── data-table.tsx
└── shared/                     # Cross-cutting reusable components
    ├── theme-toggle.tsx
    ├── language-switcher.tsx
    └── tag-chip.tsx
```

### Category Breakdown

| Category | Purpose | Examples |
|---|---|---|
| **layout** | Page chrome — header, footer, navigation shells | Header, Footer, MobileNav, AdminSidebar |
| **data-display** | Read-only presentation of data | EventCard, MemberCard, ClubCard, StatCard, DataTable |
| **input** | Form controls and user input | (uses shadcn/ui: Input, Textarea, Select, Switch, Form) |
| **feedback** | Status and notification | (uses shadcn/ui: Alert, Skeleton, Sonner) |
| **overlay** | Dialogs, popovers, sheets | (uses shadcn/ui: Dialog, Sheet, DropdownMenu, Popover, Tooltip) |
| **shared** | Utility components used across features | ThemeToggle, LanguageSwitcher, TagChip |

---

## shadcn/ui Components to Install

Run these commands to scaffold the UI primitives:

```bash
npx shadcn@latest add button card input textarea dialog dropdown-menu tabs sheet avatar badge switch table tooltip skeleton separator form label alert pagination sidebar carousel sonner select popover
```

### Full List (24 components)

| Component | Primary Use |
|---|---|
| `Button` | Actions, navigation triggers |
| `Card` | Content containers (EventCard, MemberCard, etc.) |
| `Input` | Text fields, search bars |
| `Textarea` | Multi-line text (bio, description) |
| `Dialog` | Confirmation modals, detail views |
| `DropdownMenu` | User menu, column visibility, context actions |
| `Tabs` | Profile sections, admin sub-views |
| `Sheet` | Mobile navigation, side panels |
| `Avatar` | User profile images |
| `Badge` | Status indicators, role labels |
| `Switch` | Boolean toggles (profile visibility) |
| `Table` | Admin data tables |
| `Tooltip` | Icon button labels, truncated text |
| `Skeleton` | Loading placeholders |
| `Separator` | Visual dividers |
| `Form` | Form state management (react-hook-form integration) |
| `Label` | Form field labels |
| `Alert` | Inline notifications, warnings |
| `Pagination` | Page navigation for lists/tables |
| `Sidebar` | Admin panel left navigation |
| `Carousel` | Image galleries, hero sections |
| `Sonner` | Toast notifications |
| `Select` | Dropdowns for options (role, tags) |
| `Popover` | Filter panels, date pickers |

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Component files | PascalCase export, kebab-case file | `event-card.tsx` → `export function EventCard` |
| Tailwind classes | kebab-case, ordered by layout→spacing→visual | `flex items-center gap-2 rounded-2xl bg-card` |
| Props interfaces | `{ComponentName}Props` | `EventCardProps` |
| CSS custom properties | `--{category}-{name}` | `--color-primary` |

---

## Composition Pattern

Use **compound components with slots** for complex UI containers:

```tsx
// Card composition
<Card>
  <CardHeader>
    <CardTitle>Event Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main body */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

```tsx
// Table composition
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Value</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Import Patterns

```tsx
// shadcn/ui primitives — from @/components/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Feature components — from @/components/features/{domain}
import { EventCard } from "@/components/features/events/event-card";
import { MemberCard } from "@/components/features/members/member-card";
import { DataTable } from "@/components/features/admin/data-table";

// Layout components — from @/components/layout
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Shared components — from @/components/shared
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { TagChip } from "@/components/shared/tag-chip";

// Icons — from lucide-react
import { Calendar, User, Settings } from "lucide-react";
```

---

## Component Type Decision Rules

| Condition | Type | Reason |
|---|---|---|
| Requires `useState`, `useEffect`, event handlers | **Client Component** | Uses React hooks or browser APIs |
| Only renders props / server data, no interactivity | **Server Component** | Can be rendered on the server for performance |
| Uses Framer Motion `motion.*` | **Client Component** | Framer Motion requires client-side JS |
| Uses `useRouter`, `usePathname`, `useSearchParams` | **Client Component** | Next.js client hooks |
| Uses scroll detection, IntersectionObserver | **Client Component** | Browser API |
| Pure presentational with server-fetched data | **Server Component** | No JS shipped to client |

### Decision Flowchart

```
Does the component need...
  ├─ useState / useReducer?          → Client
  ├─ useEffect / useLayoutEffect?    → Client
  ├─ onClick / onChange / onSubmit?   → Client
  ├─ Framer Motion animation?        → Client
  ├─ Browser APIs (scroll, resize)?  → Client
  ├─ Context consumers?              → Client
  └─ None of the above?              → Server ✓
```

---

## Spec File Index

### Layout

| Component | Spec | Type |
|---|---|---|
| Header | [layout/header.md](layout/header.md) | Client |
| Footer | [layout/footer.md](layout/footer.md) | Server |
| MobileNav | [layout/mobile-nav.md](layout/mobile-nav.md) | Client |
| AdminSidebar | [layout/admin-sidebar.md](layout/admin-sidebar.md) | Client |

### Data Display

| Component | Spec | Type |
|---|---|---|
| EventCard | [data-display/event-card.md](data-display/event-card.md) | Client |
| MemberCard | [data-display/member-card.md](data-display/member-card.md) | Client |
| ClubCard | [data-display/club-card.md](data-display/club-card.md) | Client |
| StatCard | [data-display/stat-card.md](data-display/stat-card.md) | Server |
| AdminDataTable | [data-display/data-table.md](data-display/data-table.md) | Client |
