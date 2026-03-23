# StatCard Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Displays a single KPI metric on the admin dashboard with icon, label, and value |
| **File path** | `components/features/admin/stat-card.tsx` |
| **Component type** | Server Component (no interaction, no browser APIs) |
| **When to use** | Admin dashboard overview row — shows total users, events, reports, etc. |
| **When NOT to use** | Public pages. Interactive statistics with drilldown. |

> **Note**: Admin components use `rounded-xl` (not `rounded-2xl`) for a slightly more compact, professional feel.

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `icon` | `LucideIcon` | — | Yes | Lucide icon component (e.g., `Users`, `Calendar`) |
| `label` | `string` | — | Yes | Metric label (e.g., "Total Users", "Active Events") |
| `value` | `number \| string` | — | Yes | Metric value (e.g., `1,234` or `"12.5%"`) |

### LucideIcon Type

```ts
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
}
```

---

## Visual Structure

```
<Card className="rounded-xl p-6                   ← border border-border/50
                 border border-border/50">

  <div className="flex items-center gap-4">

    <!-- Icon Container -->
    <div className="p-3 rounded-xl                 ← bg-primary/10
                    bg-primary/10                     shrink-0
                    shrink-0">
      <Icon className="w-6 h-6 text-primary" />      Passed as prop
    </div>

    <!-- Text -->
    <div>
      <p className="text-sm                        ← text-muted-foreground
                    text-muted-foreground">
        {label}
      </p>
      <p className="text-3xl font-bold             ← text-foreground tracking-tight
                    tracking-tight">
        {typeof value === "number"
          ? value.toLocaleString()                   Format numbers with locale
          : value}
      </p>
    </div>

  </div>
</Card>
```

---

## Variant × State Matrix

| State | Appearance | Notes |
|---|---|---|
| **Default** | As described above | Static display |
| **Loading** | Skeleton placeholder | Icon skeleton + text skeletons |

> StatCard has no hover, focus, active, or disabled states since it is non-interactive.

### Loading Skeleton

```
<Card className="rounded-xl p-6">
  <div className="flex items-center gap-4">
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
</Card>
```

---

## Responsive Behavior

| Breakpoint | Grid Columns | Card Layout |
|---|---|---|
| **< sm** (< 640px) | 1 column | Full width |
| **sm** (640px) | 2 columns | Side by side |
| **lg** (1024px) | 4 columns | Dashboard row |

> Grid layout is defined by the parent admin dashboard page, not the card.

All card internals remain the same across breakpoints — the horizontal icon + text layout works at all sizes.

---

## Accessibility

### Semantics

| Element | Role/Attribute | Notes |
|---|---|---|
| Card root | `<div>` (Card) | No interactive role needed |
| Icon | `aria-hidden="true"` | Decorative — label provides context |
| Label | `<p>` | Descriptive text |
| Value | `<p>` | Content linked to label by proximity |

### Screen Reader

- Read naturally: "{label} {value}" (e.g., "Total Users 1,234")
- No keyboard interaction needed (non-interactive)
- Consider wrapping in a `<dl>/<dt>/<dd>` for better semantic structure:

```tsx
<dl>
  <dt className="text-sm text-muted-foreground">{label}</dt>
  <dd className="text-3xl font-bold tracking-tight">
    {formattedValue}
  </dd>
</dl>
```

---

## Animation

No Framer Motion animations. StatCard is a Server Component with no client-side JS.

### Optional: Number Count-Up

If a count-up animation is desired in the future, this would require converting to a Client Component:

```ts
// Not implemented by default — only if explicitly requested
const countUpVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};
```

---

## Dark Mode

| Element | Light | Dark |
|---|---|---|
| Card bg | `bg-card` | Same (token adapts) |
| Card border | `border-border/50` | Same |
| Icon bg | `bg-primary/10` | Same |
| Icon color | `text-primary` | Same |
| Label | `text-muted-foreground` | Same |
| Value | `text-foreground` | Same |

No special dark-mode overrides — semantic tokens handle the switch.

---

## Usage Example

```tsx
// Admin dashboard page
import { StatCard } from "@/components/features/admin/stat-card";
import { Users, Calendar, Flag, Image } from "lucide-react";

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard icon={Users}    label="Total Users"    value={1234} />
  <StatCard icon={Calendar} label="Active Events"  value={42} />
  <StatCard icon={Flag}     label="Open Reports"   value={7} />
  <StatCard icon={Image}    label="Gallery Images"  value={856} />
</div>
```

---

## Related Components

- [AdminDataTable](data-table.md) — data tables below the stat cards on the dashboard
- [AdminSidebar](../layout/admin-sidebar.md) — admin navigation
