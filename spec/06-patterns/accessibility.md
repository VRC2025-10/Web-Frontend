# Accessibility (WCAG 2.2 Level AA)

> Version: 1.0 | Last updated: 2026-03-20

This document defines the accessibility requirements and implementation standards for the VRC community website. The target compliance level is **WCAG 2.2 Level AA**.

---

## Table of Contents

- [Color Contrast](#color-contrast)
- [Keyboard Navigation](#keyboard-navigation)
- [Focus Management](#focus-management)
- [Screen Reader Support](#screen-reader-support)
- [Touch Targets](#touch-targets)
- [Motion & Animation](#motion--animation)
- [Images](#images)
- [Forms](#forms)
- [Tables](#tables)
- [Component-Specific Requirements](#component-specific-requirements)
- [Testing](#testing)

---

## Color Contrast

All text must meet WCAG 2.2 AA contrast ratios:

| Requirement | Ratio | Applies To |
|---|---|---|
| Normal text (< 18pt / < 14pt bold) | **4.5:1** minimum | Body text, labels, links, captions |
| Large text (≥ 18pt / ≥ 14pt bold) | **3:1** minimum | Headings, large buttons |
| UI components & graphical objects | **3:1** minimum | Icons, borders, focus rings |

### Verified Token Pairs

| Foreground Token | Background Token | Usage | Ratio | Pass |
|---|---|---|---|---|
| `--foreground` (warm-gray-900) | `--background` (ivory) | Body text | ≥ 7:1 | ✅ |
| `--primary` (coral-600) | `--background` (ivory) | Primary links | ≥ 4.5:1 | ✅ |
| `--primary-foreground` (white) | `--primary` (coral-600) | Primary buttons | ≥ 4.5:1 | ✅ |
| `--muted-foreground` (warm-gray-500) | `--background` (ivory) | Placeholder/secondary text | ≥ 4.5:1 | ✅ |
| `--muted-foreground` (warm-gray-500) | `--muted` (warm-gray-100) | Text on muted bg | ≥ 4.5:1 | ✅ |
| `--destructive-foreground` (white) | `--destructive` (red-600) | Error buttons | ≥ 4.5:1 | ✅ |
| `--accent-foreground` (warm-gray-900) | `--accent` (mustard-100) | Accent areas | ≥ 4.5:1 | ✅ |
| `--card-foreground` (warm-gray-900) | `--card` (white) | Card content | ≥ 7:1 | ✅ |

### Rules

- Never rely on color alone to convey information. Always pair with text, icons, or patterns.
- Error states: red text + error icon + descriptive message.
- Status badges: use text labels in addition to color coding.
- Links within body text: underline in addition to color difference.

---

## Keyboard Navigation

### Tab Order by Page Type

| Page | Tab Order |
|---|---|
| **All pages** | Skip link → Header logo → Nav links → UserMenu → Main content → Footer links |
| **Home** | Hero CTA → Events section (cards) → Members section (cards) |
| **Events list** | Filter controls (status, tag, sort) → Event cards → Pagination |
| **Event detail** | Back button → Event content → Gallery images → Action buttons |
| **Members list** | Search input → Filter controls → Member cards → Pagination |
| **Profile editor** | Form fields (top to bottom) → Save / Cancel buttons |
| **Admin pages** | Sidebar nav items → Main content area → Action buttons |
| **Login** | Email input → Password input → Submit button → OAuth buttons |

### Key Behaviors

| Key | Behavior |
|---|---|
| `Tab` | Move focus to next interactive element |
| `Shift + Tab` | Move focus to previous interactive element |
| `Enter` | Activate buttons, submit forms, follow links |
| `Space` | Activate buttons, toggle checkboxes/switches, open selects |
| `Escape` | Close modals, sheets, dropdowns, tooltips, lightbox |
| `Arrow Up / Down` | Navigate within dropdown menus, select options, table rows |
| `Arrow Left / Right` | Navigate tabs, carousel slides, horizontal lists |
| `Home / End` | Jump to first/last item in lists, menus |

### Implementation

```tsx
// All interactive elements must be natively focusable or use tabIndex={0}
// Never use tabIndex > 0
// Use Radix UI primitives — they handle keyboard interaction by default

// Custom keyboard handler example for card grid navigation
function handleCardKeyDown(e: React.KeyboardEvent, index: number) {
  const cards = document.querySelectorAll('[data-card]');
  switch (e.key) {
    case 'ArrowRight':
      (cards[index + 1] as HTMLElement)?.focus();
      break;
    case 'ArrowLeft':
      (cards[index - 1] as HTMLElement)?.focus();
      break;
  }
}
```

---

## Focus Management

### Focus Ring Style

All interactive elements use a consistent focus ring:

```css
/* Global focus-visible style via Tailwind */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background;
}
```

| Property | Value | Purpose |
|---|---|---|
| `ring-2` | 2px ring width | Visible on all backgrounds |
| `ring-primary` | Coral-600 | Consistent with brand, meets 3:1 contrast |
| `ring-offset-2` | 2px offset | Separates ring from element for clarity |
| `ring-offset-background` | Ivory | Matches page background |

### Focus Trap

Focus traps are required for overlay components to prevent focus from escaping:

| Component | Focus Trap | Implementation |
|---|---|---|
| Modal Dialog | ✅ Required | Radix `Dialog` (built-in) |
| Sheet (mobile nav) | ✅ Required | Radix `Sheet` (built-in) |
| Lightbox | ✅ Required | Custom focus trap via `useFocusTrap()` |
| Dropdown Menu | ✅ Required | Radix `DropdownMenu` (built-in) |
| Alert Dialog | ✅ Required | Radix `AlertDialog` (built-in) |
| Tooltip | ❌ Not needed | Dismissible, not blocking |
| Toast | ❌ Not needed | Non-blocking notification |

### Focus Return

After closing any overlay, focus MUST return to the trigger element:

```tsx
// Radix handles this automatically for Dialog, Sheet, DropdownMenu.
// For custom overlays (e.g., Lightbox):
const triggerRef = useRef<HTMLButtonElement>(null);

function closeLightbox() {
  setOpen(false);
  // Return focus to trigger after animation completes
  requestAnimationFrame(() => {
    triggerRef.current?.focus();
  });
}
```

### Focus on Route Change

- On client-side navigation, focus moves to the `<main>` element.
- The `<main>` element has `tabIndex={-1}` to be programmatically focusable without appearing in tab order.

```tsx
// In layout or navigation hook
useEffect(() => {
  document.querySelector('main')?.focus();
}, [pathname]);
```

---

## Screen Reader Support

### Landmark Regions

Every page MUST include these landmark regions:

```html
<body>
  <a href="#main-content" class="sr-only focus:not-sr-only ...">
    Skip to main content
  </a>
  <header role="banner">
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main id="main-content" tabindex="-1" role="main">
    <!-- Page content -->
  </main>
  <aside role="complementary" aria-label="...">
    <!-- Sidebar (admin pages only) -->
  </aside>
  <footer role="contentinfo">...</footer>
</body>
```

### aria-live for Dynamic Content

| Content Type | `aria-live` | `aria-atomic` | Example |
|---|---|---|---|
| Toast notifications | `polite` | `true` | Success/error messages |
| Form validation errors | `assertive` | `false` | Inline error messages |
| Loading states | `polite` | `true` | "Loading events..." |
| Search results count | `polite` | `true` | "12 members found" |
| Pagination updates | `polite` | `true` | "Page 2 of 5" |
| Countdown timers | `off` | — | Rate limit countdown (use aria-label updates) |

```tsx
// Toast region (placed once in layout)
<div aria-live="polite" aria-atomic="true" class="sr-only" id="toast-region">
  {/* Toaster component renders announcements here */}
</div>

// Search results announcement
<p aria-live="polite" className="sr-only">
  {`${count} results found`}
</p>
```

### aria-label for Icon-Only Buttons

Every button or link that displays only an icon MUST have an accessible label:

```tsx
// ✅ Correct
<Button variant="ghost" size="icon" aria-label="Open menu">
  <Menu className="h-5 w-5" />
</Button>

// ✅ Correct — sr-only text
<Button variant="ghost" size="icon">
  <Menu className="h-5 w-5" />
  <span className="sr-only">Open menu</span>
</Button>

// ❌ Wrong — no accessible name
<Button variant="ghost" size="icon">
  <Menu className="h-5 w-5" />
</Button>
```

### Page Titles

Every page MUST have a unique, descriptive `<title>` via Next.js `metadata`:

```tsx
export const metadata: Metadata = {
  title: 'Upcoming Events | VRC Community',
};
```

---

## Touch Targets

All interactive elements MUST meet the **minimum 44×44px** touch target size:

| Element | Implementation |
|---|---|
| Buttons | `min-h-11 min-w-11` (44px) — already met by default Button sizes |
| Icon buttons | `size="icon"` = `h-10 w-10` → override to `min-h-11 min-w-11` on mobile |
| Links in navigation | `py-3 px-4` padding ensures touch area |
| Checkbox / Radio | Radix default + padding-based click area |
| Switch | `min-h-11` wrapper |
| Pagination buttons | `min-h-11 min-w-11` |
| Table row actions | `min-h-11 min-w-11` icon buttons |
| Close buttons (modals) | `min-h-11 min-w-11` |

```tsx
// Use touch-target wrapper when natural element is too small
<span className="inline-flex items-center justify-center min-h-11 min-w-11">
  <Checkbox />
</span>
```

---

## Motion & Animation

### prefers-reduced-motion

All animations MUST respect the user's motion preference:

```css
/* In global CSS — Tailwind v4 supports this natively */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
// In JavaScript when motion detection is needed
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Framer Motion integration
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.2,
  }}
/>
```

### Animation Inventory

| Animation | Default Duration | Reduced Motion |
|---|---|---|
| Page transitions | 200ms fade | Instant |
| Card hover lift | 150ms transform | No transform, opacity change only |
| Modal open/close | 200ms slide + fade | Instant |
| Sheet open/close | 300ms slide | Instant |
| Toast enter/exit | 200ms slide | Instant |
| Skeleton pulse | 2s infinite | Static gray block |
| Loading spinner | 1s infinite rotate | Static or no animation |
| Lightbox navigation | 200ms crossfade | Instant swap |

---

## Images

### Alt Text Strategy

| Image Type | Alt Text | Example |
|---|---|---|
| **Decorative** (bg, dividers) | `alt=""` (empty string) | Autumn leaf divider |
| **Informative** (content) | Descriptive text | `alt="Group photo from Halloween event 2025"` |
| **Functional** (linked/button) | Describe action | `alt="View member profile"` |
| **User avatars** | Username | `alt="Avatar of TanukiCoder"` |
| **Event thumbnails** | Event name | `alt="Thumbnail for Winter Festival 2025"` |
| **Gallery images** | User-provided or auto-generated | `alt={image.description \|\| 'Gallery image'}` |
| **Club logos** | Club name | `alt="Logo of VR Dance Club"` |
| **Icons (inline)** | `aria-hidden="true"` | Lucide icons within labeled buttons |

```tsx
// Next.js Image with proper alt
<Image
  src={event.thumbnail}
  alt={`Thumbnail for ${event.title}`}
  width={400}
  height={225}
  className="rounded-xl object-cover"
/>

// Decorative image
<Image src="/autumn-bg.webp" alt="" aria-hidden="true" className="..." />
```

---

## Forms

See also: [Forms Pattern](./forms.md)

### Label Association

Every input MUST have a programmatically associated label:

```tsx
// ✅ Using htmlFor
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" aria-describedby="email-error" />

// ✅ Using aria-label for visually hidden labels
<Input aria-label="Search members" placeholder="Search..." />
```

### Error Announcement

- Errors appear inline below the field.
- Errors are linked via `aria-describedby`.
- Error region uses `aria-live="assertive"` for immediate announcement.
- `aria-invalid="true"` is set on the input.

```tsx
<div>
  <Label htmlFor="name">Display Name</Label>
  <Input
    id="name"
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? 'name-error' : undefined}
  />
  {errors.name && (
    <p id="name-error" role="alert" className="text-sm text-destructive mt-1">
      {errors.name.message}
    </p>
  )}
</div>
```

### Required Field Indication

```tsx
<Label htmlFor="email">
  Email <span aria-hidden="true" className="text-destructive">*</span>
  <span className="sr-only">(required)</span>
</Label>
<Input id="email" required aria-required="true" />
```

---

## Tables

### Accessible Table Structure

All data tables MUST use proper semantic markup:

```tsx
<div className="overflow-x-auto" role="region" aria-label="Events data" tabIndex={0}>
  <table>
    <caption className="sr-only">List of upcoming events with date, title, and status</caption>
    <thead>
      <tr>
        <th scope="col">Date</th>
        <th scope="col">Title</th>
        <th scope="col">Status</th>
        <th scope="col">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>2026-04-01</td>
        <td>Spring Meetup</td>
        <td>
          <Badge>Upcoming</Badge>
        </td>
        <td>
          <Button variant="ghost" size="icon" aria-label="Edit Spring Meetup">
            <Pencil className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Table Requirements

| Requirement | Implementation |
|---|---|
| Column headers | `<th scope="col">` for every column |
| Row headers | `<th scope="row">` when first column identifies the row |
| Caption | `<caption>` (can be `sr-only`) describing table content |
| Sortable columns | `aria-sort="ascending|descending|none"` on `<th>` |
| Scrollable wrapper | `role="region"` + `aria-label` + `tabIndex={0}` |
| Empty state | Full-width row with empty state message |
| Pagination | Linked via `aria-label` on navigation, live region for page updates |

---

## Component-Specific Requirements

| Component | Requirement | Implementation |
|---|---|---|
| **Header** | Landmark: `<header role="banner">`, skip link target | `<nav aria-label="Main navigation">` |
| **MobileNav (Sheet)** | Focus trap, close on Escape, focus return to hamburger | Radix `Sheet` handles automatically |
| **UserMenu** | Dropdown: arrow key navigation, type-ahead, close on Escape | Radix `DropdownMenu` |
| **EventCard** | Card as `<article>`, primary link covers card, `aria-label` with event title | `<article aria-label="Event: {title}">` |
| **MemberCard** | Card as `<article>`, avatar alt text, role/status announced | `<article aria-label="Member: {name}">` |
| **Lightbox** | Focus trap, Escape to close, arrow keys for prev/next, alt text on images | Custom focus trap + keyboard handler |
| **DataTable** | Full table semantics, sortable columns, pagination, scrollable wrapper | See [Tables](#tables) section |
| **ProfileForm** | Label association, required fields marked, error announcements | See [Forms](#forms) section |
| **StatusBadge** | Color + text label, `role="status"` for dynamic badges | `<Badge role="status">Approved</Badge>` |
| **Pagination** | `<nav aria-label="Pagination">`, current page `aria-current="page"` | Radix or custom with proper ARIA |
| **Toast** | `role="status"`, `aria-live="polite"`, auto-dismiss with sufficient time (≥5s) | Radix `Toast` |
| **AlertDialog** | Focus trap, descriptive title, confirm/cancel buttons | Radix `AlertDialog` |
| **Tabs** | `role="tablist"`, arrow key navigation, `aria-selected` | Radix `Tabs` |
| **Skeleton** | `aria-hidden="true"` or `aria-busy="true"` on parent | `<div aria-busy="true">` |
| **SearchInput** | `role="searchbox"`, live results count, clear button labeled | `<Input role="searchbox" aria-label="Search">` |
| **FilterControls** | Grouped with `role="group"` + `aria-label`, clear all labeled | `<div role="group" aria-label="Filter events">` |

---

## Testing

### Automated Testing

| Tool | Purpose | Integration |
|---|---|---|
| **axe-core** | Automated a11y rule checking | `@axe-core/react` in dev mode, `axe-playwright` in E2E |
| **eslint-plugin-jsx-a11y** | Static analysis of JSX | ESLint configuration |
| **Lighthouse** | Accessibility audit score | CI pipeline, target score ≥ 95 |
| **Playwright** | Keyboard navigation E2E tests | Test suite per page |

### axe-core Integration

```tsx
// In development mode only (app/layout.tsx or a dev-only provider)
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Lighthouse CI

```yaml
# In CI pipeline
- name: Lighthouse Accessibility Audit
  run: |
    npx lhci autorun --collect.url=http://localhost:3000 \
      --assert.assertions.categories:accessibility=error \
      --assert.assertions.categories:accessibility.minScore=0.95
```

### Keyboard Manual Testing Protocol

Perform the following for every page before release:

| Step | Action | Expected Result |
|---|---|---|
| 1 | Press `Tab` from top of page | Focus moves through all interactive elements in logical order |
| 2 | Verify focus ring visibility | Every focused element shows `ring-2 ring-primary ring-offset-2` |
| 3 | Press `Enter` on buttons/links | Activates the element |
| 4 | Press `Space` on buttons/toggles | Activates the element |
| 5 | Open a modal/sheet | Focus moves inside, trapped |
| 6 | Press `Escape` | Modal/sheet closes, focus returns to trigger |
| 7 | Navigate dropdown with arrows | Items highlighted sequentially |
| 8 | Tab through forms | All fields reachable, labels announced |
| 9 | Submit form with errors | Errors announced, focus moves to first error |
| 10 | Use skip link | Focus jumps to main content |

### Screen Reader Testing

| Screen Reader | Browser | Priority |
|---|---|---|
| NVDA | Chrome / Firefox | Primary |
| VoiceOver | Safari (macOS) | Secondary |
| VoiceOver | Safari (iOS) | Secondary |
| TalkBack | Chrome (Android) | Tertiary |

---

## Cross-References

- [Forms Pattern](./forms.md)
- [Navigation Pattern](./navigation.md)
- [Error Handling Pattern](./error-handling.md)
- [Empty States Pattern](./empty-states.md)
- [Responsive Pattern](./responsive.md)
- [Color Tokens](../02-tokens/colors.md)
- [Typography Tokens](../02-tokens/typography.md)
- [Motion Tokens](../02-tokens/motion.md)
