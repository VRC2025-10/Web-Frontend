# Loading States

> Unified loading patterns across the application

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Provide consistent visual feedback during data fetching, page transitions, and async operations |
| **Components Covered** | Page Loading Spinner, Skeleton UI, Button Loading, Image Loading |
| **When to Use** | Any async operation where the user must wait for content |
| **When NOT to Use** | Instant/synchronous UI updates, optimistic updates (show result immediately) |

### Loading Pattern Decision Tree

| Scenario | Pattern |
|---|---|
| Next.js route transition (`loading.tsx`) | Page Loading Spinner (Leaf) |
| Content placeholder while SSR/RSC loads | Skeleton UI |
| Button awaiting server response | Button Loading (Loader2) |
| Image loading in cards/galleries | Image Loading (fade-in) |
| Inline data fetch (e.g., search) | Loader2 spinner in context |

---

## 2. Props / API

### 1. Page Loading Spinner

No external props — used as `loading.tsx` file convention.

### 2. Skeleton UI

Uses shadcn/ui `<Skeleton>` component.

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `className` | `string` | — | No | Tailwind classes for sizing and shape |

### 3. Button Loading

Inline pattern within `<Button>` — no separate component.

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `isSubmitting` | `boolean` | `false` | Yes | Controls loading spinner display |

### 4. Image Loading

Inline pattern with `next/image` — no separate component.

---

## 3. Visual Structure

### 1. Page Loading Spinner (`loading.tsx`)

```
<div className="flex items-center justify-center min-h-[50vh]">
│
└─ <motion.div
     animate={{ rotate: 360 }}
     transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
   >
     <Leaf className="w-10 h-10 text-primary" aria-hidden="true" />
   </motion.div>
│
└─ <span className="sr-only">Loading...</span>
</div>
```

### 2. Skeleton Patterns

#### EventCard Skeleton

```
<div className="rounded-2xl overflow-hidden border bg-card">
│
├─ <Skeleton className="aspect-video w-full" />          ← image area
│
└─ <div className="p-5 space-y-3">
   ├─ <Skeleton className="h-5 w-3/4" />                 ← title
   ├─ <Skeleton className="h-4 w-1/2" />                 ← date
   └─ <Skeleton className="h-4 w-2/3" />                 ← description
</div>
```

#### MemberCard Skeleton

```
<div className="rounded-2xl border bg-card p-6 text-center">
│
├─ <Skeleton className="w-24 h-24 rounded-full mx-auto" />  ← avatar
│
└─ <div className="mt-4 space-y-2">
   ├─ <Skeleton className="h-5 w-32 mx-auto" />             ← name
   └─ <Skeleton className="h-4 w-20 mx-auto" />             ← role
</div>
```

#### ProfileDetail Skeleton

```
<div className="grid md:grid-cols-[300px_1fr] gap-8">
│
├─ <div className="space-y-4">
│  ├─ <Skeleton className="w-48 h-48 rounded-full mx-auto" />  ← avatar
│  ├─ <Skeleton className="h-6 w-40 mx-auto" />                ← name
│  └─ <Skeleton className="h-4 w-24 mx-auto" />                ← bio
│
└─ <div className="space-y-4">
   ├─ <Skeleton className="h-8 w-48" />                         ← heading
   ├─ <Skeleton className="h-4 w-full" />                       ← text line
   ├─ <Skeleton className="h-4 w-full" />                       ← text line
   └─ <Skeleton className="h-4 w-3/4" />                        ← text line
</div>
```

#### DataTable Skeleton

```
<div className="rounded-xl border">
│
├─ <div className="flex items-center h-12 px-4 border-b">      ← header
│  ├─ <Skeleton className="h-4 w-24" />
│  ├─ <Skeleton className="h-4 w-32" />
│  └─ <Skeleton className="h-4 w-20" />
│
└─ {Array.from({ length: 5 }).map(() => (
     <div className="flex items-center h-14 px-4 border-b">    ← rows
       ├─ <Skeleton className="h-4 w-28" />
       ├─ <Skeleton className="h-4 w-36" />
       └─ <Skeleton className="h-4 w-16" />
     </div>
   ))}
</div>
```

#### StatCard Skeleton

```
<div className="rounded-2xl border bg-card p-6">
│
├─ <Skeleton className="w-10 h-10 rounded-lg" />       ← icon
│
└─ <div className="mt-3 space-y-2">
   ├─ <Skeleton className="h-8 w-16" />                ← number
   └─ <Skeleton className="h-4 w-24" />                ← label
</div>
```

### 3. Button Loading

```
<Button disabled={isSubmitting} className="rounded-full px-8 py-3">
│
├─ {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />}
├─ {isSubmitting ? "Saving..." : "Save"}
└─ {isSubmitting && <span className="sr-only">Submitting form</span>}
</Button>
```

### 4. Image Loading

```
<div className="relative bg-muted rounded-2xl overflow-hidden">
│
└─ <Image
     src={url}
     alt={alt}
     fill
     className="object-cover transition-opacity duration-300"
     style={{ opacity: isLoaded ? 1 : 0 }}
     onLoad={() => setIsLoaded(true)}
   />
</div>
```

---

## 4. Variant × State Matrix

### Page Loading Spinner

| State | Visual |
|---|---|
| Loading | Leaf icon rotating continuously |
| Loaded | Component unmounted (replaced by page content) |

### Skeleton

| State | Visual |
|---|---|
| Loading | `bg-muted` shapes with `animate-pulse` shimmer |
| Loaded | Skeleton replaced by actual content |

### Button Loading

| State | Icon | Label | Enabled |
|---|---|---|---|
| Idle | None | "Save" | Yes |
| Loading | Loader2 spin | "Saving..." | No (disabled) |

### Image Loading

| State | Visual |
|---|---|
| Loading | `bg-muted` placeholder visible |
| Loaded | Image fades in (opacity 0 → 1, 300ms) |
| Error | `bg-muted` remains (or fallback image) |

---

## 5. Responsive Behavior

| Pattern | Mobile | Tablet/Desktop |
|---|---|---|
| Page spinner | Same (centered, `min-h-[50vh]`) | Same |
| Skeleton grids | Fewer columns (matches parent grid) | Full column count |
| Button loading | Full-width button on mobile | Auto-width |
| Image loading | Same behavior | Same behavior |

Skeleton patterns inherit the responsive grid of their parent components (e.g., EventCard grid shows fewer columns on mobile).

---

## 6. Accessibility

### ARIA

- Page spinner: `aria-hidden="true"` on Leaf icon + `sr-only "Loading..."` text
- Skeletons: No ARIA needed (visual placeholder, content replaces it)
- Button loading: `aria-disabled="true"` + sr-only "Submitting form"
- Image loading: `alt` text always present on `<Image>` regardless of load state

### Keyboard

- Disabled button: not focusable via Tab during loading
- No keyboard interaction changes for skeletons or spinners

### Screen Reader

- Page loading: sr-only "Loading..." text available
- Button loading: button label changes to "Saving..." — announced if focused
- Content load complete: new content enters DOM naturally, no special announcement needed

### Focus Management

- No focus changes during loading states
- After content loads: focus stays where user left it

---

## 7. Animation

### Page Loading Spinner (Leaf)

```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    repeat: Infinity,
    duration: 1.5,
    ease: "linear",
  }}
>
  <Leaf className="w-10 h-10 text-primary" />
</motion.div>
```

### Skeleton Shimmer

```css
/* Tailwind's animate-pulse — CSS animation, not Framer Motion */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Image Fade-In

```css
/* CSS transition — not Framer Motion */
.transition-opacity {
  transition: opacity 300ms ease;
}
```

### Content Replace (Skeleton → Real Content)

```tsx
<AnimatePresence mode="wait">
  {isLoading ? (
    <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <SkeletonComponent />
    </motion.div>
  ) : (
    <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <RealContent />
    </motion.div>
  )}
</AnimatePresence>
```

### Reduced Motion

- Page spinner: reduced to subtle opacity pulse instead of rotation
- Skeleton: `animate-pulse` still runs (subtle, not motion-intensive)
- Image fade: instant opacity (no transition)

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Leaf spinner | `text-primary` (coral) | `text-primary` (lighter coral) |
| Skeleton bg | `bg-muted` (light warm grey) | `bg-muted` (dark grey) |
| Skeleton shimmer | Pulse between `bg-muted` opacity levels | Same animation, darker tones |
| Image placeholder | `bg-muted` | `bg-muted` (dark) |
| Button spinner | foreground color | foreground color (light) |

No structural changes — skeletons and spinners use semantic tokens.
