# Responsive Design Pattern

> Version: 1.0 | Last updated: 2026-03-20

This document defines the responsive design strategy, breakpoint system, component adaptation rules, and per-page layout specifications for the VRC community website.

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Breakpoints](#breakpoints)
- [Container & Max Widths](#container--max-widths)
- [Grid System](#grid-system)
- [Component Adaptation Rules](#component-adaptation-rules)
- [Per-Page Layout Specifications](#per-page-layout-specifications)
- [Touch Adaptations](#touch-adaptations)
- [Typography Scaling](#typography-scaling)
- [Image Handling](#image-handling)
- [Testing Matrix](#testing-matrix)

---

## Design Philosophy

**PC-first, mobile-compliant.**

The primary audience is VRChat gamers who predominantly use desktop/laptop computers. The design is optimized for large screens. However, mobile devices MUST NOT break — all pages must be fully functional and readable on mobile.

| Principle | Rationale |
|---|---|
| Design for desktop first | VRChat users are primarily on PC |
| Mobile must work, not just fit | Users check events/members on phone |
| No mobile-only features | Feature parity across breakpoints |
| Progressive reduction | Remove visual complexity on smaller screens, never remove functionality |
| Touch-ready on all sizes | Some PC users have touchscreens |

---

## Breakpoints

Using Tailwind CSS v4 default breakpoints:

| Token | Min Width | Target Devices | Usage |
|---|---|---|---|
| (default) | 0px | Small phones | Base mobile styles |
| `sm` | **640px** | Large phones, small tablets | Minor layout adjustments |
| `md` | **768px** | Tablets (portrait) | 2-column layouts begin |
| `lg` | **1024px** | Tablets (landscape), small laptops | Desktop navigation, sidebar |
| `xl` | **1280px** | Desktops, laptops | Full desktop layout |
| `2xl` | **1536px** | Large monitors | Max widths, more columns |

### Breakpoint Usage Guidelines

```css
/* Mobile-first approach in Tailwind (but designing desktop-first mentally) */
/* Write base styles for mobile, then add breakpoint overrides */

/* Example: Card grid */
.card-grid {
  @apply grid grid-cols-1 gap-4
         sm:grid-cols-2
         lg:grid-cols-3
         xl:grid-cols-4;
}
```

---

## Container & Max Widths

| Context | Max Width | Class | Notes |
|---|---|---|---|
| Public pages | **1280px** | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Standard content container |
| Admin main content | **Full width** minus sidebar | `flex-1 p-6` | Sidebar takes 256px on desktop |
| Forms | **672px** | `max-w-2xl` | Single-column form layout |
| Text content (articles) | **768px** | `max-w-3xl` | Optimal reading line length |
| Full-bleed sections | **100%** | `w-full` | Hero sections, banners |

### Container Component

```tsx
// Standard page container
function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
```

### Horizontal Padding

| Breakpoint | Padding | Value |
|---|---|---|
| Mobile (default) | `px-4` | 16px per side |
| Small (`sm`) | `sm:px-6` | 24px per side |
| Desktop (`lg`) | `lg:px-8` | 32px per side |

---

## Grid System

### Standard Card Grids

| Content Type | Mobile | sm (640px) | md (768px) | lg (1024px) | xl (1280px) | 2xl (1536px) |
|---|---|---|---|---|---|---|
| Event cards | 1 col | 1 col | 2 cols | 3 cols | 3 cols | 4 cols |
| Member cards | 1 col | 2 cols | 2 cols | 3 cols | 4 cols | 5 cols |
| Club cards | 1 col | 2 cols | 2 cols | 3 cols | 3 cols | 4 cols |
| Gallery images | 2 cols | 2 cols | 3 cols | 4 cols | 4 cols | 5 cols |
| Admin stat cards | 1 col | 2 cols | 2 cols | 4 cols | 4 cols | 4 cols |

### Grid Gap

| Grid Type | Gap | Value |
|---|---|---|
| Card grids | `gap-4 lg:gap-6` | 16px → 24px |
| Gallery grids | `gap-2 lg:gap-3` | 8px → 12px |
| Stat card grids | `gap-4` | 16px |
| Form field grids | `gap-6` | 24px (always) |

### Implementation

```tsx
// Event card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
  {events.map((event) => (
    <EventCard key={event.id} event={event} />
  ))}
</div>

// Member card grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
  {members.map((member) => (
    <MemberCard key={member.id} member={member} />
  ))}
</div>

// Gallery image grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 lg:gap-3">
  {images.map((image) => (
    <GalleryImage key={image.id} image={image} />
  ))}
</div>
```

---

## Component Adaptation Rules

### Cards

| Breakpoint | Behavior |
|---|---|
| Mobile | Full-width, stacked vertically |
| Tablet | 2–3 column grid |
| Desktop | 3–5 column grid depending on content density |

Card internal layout remains the same across breakpoints — only the grid changes.

### Tables (DataTable)

| Breakpoint | Behavior |
|---|---|
| Mobile (< md) | Horizontal scroll wrapper with `overflow-x-auto`, min-width on table |
| Desktop (≥ md) | Full table layout, no scroll |

```tsx
// Responsive table wrapper
<div className="overflow-x-auto rounded-xl border" role="region" aria-label="Data table" tabIndex={0}>
  <table className="w-full min-w-[640px]">
    {/* Table content */}
  </table>
</div>
```

Optional: On mobile, hide less-important columns:

```tsx
<th className="hidden md:table-cell">Created At</th>
<td className="hidden md:table-cell">{item.createdAt}</td>
```

### Navigation

| Breakpoint | Behavior |
|---|---|
| Mobile (< lg) | Hamburger icon → Sheet overlay |
| Desktop (≥ lg) | Horizontal link bar in header |

See [Navigation Pattern](./navigation.md) for full details.

### Admin Sidebar

| Breakpoint | Behavior |
|---|---|
| Mobile (< lg) | Hidden, accessible via Sheet (slide from left) |
| Desktop (≥ lg) | Fixed 256px sidebar |

```tsx
<div className="flex min-h-screen">
  {/* Desktop sidebar */}
  <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
    {/* Sidebar content */}
  </aside>
  {/* Main content area */}
  <main className="flex-1 p-4 lg:p-6">
    {children}
  </main>
</div>
```

### Forms

| Breakpoint | Behavior |
|---|---|
| All breakpoints | Single column, `max-w-2xl` |

Forms do not change layout across breakpoints. They remain single-column for readability and usability.

### Modals & Dialogs

| Breakpoint | Behavior |
|---|---|
| Mobile | Full-width (or nearly), bottom-anchored if Sheet |
| Desktop | Centered, `max-w-lg` or `max-w-2xl` depending on content |

```tsx
<DialogContent className="sm:max-w-lg">
  {/* Dialog content */}
</DialogContent>
```

### Filter Controls

| Breakpoint | Behavior |
|---|---|
| Mobile | Stacked vertically, full-width selects |
| Desktop | Horizontal row, inline selects |

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
  <Select>{/* Status filter */}</Select>
  <Select>{/* Sort */}</Select>
  <Input placeholder="Search..." className="sm:max-w-xs" />
</div>
```

### Pagination

| Breakpoint | Behavior |
|---|---|
| Mobile | Simplified → Previous / Next buttons only |
| Desktop | Full → page numbers with ellipsis |

```tsx
<div className="flex items-center justify-center gap-2">
  <Button variant="outline" size="sm" disabled={page === 1}>Previous</Button>
  {/* Mobile: only prev/next */}
  <div className="hidden sm:flex gap-1">
    {/* Desktop: page numbers */}
    {pageNumbers.map((p) => (
      <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm">
        {p}
      </Button>
    ))}
  </div>
  <span className="sm:hidden text-sm text-muted-foreground">
    Page {page} of {totalPages}
  </span>
  <Button variant="outline" size="sm" disabled={page === totalPages}>Next</Button>
</div>
```

---

## Per-Page Layout Specifications

### Home Page (`/`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Hero | Full-width, stacked | Full-width, stacked | Full-width, stacked | Full-width, max-w-7xl | Full-width, max-w-7xl |
| Events section | 1-col cards | 1-col cards | 2-col cards | 3-col cards | 3-col cards |
| Members section | 1-col cards | 2-col cards | 2-col cards | 3-col cards | 4-col cards |
| Section headings | text-xl | text-xl | text-2xl | text-2xl | text-2xl |

### Events List (`/events`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Page heading | text-xl | text-xl | text-2xl | text-2xl | text-2xl |
| Filters | Stacked | Stacked | Row | Row | Row |
| Event cards | 1-col | 1-col | 2-col | 3-col | 3-col |
| Pagination | Prev/Next | Prev/Next | Full | Full | Full |

### Event Detail (`/events/[id]`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Back button | Yes | Yes | Yes | Yes | Yes |
| Title | text-xl | text-xl | text-2xl | text-3xl | text-3xl |
| Event meta | Stacked | Stacked | Row | Row | Row |
| Content | Full-width | Full-width | max-w-3xl | max-w-3xl | max-w-3xl |
| Gallery | 2-col grid | 2-col grid | 3-col grid | 4-col grid | 4-col grid |

### Members List (`/members`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Search + filters | Stacked | Stacked | Row | Row | Row |
| Member cards | 1-col | 2-col | 2-col | 3-col | 4-col |
| Pagination | Prev/Next | Prev/Next | Full | Full | Full |

### Clubs List (`/clubs`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Club cards | 1-col | 2-col | 2-col | 3-col | 3-col |
| Pagination | Prev/Next | Prev/Next | Full | Full | Full |

### Profile Editor (`/profile`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Form | Full-width | Full-width | max-w-2xl | max-w-2xl | max-w-2xl |
| Avatar upload | Centered above form | Centered above form | Left of form | Left of form | Left of form |
| Tab navigation | Scrollable horizontal | Scrollable horizontal | Fixed tabs | Fixed tabs | Fixed tabs |

### Admin Dashboard (`/admin`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Sidebar | Hidden (Sheet) | Hidden (Sheet) | Hidden (Sheet) | 256px fixed | 256px fixed |
| Stat cards | 1-col | 2-col | 2-col | 4-col | 4-col |
| Recent activity | Full-width table (scroll) | Full-width table (scroll) | Full table | Full table | Full table |

### Admin List Pages (`/admin/events`, `/admin/members`, etc.)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Sidebar | Hidden (Sheet) | Hidden (Sheet) | Hidden (Sheet) | 256px fixed | 256px fixed |
| Toolbar | Stacked | Stacked | Row | Row | Row |
| Data table | Scroll wrapper | Scroll wrapper | Full table | Full table | Full table |
| Pagination | Prev/Next | Prev/Next | Full | Full | Full |

### Login Page (`/login`)

| Section | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| Form card | Full-width px-4 | max-w-sm centered | max-w-sm centered | max-w-sm centered | max-w-sm centered |

---

## Touch Adaptations

| Adaptation | Implementation |
|---|---|
| **Minimum tap target** | 44×44px (see [Accessibility](./accessibility.md#touch-targets)) |
| **Touch-friendly spacing** | Cards and list items have ≥ 8px gap |
| **Swipe for carousel** | Not implemented — no carousel component in v1.0 |
| **No hover-dependent UI** | All hover effects have focus/active equivalents |
| **Tap highlight** | `-webkit-tap-highlight-color: transparent` for custom buttons |
| **Pull to refresh** | Not implemented — use manual refresh button |

### No Hover-Dependent UI

Every interaction that uses `:hover` must also work with `:focus-visible` or on tap:

```tsx
// Card example — hover lift effect also accessible via focus
<article
  className={cn(
    'rounded-xl border bg-card shadow-sm transition-all',
    'hover:shadow-md hover:-translate-y-0.5',
    'focus-within:shadow-md focus-within:-translate-y-0.5',
  )}
>
  {/* Card content */}
</article>
```

---

## Typography Scaling

Use `clamp()` for fluid typography that scales smoothly between breakpoints:

| Element | Mobile | Desktop | Clamp |
|---|---|---|---|
| Page title (h1) | 24px | 36px | `clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)` |
| Section title (h2) | 20px | 30px | `clamp(1.25rem, 1rem + 1.25vw, 1.875rem)` |
| Card title (h3) | 18px | 20px | `clamp(1.125rem, 1rem + 0.5vw, 1.25rem)` |
| Body text | 16px | 16px | `1rem` (no scaling) |
| Small text | 14px | 14px | `0.875rem` (no scaling) |
| Caption | 12px | 12px | `0.75rem` (no scaling) |

```css
/* In global CSS or Tailwind theme extension */
.text-page-title {
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  line-height: 1.2;
  font-weight: 700;
}

.text-section-title {
  font-size: clamp(1.25rem, 1rem + 1.25vw, 1.875rem);
  line-height: 1.3;
  font-weight: 600;
}
```

### Alternatively Using Tailwind Breakpoints

```tsx
// If clamp() is not desired, use explicit breakpoint classes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Page Title</h1>
<h2 className="text-xl md:text-2xl font-semibold">Section Title</h2>
```

---

## Image Handling

### Responsive Images

All images use Next.js `<Image>` with responsive sizing:

```tsx
// Full-width hero/banner image
<Image
  src={heroImage}
  alt="Event banner"
  width={1280}
  height={480}
  sizes="100vw"
  className="w-full h-auto rounded-xl object-cover"
  priority
/>

// Card thumbnail
<Image
  src={thumbnail}
  alt={`Thumbnail for ${event.title}`}
  width={400}
  height={225}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto rounded-t-xl object-cover aspect-video"
/>

// Gallery image
<Image
  src={image.url}
  alt={image.description || 'Gallery image'}
  width={300}
  height={300}
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  className="w-full h-auto rounded-xl object-cover aspect-square"
/>
```

### Aspect Ratios

| Image Type | Aspect Ratio | Class |
|---|---|---|
| Event thumbnail | 16:9 | `aspect-video` |
| Member avatar | 1:1 | `aspect-square rounded-full` |
| Gallery image | 1:1 | `aspect-square` |
| Club logo | 1:1 | `aspect-square rounded-xl` |
| Hero/banner | 8:3 (custom) | `aspect-[8/3]` |

### srcSet Strategy

Next.js `<Image>` automatically generates `srcSet` with appropriate widths. Configure `deviceSizes` and `imageSizes` in `next.config.ts`:

```tsx
// next.config.ts
const nextConfig = {
  images: {
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
};
```

---

## Testing Matrix

### Required Test Viewports

| Width | Device Representation | Priority |
|---|---|---|
| **320px** | iPhone SE / smallest phones | Critical |
| **375px** | iPhone 12/13/14 standard | Critical |
| **768px** | iPad portrait | High |
| **1024px** | iPad landscape / small laptop | High |
| **1280px** | Standard desktop | Critical |
| **1536px** | Large desktop / 2xl breakpoint | Medium |

### Testing Checklist

| Check | 320px | 375px | 768px | 1024px | 1280px | 1536px |
|---|---|---|---|---|---|---|
| No horizontal overflow | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Text readable (no truncation) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Navigation functional | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Images responsive | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Touch targets ≥ 44px | ✅ | ✅ | ✅ | ✅ | — | — |
| Cards layout correct | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tables scrollable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Forms usable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modals/Sheets correct | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| No content clipping | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Playwright Viewport Tests

```tsx
// e2e/responsive.spec.ts
const viewports = [
  { name: 'mobile-s', width: 320, height: 568 },
  { name: 'mobile-m', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'desktop-lg', width: 1536, height: 900 },
];

for (const viewport of viewports) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    test('home page has no horizontal scroll', async ({ page }) => {
      await page.goto('/');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test('navigation is accessible', async ({ page }) => {
      await page.goto('/');
      if (viewport.width < 1024) {
        // Mobile: hamburger menu
        await expect(page.getByLabel('Open menu')).toBeVisible();
      } else {
        // Desktop: nav links
        await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
      }
    });
  });
}
```

---

## Cross-References

- [Accessibility Pattern](./accessibility.md) — touch targets, focus management
- [Navigation Pattern](./navigation.md) — responsive navigation behavior
- [Breakpoint Tokens](../02-tokens/breakpoints.md) — breakpoint definitions
- [Typography Tokens](../02-tokens/typography.md) — font size scale
- [Page Specifications](../04-pages/) — per-page design details
- [Layout Components](../03-components/layout/) — Header, Sidebar, Footer specs
