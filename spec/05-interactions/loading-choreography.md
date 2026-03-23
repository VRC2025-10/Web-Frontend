# Loading Choreography

> Version: 1.0 | Last updated: 2026-03-20

Defines how loading states transition to content across the VRC community website. Every data-fetching boundary follows a consistent skeleton → fade-in pattern, creating a cohesive "content revealing itself" experience aligned with the Autumn Soft theme.

---

## Table of Contents

1. [Choreography Principles](#1-choreography-principles)
2. [Loading Hierarchy](#2-loading-hierarchy)
3. [Staggered List Entrance](#3-staggered-list-entrance)
4. [Image Loading](#4-image-loading)
5. [Page-Level Loading](#5-page-level-loading)
6. [Section-Level Loading](#6-section-level-loading)
7. [Button Loading](#7-button-loading)
8. [Data Table Loading](#8-data-table-loading)
9. [Form Submission](#9-form-submission)
10. [Progressive Reveal](#10-progressive-reveal)
11. [Skeleton Design Tokens](#11-skeleton-design-tokens)
12. [Reduced Motion](#12-reduced-motion)

---

## 1. Choreography Principles

| Principle | Detail |
|---|---|
| **Skeleton-first** | Always show a skeleton that matches the target content shape. Never show a blank space. |
| **Single transition type** | Content fades in. No sliding, bouncing, or scaling for content reveals. Keeps cognitive load low. |
| **Top-down, left-to-right** | Stagger order follows reading direction for LTR layouts. |
| **Fast reveal** | Content appears within 200 ms of data arrival. No artificial delay. |
| **No layout shift** | Skeletons must match the exact dimensions of the rendered content to prevent CLS. |

---

## 2. Loading Hierarchy

```
┌─────────────────────────────────────────────┐
│  Page-level loading                         │
│  └─ loading.tsx → LeafSpinner or Skeleton   │
│                                             │
│  Section-level loading                      │
│  └─ <Suspense fallback={<SectionSkeleton>}> │
│                                             │
│  Component-level loading                    │
│  └─ Inline skeleton / spinner              │
│                                             │
│  Image loading                              │
│  └─ Muted placeholder → fade-in            │
└─────────────────────────────────────────────┘
```

### 2.1 Transition Pattern

Every loading boundary follows this sequence:

```
Skeleton (visible immediately)
  ↓ data arrives
Content fades in (opacity 0→1, duration 200ms, ease-out)
  ↓ skeleton removed
Done
```

### 2.2 Base Fade-In Variant

```tsx
// lib/animation-variants.ts

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
  },
};
```

---

## 3. Staggered List Entrance

Used for card grids (events, members, clubs) and list views.

### 3.1 Parameters

| Token | Value |
|---|---|
| `staggerChildren` | `0.05s` (50 ms) |
| Child variant | `fadeInUp` (opacity 0→1, y 8→0) |
| Child duration | `250ms` |
| Child easing | `cubic-bezier(0, 0, 0.2, 1)` |
| Max stagger count | `12` items — items beyond 12 appear simultaneously to avoid long waits |

### 3.2 Reference Implementation

```tsx
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animation-variants";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      // Limit effective stagger to first 12 items
    },
  },
};

export function StaggeredGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp}>
      {children}
    </motion.div>
  );
}
```

### 3.3 Timing Visualization

```
Item 1:  |████████|                          (0ms → 250ms)
Item 2:    |████████|                        (50ms → 300ms)
Item 3:      |████████|                      (100ms → 350ms)
Item 4:        |████████|                    (150ms → 400ms)
...
Item 12:                       |████████|    (550ms → 800ms)
Item 13+:                      |████████|    (550ms → 800ms, no further stagger)
```

---

## 4. Image Loading

### 4.1 Strategy

All images use a muted placeholder background that matches the skeleton color, then cross-fade to the loaded image.

| Phase | Visual |
|---|---|
| Pending | Muted background (`hsl(var(--muted))`) with optional blur-hash or dominant color |
| Loading | Same as pending (no spinner on images) |
| Loaded | Image fades in: `opacity 0→1` over `300ms ease-out` |
| Error | Show fallback icon on muted background |

### 4.2 Reference Implementation

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export function FadeImage({ src, alt, ...props }: React.ComponentProps<typeof Image>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden bg-muted">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      >
        <Image
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          {...props}
        />
      </motion.div>
    </div>
  );
}
```

### 4.3 Blur Hash (Optional Enhancement)

For event hero images and member avatars, generate a blur hash at upload time and store it alongside the image URL. Render the blur hash as a CSS `background-image` using a tiny base64 data URI.

---

## 5. Page-Level Loading

### 5.1 Full-Page Spinner

Used in the root `(public)/loading.tsx` and `(auth)/loading.tsx` when no more specific skeleton is available.

```tsx
// app/(public)/loading.tsx
import { LeafSpinner } from "@/components/ui/leaf-spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LeafSpinner size="lg" />
    </div>
  );
}
```

Leaf spinner details: see [./page-transitions.md](./page-transitions.md#32-leaf-spinner).

### 5.2 Full-Page Skeleton

For routes with known layouts (event list, member grid), `loading.tsx` renders a full skeleton instead of a spinner.

```tsx
// app/(public)/events/loading.tsx
import { EventListSkeleton } from "@/components/skeletons/event-list-skeleton";

export default function Loading() {
  return <EventListSkeleton />;
}
```

---

## 6. Section-Level Loading

Used when a page has multiple independent data-fetching sections wrapped in `<Suspense>`.

### 6.1 Pattern

```tsx
<Suspense fallback={<SectionSkeleton />}>
  <AsyncSection />
</Suspense>
```

### 6.2 Section Skeleton Shapes

| Section | Skeleton |
|---|---|
| Event sidebar (upcoming events) | 3 rows: circle + 2 text lines each |
| Member spotlight | 4 circular avatars + name bars |
| Activity feed | 5 rows: avatar + paragraph block |
| Stats dashboard | 4 rectangular stat cards |
| Comments | 3 rows: avatar + multi-line block |

### 6.3 Skeleton Component Template

```tsx
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
```

---

## 7. Button Loading

### 7.1 States

| State | Visual |
|---|---|
| Idle | Normal button label |
| Loading | Label hidden (`opacity: 0`), spinner centered, button `disabled`, width preserved |
| Success | Brief checkmark icon (500 ms), then return to idle |

### 7.2 Implementation

```tsx
import { Loader2 } from "lucide-react";

export function SubmitButton({ loading, children, ...props }) {
  return (
    <button
      disabled={loading}
      className="relative inline-flex items-center justify-center"
      {...props}
    >
      <span className={loading ? "opacity-0" : "opacity-100"}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Submitting…</span>
        </span>
      )}
    </button>
  );
}
```

### 7.3 Width Preservation

The button's `min-width` is set to its idle width (via `min-w-[var(--btn-width)]` or fixed sizing) to prevent layout shift when the label swaps to a spinner.

---

## 8. Data Table Loading

### 8.1 Skeleton Rows

| Token | Value |
|---|---|
| Row count | `8` skeleton rows (matching default page size) |
| Cell shape | Rounded rectangle matching column width |
| Header | Real header rendered; only body rows are skeletons |
| Shimmer | Standard skeleton shimmer animation |

### 8.2 Implementation

```tsx
export function DataTableSkeleton({ columns, rows = 8 }: {
  columns: number;
  rows?: number;
}) {
  return (
    <div role="status" aria-label="Loading table data">
      <table className="w-full">
        <thead>
          {/* Real header rendered by parent */}
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-border">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div className="skeleton h-4 w-full rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading table data…</span>
    </div>
  );
}
```

See also: [../03-components/data-display/data-table.md](../03-components/data-display/data-table.md).

---

## 9. Form Submission

### 9.1 Flow

```
User clicks submit
  ↓
Button enters loading state (spinner, disabled)
  ↓
All form inputs become disabled (pointer-events: none, opacity: 0.7)
  ↓
On success → success feedback (see feedback-animations.md)
On error → error feedback (see feedback-animations.md)
  ↓
Button returns to idle, inputs re-enabled
```

### 9.2 Implementation Notes

- Use React's `useTransition` or `useFormStatus` for server actions.
- Button loading state is driven by `isPending` from the hook.
- Do **not** add artificial delay after submission completes.
- Form re-enablement is instant on response.

---

## 10. Progressive Reveal

For long content pages (event detail, club detail), content sections reveal progressively as the user scrolls.

### 10.1 Intersection Observer Pattern

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}
```

### 10.2 Parameters

| Token | Value |
|---|---|
| Trigger margin | `-80px` (starts animation 80 px before element enters viewport) |
| Initial offset `y` | `16px` |
| Duration | `400ms` |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` |
| `once` | `true` — does not re-animate on re-entry |

### 10.3 Usage Limits

- Only use on **below-the-fold** content. Above-the-fold content must be visible immediately (no animation delay on initial render).
- Maximum 6 reveal sections per page to avoid excessive observer overhead.

---

## 11. Skeleton Design Tokens

| Token | CSS Variable / Value |
|---|---|
| `skeleton-base` | `hsl(var(--muted))` |
| `skeleton-highlight` | `hsl(var(--muted-foreground) / 0.06)` |
| `skeleton-radius-sm` | `4px` (`rounded`) |
| `skeleton-radius-md` | `8px` (`rounded-lg`) |
| `skeleton-radius-lg` | `16px` (`rounded-2xl`) |
| `skeleton-radius-full` | `9999px` (`rounded-full`) — avatars |
| `skeleton-shimmer-duration` | `1.5s` |
| `skeleton-shimmer-easing` | `ease-in-out` |

### 11.1 Tailwind Utility Class

```css
/* globals.css */
@layer utilities {
  .skeleton {
    @apply bg-muted animate-shimmer;
    background-image: linear-gradient(
      90deg,
      hsl(var(--muted)) 25%,
      hsl(var(--muted-foreground) / 0.06) 50%,
      hsl(var(--muted)) 75%
    );
    background-size: 200% 100%;
  }
}
```

```js
// tailwind.config.ts (extend)
{
  keyframes: {
    shimmer: {
      "0%": { backgroundPosition: "-200% 0" },
      "100%": { backgroundPosition: "200% 0" },
    },
  },
  animation: {
    shimmer: "shimmer 1.5s ease-in-out infinite",
  },
}
```

---

## 12. Reduced Motion

When `prefers-reduced-motion: reduce` is active:

| Normal Behavior | Reduced Motion Behavior |
|---|---|
| Skeleton shimmer animation | Static muted background (no shimmer) |
| Content fade-in (200 ms) | Instant reveal (`opacity: 1` immediately) |
| Staggered list entrance | All items appear simultaneously |
| Progressive reveal (scroll) | All content visible immediately |
| Image fade-in | Instant image display |
| Button spinner rotation | Spinner still rotates (functional indicator, not decorative) |

### 12.1 Implementation

```tsx
// Wrap stagger container
const shouldReduce = useReducedMotion();

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: shouldReduce ? 0 : 0.05,
    },
  },
};

const itemVariants = shouldReduce
  ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
  : fadeInUp;
```

### 12.2 CSS Fallback

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background-image: none;
  }
}
```

---

## Cross-References

- Motion tokens: [../02-tokens/motion.md](../02-tokens/motion.md)
- Color tokens: [../02-tokens/colors.md](../02-tokens/colors.md)
- Page transitions: [./page-transitions.md](./page-transitions.md)
- Micro-interactions: [./micro-interactions.md](./micro-interactions.md)
- Feedback animations: [./feedback-animations.md](./feedback-animations.md)
- Data table component: [../03-components/data-display/data-table.md](../03-components/data-display/data-table.md)
- Card component: [../03-components/data-display/card.md](../03-components/data-display/card.md)
