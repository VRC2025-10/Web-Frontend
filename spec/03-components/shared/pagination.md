# Pagination

> URL-driven pagination with shadcn/ui Pagination components

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Navigate between pages of paginated content using URL query parameters |
| **File Path** | `components/shared/pagination.tsx` |
| **Component Type** | Server Component (URL-driven, no client state) |
| **Dependencies** | shadcn/ui Pagination components |
| **When to Use** | Member list, event list, admin data tables — any paginated content |
| **When NOT to Use** | Infinite scroll lists, search results (search hides pagination), single-page content |

---

## 2. Props / API

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `currentPage` | `number` | — | Yes | Current active page (1-indexed) |
| `totalPages` | `number` | — | Yes | Total number of pages |
| `baseUrl` | `string` | — | Yes | Base URL path for generating page links (e.g., `/members`) |
| `searchParams` | `Record<string, string>` | `{}` | No | Preserve existing query params when paginating |

### URL Pattern

```
/members?page=1
/members?page=2&search=keyword  ← preserves other params
```

### Page Number Generation Logic

Max 5 visible page numbers. Always show first, last, current, and neighbors:

```ts
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}
```

---

## 3. Visual Structure

```
<nav aria-label="Pagination" className="flex justify-center">
│
└─ <PaginationContent className="flex items-center gap-1">
   │
   ├─ <PaginationItem>
   │  └─ <PaginationPrevious
   │       href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : undefined}
   │       className="rounded-xl"
   │       aria-disabled={currentPage === 1}
   │     />
   │
   ├─ {pageNumbers.map(page => (
   │    page === "ellipsis" ? (
   │      <PaginationItem key={`ellipsis-${idx}`}>
   │        <PaginationEllipsis />
   │      </PaginationItem>
   │    ) : (
   │      <PaginationItem key={page}>
   │        <PaginationLink
   │          href={`${baseUrl}?page=${page}`}
   │          isActive={page === currentPage}
   │          className="rounded-xl"
   │          aria-current={page === currentPage ? "page" : undefined}
   │        >
   │          {page}
   │        </PaginationLink>
   │      </PaginationItem>
   │    )
   │  ))}
   │
   └─ <PaginationItem>
      └─ <PaginationNext
           href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : undefined}
           className="rounded-xl"
           aria-disabled={currentPage === totalPages}
         />
```

---

## 4. Variant × State Matrix

### Page Link States

| State | Classes | Behavior |
|---|---|---|
| Default | `bg-transparent text-foreground` | Clickable, navigates to page |
| Active (current) | `bg-primary text-primary-foreground` | Non-clickable, shows current page |
| Hover | `bg-accent` | Visual hover feedback |
| Focus | `focus-visible:ring-2 ring-primary ring-offset-2` | Keyboard focus ring |
| Disabled (prev/next at bounds) | `opacity-50 cursor-not-allowed pointer-events-none` | Not interactive |

### Page Count Scenarios

| Total Pages | Visible Elements |
|---|---|
| 1 | No pagination rendered |
| 2–5 | All page numbers, no ellipsis |
| 6+ (current near start) | `1 2 3 ... N` |
| 6+ (current in middle) | `1 ... 4 5 6 ... N` |
| 6+ (current near end) | `1 ... N-2 N-1 N` |

---

## 5. Responsive Behavior

| Breakpoint | Visible Elements |
|---|---|
| Mobile (`< md`) | Previous + Next buttons only (no page numbers) |
| Tablet (`md`) | Full pagination: Previous + page numbers + Next |
| Desktop (`lg+`) | Same as tablet |

### Mobile Implementation

```tsx
<PaginationContent>
  <PaginationItem>
    <PaginationPrevious ... />
  </PaginationItem>

  {/* Page numbers: hidden on mobile */}
  <div className="hidden md:flex items-center gap-1">
    {pageNumbers.map(...)}
  </div>

  {/* Mobile: show current/total */}
  <span className="md:hidden text-sm text-muted-foreground px-2">
    {currentPage} / {totalPages}
  </span>

  <PaginationItem>
    <PaginationNext ... />
  </PaginationItem>
</PaginationContent>
```

---

## 6. Accessibility

### ARIA

- Container: `<nav aria-label="Pagination">`
- Active page: `<a aria-current="page">` — announced as "current page"
- Disabled prev/next: `aria-disabled="true"` — announced as disabled
- Ellipsis: `<span role="presentation">` — not announced as interactive
- Page links: inherent `<a>` semantics — "Page 1", "Page 2", etc.

### Keyboard

- **Tab**: Navigate between pagination links
- **Enter**: Navigate to the selected page
- Disabled links: skipped in tab order (via `pointer-events-none` or `tabIndex={-1}`)

### Screen Reader

- `<nav aria-label="Pagination">` — announced as "Pagination navigation"
- Active page: "Page 3, current page"
- Other pages: "Page 1, link", "Page 2, link"
- Previous/Next: "Previous page" / "Next page" (shadcn default labels)
- Ellipsis: not announced (decorative)

### Focus Management

- Standard link navigation — no special focus management
- Focus visible ring on all interactive elements

---

## 7. Animation

### No Animation

Pagination is a Server Component rendered as static HTML with `<a>` tags. Page transitions are full navigations (Next.js handles the transition).

### Hover Transition

```css
/* CSS transition on hover background */
transition: background-color 0.15s ease, color 0.15s ease;
```

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Active page bg | `bg-primary` (coral) | `bg-primary` |
| Active page text | `text-primary-foreground` (white) | `text-primary-foreground` |
| Default page text | `text-foreground` | `text-foreground` |
| Hover bg | `bg-accent` (warm tint) | `bg-accent` (dark accent) |
| Disabled opacity | `opacity-50` | `opacity-50` |
| Nav border (if any) | `border-border` | `border-border` |
| Mobile current/total text | `text-muted-foreground` | `text-muted-foreground` |

No structural changes — tokens handle dark mode.
