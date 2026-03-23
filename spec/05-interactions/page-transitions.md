# Page Transitions

> Version: 1.0 | Last updated: 2026-03-20

Defines the page transition strategy for the VRC community website. The primary decision is to **not** implement custom page transitions and instead rely on Next.js App Router streaming, skeleton UI, and shared layout persistence.

---

## Table of Contents

1. [Decision Summary](#1-decision-summary)
2. [Rationale](#2-rationale)
3. [Route-Level Loading States](#3-route-level-loading-states)
4. [Skeleton UI](#4-skeleton-ui)
5. [Shared Layout Persistence](#5-shared-layout-persistence)
6. [Back Navigation](#6-back-navigation)
7. [Scroll Restoration](#7-scroll-restoration)
8. [View Transitions API — Future](#8-view-transitions-api--future)

---

## 1. Decision Summary

| Aspect | Decision |
|---|---|
| Custom page-to-page transitions | **Not implemented** |
| Route change indication | `loading.tsx` with leaf spinner |
| Content placeholder | Skeleton UI matching target layout |
| Layout re-render | Header, footer, and sidebars persist across navigations |
| Animation library for transitions | None — content fades in via loading choreography only |

> **ADR**: See [../design/adr/](../design/adr/) for the formal Architecture Decision Record.

---

## 2. Rationale

### 2.1 Why No Custom Page Transitions

| Concern | Detail |
|---|---|
| **Streaming SSR conflict** | Next.js App Router streams HTML in chunks via React Suspense. Wrapping route content in `<AnimatePresence>` requires buffering the full response before animating out — defeating the purpose of streaming. |
| **Layout complexity** | The app has nested layouts (`(public)`, `(admin)`, `(auth)`). Exit animations across layout boundaries are fragile and add significant complexity. |
| **Performance** | Custom transitions add 200-400 ms of perceived delay (exit animation + enter animation). Skeleton-first loading feels faster. |
| **Bundle size** | Framer Motion's `AnimatePresence` + `layoutId` for page transitions adds ~8 KB to the critical path. |
| **Maintainability** | Every new route would need to be tested for transition correctness. Layout breaks accumulate over time. |

### 2.2 What We Use Instead

1. **Instant navigation** via Next.js `<Link>` with `prefetch`
2. **`loading.tsx`** at each route segment for immediate feedback
3. **Skeleton → content fade-in** via loading choreography ([./loading-choreography.md](./loading-choreography.md))
4. **Shared layout persistence** — header/footer stay mounted

---

## 3. Route-Level Loading States

Every route segment that fetches data must include a `loading.tsx` file.

### 3.1 Loading Component Hierarchy

```
app/
├── (public)/
│   ├── loading.tsx          ← Full-page leaf spinner
│   ├── events/
│   │   ├── loading.tsx      ← Event list skeleton
│   │   └── [id]/
│   │       └── loading.tsx  ← Event detail skeleton
│   ├── members/
│   │   └── loading.tsx      ← Member grid skeleton
│   └── clubs/
│       └── loading.tsx      ← Club gallery skeleton
├── (admin)/
│   ├── loading.tsx          ← Admin content area skeleton (sidebar stays)
│   └── users/
│       └── loading.tsx      ← User table skeleton
└── (auth)/
    └── loading.tsx          ← Centered spinner
```

### 3.2 Leaf Spinner

The default loading indicator is a leaf spinner using the `spinLeaf` keyframe defined in [../02-tokens/motion.md](../02-tokens/motion.md).

```tsx
// components/ui/leaf-spinner.tsx

export function LeafSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <div className="flex items-center justify-center p-8">
      <svg
        className={`${sizeMap[size]} animate-spin-leaf text-primary`}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Loading"
        role="status"
      >
        {/* Leaf SVG path */}
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5-3 2-7 1-10C12 8.5 10.5 5 12 2z"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
```

### 3.3 Tailwind Keyframe

```js
// tailwind.config.ts (extend)
{
  keyframes: {
    "spin-leaf": {
      "0%": { transform: "rotate(0deg) scale(1)" },
      "50%": { transform: "rotate(180deg) scale(0.9)" },
      "100%": { transform: "rotate(360deg) scale(1)" },
    },
  },
  animation: {
    "spin-leaf": "spin-leaf 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
  },
}
```

---

## 4. Skeleton UI

### 4.1 Design Tokens

| Token | Value |
|---|---|
| Base color | `hsl(var(--muted))` |
| Shimmer highlight | `hsl(var(--muted-foreground) / 0.06)` |
| Border radius | Matches target component (e.g., `rounded-2xl` for cards) |
| Animation | Shimmer sweep, 1.5 s, infinite |
| Shimmer direction | Left to right (`-100%` → `100%`) |

### 4.2 Skeleton Shimmer Animation

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.06) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### 4.3 Page-Specific Skeletons

Each `loading.tsx` renders a skeleton that matches the shape of its target content:

| Route | Skeleton Shape |
|---|---|
| `/events` | 2×3 card grid with image placeholders, title bars, date pills |
| `/events/[id]` | Hero image block + text lines + sidebar block |
| `/members` | 4×N avatar circle grid with name bars |
| `/clubs` | 3-column card layout with thumbnail + text |
| `/admin/users` | Table header + 8 skeleton rows |
| `/profile` | Left avatar block + right form field blocks |

See [./loading-choreography.md](./loading-choreography.md) for skeleton → content transition details.

---

## 5. Shared Layout Persistence

### 5.1 Public Layout

```
(public)/layout.tsx
├── <Header />          ← Persists across all public routes
├── <main>{children}</main>  ← Route content swaps here
└── <Footer />          ← Persists across all public routes
```

- Header and Footer are rendered once in the layout and are **never unmounted** during client-side navigations.
- Active nav link indicator transitions smoothly using CSS `transition: left 200ms ease-out, width 200ms ease-out` on a pseudo-element.

### 5.2 Admin Layout

```
(admin)/layout.tsx
├── <AdminSidebar />    ← Persists across all admin routes
└── <div className="flex-1">
      <AdminHeader />   ← Persists
      {children}        ← Route content swaps here
    </div>
```

- The sidebar remains expanded/collapsed across navigations via state stored in a cookie or `localStorage`.
- Active sidebar item highlights instantly on `<Link>` click (optimistic UI via `usePathname()`).

### 5.3 Auth Layout

```
(auth)/layout.tsx
└── <div className="grid min-h-dvh place-items-center">
      {children}
    </div>
```

Minimal layout — no header/footer. Background gradient persists.

---

## 6. Back Navigation

### 6.1 Behavior

| Scenario | Behavior |
|---|---|
| Browser back button | Standard Next.js client-side back navigation. Content restores from router cache if available. |
| In-app back link | Uses `router.back()` or explicit `<Link>` to parent route. |
| Router cache hit | Content renders instantly (no loading state). |
| Router cache miss | `loading.tsx` displays, data re-fetches. |

### 6.2 Router Cache

Next.js App Router caches RSC payloads in-memory for 30 seconds (dynamic routes) and 5 minutes (static routes). We rely on these defaults and do not customize `staleTimes`.

---

## 7. Scroll Restoration

### 7.1 Strategy

| Navigation Type | Scroll Behavior |
|---|---|
| Forward navigation (`<Link>` click) | Scroll to top (`scroll={true}` — default) |
| Back navigation (browser back) | Restore previous scroll position (browser-native) |
| Hash link (`#section`) | Smooth scroll to anchor |
| Tab switch within page | No scroll change |

### 7.2 Implementation

```tsx
// app/(public)/layout.tsx
// Next.js handles scroll restoration by default.
// For hash links, add smooth scroll behavior:

// globals.css
html {
  scroll-behavior: smooth;
}

// For programmatic scroll:
// Use window.scrollTo({ top: 0, behavior: "instant" }) on forward navigations
// to avoid conflict with smooth-scroll CSS.
```

### 7.3 Infinite Scroll Lists

For paginated lists (events, members), scroll position is preserved on back navigation because:

1. Router cache retains the RSC payload including loaded items.
2. Browser restores scroll position from the cached page height.
3. If cache expires, the page re-renders from the first page — acceptable trade-off.

---

## 8. View Transitions API — Future

### 8.1 Status

The [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) is available in Chrome/Edge 111+ and Safari 18+. Firefox support is in progress.

### 8.2 Future Plan

| Phase | Action |
|---|---|
| **Now** | No implementation. Monitor browser support and Next.js integration. |
| **When stable in Next.js** | Add `viewTransition` prop to `<Link>` for cross-page hero image transitions (event cards → event detail). |
| **Target transitions** | Event card image → event detail hero; Member avatar → profile header; Club card → club detail. |

### 8.3 Preparation

- Assign consistent `id` attributes to hero images and key elements that will participate in future view transitions.
- Use `view-transition-name` CSS property on these elements proactively (no cost, no effect without API usage).

```css
/* Future-ready: no visual effect until View Transitions API is adopted */
.event-hero-image {
  view-transition-name: event-hero;
}
.member-avatar-main {
  view-transition-name: member-avatar;
}
```

---

## Cross-References

- Motion tokens: [../02-tokens/motion.md](../02-tokens/motion.md)
- Loading choreography: [./loading-choreography.md](./loading-choreography.md)
- Micro-interactions: [./micro-interactions.md](./micro-interactions.md)
- Feedback animations: [./feedback-animations.md](./feedback-animations.md)
- Project structure: [../../docs/en/development/project-structure.md](../../docs/en/development/project-structure.md)
- Routing spec: [../ui/routing.md](../ui/routing.md)
