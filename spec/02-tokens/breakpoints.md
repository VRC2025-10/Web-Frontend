# Responsive Breakpoint System

Breakpoint scale, layout behavior per breakpoint, component-level responsive rules, and testing requirements for the Autumn Soft theme.

---

## Design Approach

> **PC-first design, mobile-first CSS.**

The primary design target is **desktop at 1280px (xl)** since the VRC community consists of PC gamers. All wireframes and visual designs are created at this resolution first. However, CSS is written **mobile-first** using `min-width` media queries for progressive enhancement, following Tailwind CSS conventions.

This means:
- **Design** starts at xl (1280px) and adapts down.
- **Code** starts at base (mobile) and enhances up with `sm:`, `md:`, `lg:`, `xl:`, `2xl:` prefixes.
- The "default" Tailwind class always targets mobile. Every responsive prefix adds to or overrides it.

---

## Breakpoint Scale

| Token | Min Width | Tailwind Prefix | Target Devices | % of Expected Traffic |
|---|---|---|---|---|
| base | 0–639px | *(default)* | Smartphones (portrait) — iPhone SE to iPhone Pro Max | ~15% |
| sm | 640px+ | `sm:` | Smartphones (landscape), small tablets | ~5% |
| md | 768px+ | `md:` | Tablets (portrait) — iPad Mini, iPad | ~5% |
| lg | 1024px+ | `lg:` | Tablets (landscape), small laptops, iPad Pro | ~10% |
| xl | 1280px+ | `xl:` | Standard desktop monitors (**primary target**) | ~50% |
| 2xl | 1536px+ | `2xl:` | Large monitors, ultrawide, 1440p+ | ~15% |

### No Custom Breakpoints

The standard Tailwind breakpoints are sufficient. No custom breakpoints are added. This keeps the responsive system simple and ensures all team members use the same vocabulary.

---

## Layout Behavior Per Breakpoint

### Overview Matrix

| Breakpoint | Grid Columns | Navigation | Cards/Row (Events) | Container | Sidebar | Key Layout Changes |
|---|---|---|---|---|---|---|
| **base** (0–639px) | 1 | Hamburger → Sheet | 1 | Full width, `px-4` | Hidden (Sheet) | Stacked layout. All content single column. |
| **sm** (640–767px) | 1–2 | Hamburger → Sheet | 2 | Full width, `px-6` | Hidden (Sheet) | Cards begin pairing into 2-column grid. |
| **md** (768–1023px) | 2 | Hamburger → Sheet | 2–3 | Full width, `px-6` | Hidden (Sheet) | More cards per row. Comfortable tablet layout. |
| **lg** (1024–1279px) | 2–3 | Desktop nav bar | 3 | `max-w-7xl`, `px-8` | Persistent (w-64) | **Major layout shift.** Desktop nav appears. Sidebar layouts begin. Two-column detail pages. |
| **xl** (1280–1535px) | 3+ | Desktop nav bar | 3–4 | `max-w-7xl`, `px-8` | Persistent (w-64) | **Primary design target.** Full 2-column layouts. Optimal content density. |
| **2xl** (1536px+) | 3–5 | Desktop nav bar | 4–5 | `max-w-7xl`, `px-8` | Persistent (w-64) | More cards per row. Content remains centered, no extra stretch beyond max-w-7xl. |

### The lg Breakpoint Is Key

The transition from `md` to `lg` (1024px) is the most significant layout change:
- Hamburger menu → full desktop navigation bar
- Single-column → two-column detail layouts
- Mobile Sheet sidebar → persistent admin sidebar
- Cards rearrange from 2 to 3 per row

---

## Component-Level Responsive Rules

### Header / Navigation

| Breakpoint | Behavior |
|---|---|
| base – md | Sticky. Height: 56px. Hamburger icon (left or right). Logo centered. Sheet overlay for nav items. |
| lg+ | Sticky. Height: 64px. Full horizontal nav links. Logo left. Auth button right. |

```tsx
{/* Header responsive pattern */}
<header className="sticky top-0 z-40 h-14 lg:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
    {/* Mobile hamburger */}
    <Sheet>
      <SheetTrigger className="lg:hidden">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      {/* Sheet content */}
    </Sheet>

    {/* Desktop nav */}
    <nav className="hidden lg:flex items-center gap-6">
      {/* Nav links */}
    </nav>
  </div>
</header>
```

### Card Grids

Responsive column configurations for each card type:

| Card Type | base | sm | md | lg | xl | 2xl | Gap |
|---|---|---|---|---|---|---|---|
| Event cards | 1 | 2 | 2 | 3 | 3 | 3 | `gap-6` |
| Member cards | 2 | 2 | 3 | 4 | 4 | 5 | `gap-4` |
| Gallery images | 2 | 2 | 3 | 3 | 4 | 5 | `gap-4` |
| Admin overview | 1 | 2 | 2 | 3 | 4 | 4 | `gap-4` |
| Feature cards | 1 | 1 | 2 | 3 | 3 | 3 | `gap-6` |

```tsx
{/* Event card grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {events.map(event => <EventCard key={event.id} {...event} />)}
</div>

{/* Member card grid */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
  {members.map(member => <MemberCard key={member.id} {...member} />)}
</div>

{/* Gallery image grid */}
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
  {images.map(image => <GalleryImage key={image.id} {...image} />)}
</div>
```

### Detail Pages (Event Detail, Member Profile)

| Breakpoint | Layout | Notes |
|---|---|---|
| base – lg | Single column. Sidebar info stacked below main content. | Image full-width. |
| lg+ | Two-column: `grid-cols-[2fr_1fr]`. Main content left, sidebar right. | Sidebar sticky at top. |

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
  <main>
    {/* Event description, schedule, etc. */}
  </main>
  <aside className="lg:sticky lg:top-20">
    {/* Event meta, host info, RSVP button, etc. */}
  </aside>
</div>
```

### Admin Sidebar

| Breakpoint | Behavior |
|---|---|
| base – lg | Hidden. Accessed via Sheet (slide-in from left). Trigger: hamburger icon in admin header. |
| lg+ | Persistent. Fixed width: `w-64` (256px). Visible at all times. Content area is `flex-1`. |

```tsx
<div className="flex min-h-screen">
  {/* Mobile sidebar via Sheet */}
  <Sheet>
    <SheetTrigger className="lg:hidden fixed top-4 left-4 z-50">
      <Menu className="h-6 w-6" />
    </SheetTrigger>
    <SheetContent side="left" className="w-64 p-0">
      <AdminNav />
    </SheetContent>
  </Sheet>

  {/* Desktop persistent sidebar */}
  <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border">
    <AdminNav />
  </aside>

  {/* Main content */}
  <main className="flex-1 p-4 lg:p-8">
    {children}
  </main>
</div>
```

### Images

| Breakpoint | Behavior |
|---|---|
| All | `aspect-ratio` maintained via Tailwind `aspect-video`, `aspect-square`, etc. |
| base | Full container width. |
| lg+ | Respect grid column width. May have specific max dimensions. |

```tsx
{/* Responsive event banner image */}
<Image
  src={event.bannerUrl}
  alt={event.title}
  width={1280}
  height={720}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full aspect-video object-cover rounded-xl"
  priority={isAboveFold}
/>
```

Image `sizes` attribute must be set correctly for Next.js Image optimization:
- Single column: `100vw`
- 2-column grid: `50vw`
- 3-column grid: `33vw`
- Thumbnail: Fixed pixel width (e.g., `80px`)

### Typography Scaling

Hero and heading text scales across breakpoints to maintain visual impact without overflowing small screens:

| Text Element | base | sm | md | lg | xl | 2xl |
|---|---|---|---|---|---|---|
| Hero main | `text-4xl` (36px) | `text-5xl` (48px) | — | — | `text-7xl` (72px) | — |
| Page title | `text-2xl` (24px) | `text-3xl` (30px) | — | — | — | — |
| Section title | `text-xl` (20px) | `text-2xl` (24px) | — | — | — | — |
| Card title | `text-lg` (18px) | — | — | — | — | — |
| Body text | `text-base` (16px) | — | — | — | — | — |

Dashes (—) indicate no change at that breakpoint. The value from the previous breakpoint carries forward.

```tsx
{/* Hero heading responsive */}
<h1 className="font-heading text-4xl sm:text-5xl xl:text-7xl font-extrabold tracking-tight">
  VRC October Cohort
</h1>

{/* Page title responsive */}
<h1 className="font-heading text-2xl sm:text-3xl font-bold">
  Upcoming Events
</h1>
```

### Forms (Login, Profile Editor)

| Breakpoint | Layout | Card Width |
|---|---|---|
| base | Full width, `px-4` | `max-w-full` |
| sm | Centered, padded | `max-w-md` (448px) |
| lg+ | Centered, spacious | `max-w-lg` (512px) |

```tsx
{/* Login card responsive */}
<div className="flex items-center justify-center min-h-screen px-4">
  <div className="w-full max-w-md sm:max-w-lg bg-card border border-border rounded-[1.5rem] shadow-lg p-8 sm:p-12">
    <LoginForm />
  </div>
</div>
```

### Tables (Admin)

| Breakpoint | Behavior |
|---|---|
| base – md | Horizontal scroll with `overflow-x-auto`. Or convert to card-based layout. |
| lg+ | Full table layout. All columns visible. |

```tsx
{/* Responsive table wrapper */}
<div className="overflow-x-auto rounded-xl border border-border">
  <table className="w-full min-w-[640px]">
    {/* min-w prevents columns from squishing too narrow */}
    <thead>...</thead>
    <tbody>...</tbody>
  </table>
</div>
```

---

## Touch Target Requirements

All interactive elements must meet minimum touch target sizes on mobile:

| Element | Minimum Size | Implementation |
|---|---|---|
| Buttons | 44 × 44px | `min-h-[44px]` or padding ensures this |
| Links (standalone) | 44 × 44px | Padding around link text |
| Links (inline) | No minimum | Inline text links are exempt |
| Icon buttons | 44 × 44px | `p-2.5` on a 24px icon = 44px |
| Checkboxes/Radio | 44 × 44px | Clickable label area |
| Nav items (mobile) | 44 × 44px | `py-3` + text height |

---

## Testing Checklist

### Required Test Widths

Test the application at these specific viewport widths to cover all breakpoint transitions and common device sizes:

| Width | Device Representation | Breakpoint | Notes |
|---|---|---|---|
| **320px** | iPhone SE (smallest supported) | base | Absolute minimum. No horizontal overflow allowed. |
| **375px** | iPhone 12/13/14 | base | Most common small phone. |
| **414px** | iPhone 14 Plus / Pixel | base | Large phone. |
| **640px** | sm breakpoint trigger | sm | Verify 2-column card grids begin. |
| **768px** | iPad Mini portrait | md | Verify tablet layout adjustments. |
| **1024px** | iPad Pro / small laptop | lg | **Critical.** Verify desktop nav appears. Sidebar becomes persistent. 2-col layouts activate. |
| **1280px** | Standard desktop (primary) | xl | **Primary design target.** Everything must look perfect. |
| **1536px** | Large monitor / 2xl | 2xl | Verify content doesn't stretch; stays max-w-7xl centered. |

### Zoom Testing

| Test | Expected Behavior |
|---|---|
| 200% zoom at 1280px viewport | Layout should adapt to ~640px effective width (sm breakpoint behavior). No overflow. No truncation. |
| 150% zoom at 1280px viewport | Layout should adapt to ~853px effective width (md breakpoint behavior). |
| 100% zoom at 1280px viewport | Primary intended experience. |

### Orientation Testing

| Test | Device | Expected Behavior |
|---|---|---|
| Portrait to landscape | Smartphone (375 → 667) | Transition from base to sm. Cards may reflow to 2 columns. |
| Landscape to portrait | Tablet (1024 → 768) | Transition from lg to md. Desktop nav should switch to hamburger. |

### Accessibility Testing

- **Keyboard navigation:** Tab order must be logical at every breakpoint. Focus indicators visible.
- **Screen reader:** Content order in DOM must make sense regardless of visual layout (CSS Grid `order` changes don't affect DOM order).
- **Text reflow:** At 400% zoom on 1280px (effective 320px), content must reflow into a single column without horizontal scrolling (WCAG 1.4.10).

---

## Implementation Notes

### Tailwind CSS Mobile-First Convention

```tsx
{/* CORRECT: Mobile-first, enhancing upward */}
<div className="p-4 sm:p-6 lg:p-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    ...
  </div>
</div>

{/* WRONG: Desktop-first overriding downward (don't do this) */}
<div className="p-8 md:p-6 sm:p-4"> {/* ← Anti-pattern */}
```

### Container Query Consideration

For components that may appear in different container widths (e.g., a card in a 3-column grid vs. a card in a sidebar), consider Tailwind's `@container` queries in the future. For now, use standard breakpoints based on viewport width.

### Print Styles

```css
@media print {
  /* Remove navigation, admin sidebar, decorative elements */
  header, nav, aside, .hero-particles, .toast-container {
    display: none !important;
  }

  /* Single column, full width */
  .grid {
    display: block !important;
  }

  /* Remove shadows and backgrounds for ink saving */
  * {
    box-shadow: none !important;
    background: white !important;
    color: black !important;
  }
}
```
