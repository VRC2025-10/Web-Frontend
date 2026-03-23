# MemberSearch

> Debounced instant search input for member directory

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Provide a debounced search input that filters the member list in real-time via API |
| **File Path** | `components/features/members/member-search.tsx` |
| **Component Type** | Client Component (`"use client"`) |
| **API Endpoint** | `GET /api/v1/public/members?search={q}` (direct client fetch, no cookie needed) |
| **When to Use** | Members list page (`/members`) for filtering visible members |
| **When NOT to Use** | Admin user search (uses different API), global site search |

---

## 2. Props / API

### Component Props

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `onResults` | `(members: Member[]) => void` | — | Yes | Callback with search results to update parent grid |
| `onSearchStateChange` | `(isSearching: boolean) => void` | — | No | Notify parent when search is active (to hide pagination) |
| `onClear` | `() => void` | — | Yes | Callback to restore original ISR data when search cleared |
| `placeholder` | `string` | `"Search members..."` | No | Custom placeholder text |

### Internal Hook: `useDebouncedCallback`

```ts
// hooks/use-debounce.ts
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T;
```

- Delay: **300ms**
- Cancels pending callback on unmount
- Cancels pending callback when new input arrives

---

## 3. Visual Structure

### Default State

```
<div className="relative w-full max-w-md">
│
├─ <Search
│    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
│    aria-hidden="true"
│  />
│
├─ <Input
│    className="pl-10 pr-10 rounded-2xl"
│    placeholder="Search members..."
│    aria-label="Search members"
│    value={query}
│    onChange={handleChange}
│    type="search"
│  />
│
├─ {isLoading && (
│    <Loader2
│      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin"
│      aria-hidden="true"
│    />
│  )}
│
├─ {query && !isLoading && (
│    <Button
│      variant="ghost"
│      size="icon"
│      className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8"
│      onClick={handleClear}
│      aria-label="Clear search"
│    >
│      <X className="w-4 h-4" />
│    </Button>
│  )}
│
└─ <span className="sr-only" aria-live="polite" aria-atomic="true">
     {announcement}  <!-- e.g., "12 members found" or "Searching..." -->
   </span>
</div>
```

### Results Announcement Region

Separate from the input, a sr-only region updates:

| Condition | Announcement Text |
|---|---|
| Search in progress | "Searching..." |
| Results returned | "{count} members found" |
| No results | "No members found" |
| Search cleared | "" (empty, no announcement) |

---

## 4. Variant × State Matrix

| State | Input | Icon (left) | Icon (right) | Announcement |
|---|---|---|---|---|
| Empty (idle) | Placeholder visible | Search icon (muted) | None | — |
| Typing (pre-debounce) | User text | Search icon | None | — |
| Loading (post-debounce) | User text | Search icon | Loader2 spinner | "Searching..." |
| Results found | User text | Search icon | X clear button | "{count} members found" |
| No results | User text | Search icon | X clear button | "No members found" |
| Cleared | Placeholder returns | Search icon | None | — |

### Parent Behavior When Search Active

| Search State | Pagination | Member Grid |
|---|---|---|
| Inactive | Visible (URL-driven pages) | Shows ISR paginated data |
| Active (has query) | Hidden | Shows search results only |
| Cleared | Restored | Reverts to original ISR data |

---

## 5. Responsive Behavior

| Breakpoint | Width | Position |
|---|---|---|
| Mobile (`< md`) | `w-full` | Full width above member grid |
| Tablet (`md`) | `max-w-md` | Left-aligned above member grid |
| Desktop (`lg+`) | `max-w-md` | Left-aligned, same as tablet |

### Mobile Adjustments

- Input takes full width of container
- Clear button slightly larger touch target (`w-10 h-10`)
- No layout changes otherwise

---

## 6. Accessibility

### ARIA

- Input: `aria-label="Search members"`, `type="search"` (provides native clear on some browsers)
- Search icon: `aria-hidden="true"` (decorative)
- Loader spinner: `aria-hidden="true"` (decorative visual, sr-only text handles announcement)
- Clear button: `aria-label="Clear search"`
- Live region: `aria-live="polite"`, `aria-atomic="true"` — announces result count changes

### Keyboard

- **Tab**: Focus input → clear button (when visible)
- **Escape**: Clear search query and restore original data
- **Enter**: No form submit (instant search, no submission needed)
- **Any key in input**: Triggers debounced search

### Screen Reader

- Input identified as search: `type="search"` + `aria-label`
- Live region announces: "Searching..." → "{count} members found" / "No members found"
- Clear button announced: "Clear search"
- Loading state: sr-only "Searching..." in live region (spinner is `aria-hidden`)

### Focus Management

- Focus stays in input during search and result updates
- On clear: focus remains in input
- On Escape: focus remains in input, query cleared

---

## 7. Animation

### Loading Spinner

```tsx
// Loader2 uses Tailwind animate-spin (CSS animation, not Framer Motion)
<Loader2 className="animate-spin" />
```

### Clear Button Entrance/Exit

```tsx
<AnimatePresence>
  {query && !isLoading && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
    >
      <Button variant="ghost" size="icon" ...>
        <X />
      </Button>
    </motion.div>
  )}
</AnimatePresence>
```

### Input Focus Ring

```css
/* CSS transition, not Framer Motion */
transition: box-shadow 0.15s ease;
```

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Input background | `bg-background` (warm ivory) | `bg-background` (dark surface) |
| Input border | `border-input` | `border-input` (dark border) |
| Search icon | `text-muted-foreground` | `text-muted-foreground` |
| Spinner | `text-muted-foreground` | `text-muted-foreground` |
| Placeholder text | `text-muted-foreground` | `text-muted-foreground` |
| Focus ring | `ring-primary` (coral) | `ring-primary` |
| Clear button hover | `hover:bg-accent` | `hover:bg-accent` |

No structural changes — only semantic token shifts.
