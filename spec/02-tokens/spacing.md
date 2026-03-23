# Spacing & Layout System

Base unit, spacing scale, container widths, grid system, and density variants for the Autumn Soft theme.

---

## Base Unit

- **Atomic unit:** 4px (0.25rem)
- **Primary grid:** 8px (0.5rem) — all major spacing values are multiples of 8px
- **Rationale:** The 4px base provides fine granularity for micro-adjustments (icon gaps, chip padding), while the 8px grid ensures visual consistency at the layout level. All padding, margin, and gap values snap to the 4px grid.

---

## Spacing Scale

Complete spacing token set. All values are multiples of the 4px base unit.

| Token | Value (rem) | Value (px) | Tailwind Class | Primary Use Case |
|---|---|---|---|---|
| `--space-0` | 0 | 0 | `p-0`, `m-0`, `gap-0` | Reset, collapse |
| `--space-px` | 1px | 1px | `p-px` | Hairline borders, separators |
| `--space-0.5` | 0.125rem | 2px | `p-0.5`, `gap-0.5` | Micro gap between icon and text inline |
| `--space-1` | 0.25rem | 4px | `p-1`, `gap-1` | Inline icon spacing, compact lists |
| `--space-1.5` | 0.375rem | 6px | `p-1.5`, `gap-1.5` | Tag/chip vertical padding |
| `--space-2` | 0.5rem | 8px | `p-2`, `gap-2` | Tight padding (small buttons), inline groups |
| `--space-2.5` | 0.625rem | 10px | `p-2.5` | Badge padding, compact button padding-x |
| `--space-3` | 0.75rem | 12px | `p-3`, `gap-3` | Button padding-y, avatar-to-text gap |
| `--space-4` | 1rem | 16px | `p-4`, `gap-4` | Standard padding, mobile card padding, form field gap |
| `--space-5` | 1.25rem | 20px | `p-5`, `gap-5` | Card content padding (compact variant) |
| `--space-6` | 1.5rem | 24px | `p-6`, `gap-6` | Standard card padding, section padding, card grid gap |
| `--space-8` | 2rem | 32px | `p-8`, `gap-8` | Large card padding, form section groups, modal padding |
| `--space-10` | 2.5rem | 40px | `p-10`, `gap-10` | Section-to-section gap within a page |
| `--space-12` | 3rem | 48px | `p-12` | Login card padding, generous dialog padding |
| `--space-16` | 4rem | 64px | `p-16`, `py-16` | Page vertical padding (above/below content blocks) |
| `--space-20` | 5rem | 80px | `p-20`, `py-20` | Major section vertical spacing |
| `--space-24` | 6rem | 96px | `p-24`, `py-24` | Hero-to-content gap, page top spacing below hero |

### Commonly Used Combinations

| Element | Padding | Margin/Gap | Example Classes |
|---|---|---|---|
| Button (default) | `px-6 py-3` (24px × 12px) | — | `px-6 py-3` |
| Button (small) | `px-4 py-2` (16px × 8px) | — | `px-4 py-2` |
| Button (icon only) | `p-2.5` (10px) | — | `p-2.5` |
| Card (standard) | `p-6` (24px) | `gap-6` between cards | `p-6` |
| Card (compact/admin) | `p-4` (16px) | `gap-4` between cards | `p-4` |
| Form input | `px-4 py-3` (16px × 12px) | `gap-2` label-to-input | `px-4 py-3` |
| Modal content | `p-8` (32px) | — | `p-8` |
| Page section | `py-16 sm:py-20` | `gap-10` between sections | `py-16 sm:py-20` |
| Avatar to text | — | `gap-3` (12px) | `gap-3` |
| Badge | `px-2.5 py-0.5` (10px × 2px) | `gap-1.5` between badges | `px-2.5 py-0.5` |

---

## Layout Containers

### Container Max Widths

| Name | Max Width (rem) | Max Width (px) | Tailwind | Use Case |
|---|---|---|---|---|
| Content | 80rem | 1280px | `max-w-7xl mx-auto` | Standard page content (default) |
| Narrow | 42rem | 672px | `max-w-2xl mx-auto` | Login page, profile editor, single-column forms |
| Reading | 65ch | ~780px | `max-w-prose mx-auto` | Long-form text (event descriptions, markdown content) |
| Wide | 96rem | 1536px | `max-w-screen-2xl mx-auto` | Admin dashboard, gallery grid |
| Full | 100% | — | `max-w-full` | Hero sections, full-bleed backgrounds |

### Responsive Horizontal Padding

The page container adds horizontal padding to prevent content from touching viewport edges:

| Breakpoint | Padding-X | Tailwind | Effective Content Width |
|---|---|---|---|
| Default (0–639px) | 1rem (16px) | `px-4` | viewport − 32px |
| sm (640px+) | 1.5rem (24px) | `sm:px-6` | viewport − 48px |
| lg (1024px+) | 2rem (32px) | `lg:px-8` | viewport − 64px |

### Standard Page Container Pattern

```tsx
{/* Reusable container wrapper */}
<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

```tsx
{/* Narrow container for forms/login */}
<div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

---

## Grid System

### Primary Approach

Use **CSS Grid** for 2D layouts (card grids, page layouts) and **Flexbox** for 1D layouts (nav items, button groups, inline elements).

### Card Grid Pattern

```tsx
{/* Responsive card grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map(card => <Card key={card.id} {...card} />)}
</div>
```

### Grid Configurations by Context

| Context | Base | sm | md | lg | xl | 2xl | Gap |
|---|---|---|---|---|---|---|---|
| Event cards | 1 col | 2 col | 2 col | 3 col | 3 col | 3 col | `gap-6` |
| Member cards | 2 col | 2 col | 3 col | 4 col | 4 col | 5 col | `gap-4` |
| Gallery images | 2 col | 2 col | 3 col | 3 col | 4 col | 5 col | `gap-4` |
| Admin data cards | 1 col | 2 col | 2 col | 3 col | 4 col | 4 col | `gap-4` |
| Feature cards (home) | 1 col | 1 col | 2 col | 3 col | 3 col | 3 col | `gap-6` |

### Two-Column Page Layouts

For detail pages (event detail, member profile) at large breakpoints:

```tsx
{/* Detail page — stacked on mobile, two-col on desktop */}
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
  <main>{/* Primary content */}</main>
  <aside>{/* Sidebar info */}</aside>
</div>
```

### Admin Layout

```tsx
{/* Admin — sidebar + content */}
<div className="flex min-h-screen">
  {/* Sidebar: Sheet on mobile, persistent on lg+ */}
  <aside className="hidden lg:block w-64 shrink-0 border-r border-border">
    {/* Nav items */}
  </aside>
  <main className="flex-1 p-4 lg:p-8">
    {children}
  </main>
</div>
```

---

## Density Variants

Different areas of the application use different spacing densities based on their purpose and audience.

| Context | Card Padding | Element Gap | Section Spacing | Rationale |
|---|---|---|---|---|
| **Public pages** (home, events, members) | `p-6` to `p-8` | `gap-6` | `py-16 sm:py-20` | Spacious, breathable, inviting. Users are browsing casually. |
| **Detail pages** (event detail, profile) | `p-6` | `gap-6` | `py-10 sm:py-16` | Readable, comfortable for longer content. |
| **Admin pages** (data tables, management) | `p-4` to `p-6` | `gap-4` | `py-8 sm:py-12` | Tighter for data density. Admins need information at a glance. |
| **Forms** (login, profile editor) | `p-8 sm:p-12` | `gap-6` | `py-16` | Generous to feel calm, reduce form anxiety. |
| **Mobile (all contexts)** | `p-4` | `gap-4` | `py-10` | Reduced to accommodate small viewport. |
| **Dialogs / Modals** | `p-6 sm:p-8` | `gap-4` | — | Comfortable but contained. |
| **Toast / Notifications** | `p-4` | `gap-2` | — | Compact, not intrusive. |

### Public vs Admin Spacing Comparison

```
Public Card:
┌──────────────────────┐
│                      │  ← p-6 (24px) top
│   Title              │
│                      │  ← gap-3 (12px) between elements
│   Description...     │
│                      │  ← gap-4 (16px) to footer
│   Footer             │
│                      │  ← p-6 (24px) bottom
└──────────────────────┘

Admin Card:
┌──────────────────────┐
│                      │  ← p-4 (16px) top
│   Title              │
│                      │  ← gap-2 (8px) between elements
│   Data Row 1         │
│   Data Row 2         │
│                      │  ← p-4 (16px) bottom
└──────────────────────┘
```

---

## Design Philosophy

> **"Generous whitespace is core to Autumn Soft. When in doubt, add more space. Content should breathe, never feel cramped."**

Key principles:

1. **8px grid discipline.** Every major spacing decision aligns to the 8px grid. Exception: 6px (`space-1.5`) for chip/tag padding where 8px feels too loose.

2. **Vertical rhythm matters.** Consistent spacing between sections creates a calm scrolling experience. Public pages use `py-16` to `py-24` between major sections.

3. **Cards need breathing room.** Always `gap-6` for public card grids. Never `gap-2` or `gap-3` for cards — they merge visually.

4. **Touch-friendly mobile spacing.** All interactive elements maintain minimum 44px touch targets (height or width). Padding contributes to this.

5. **Asymmetric padding is rare.** Prefer uniform padding (`p-6`) over asymmetric (`px-6 py-4`). Exception: buttons, which have wider horizontal padding than vertical (`px-6 py-3`).

6. **Container prevents reading fatigue.** Content never exceeds `max-w-7xl` (1280px). Long-form text is capped at `max-w-prose` (~65 characters per line).
