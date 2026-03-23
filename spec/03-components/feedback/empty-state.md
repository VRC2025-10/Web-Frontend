# EmptyState

> Friendly empty state placeholder for lists and grids with no content

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Display a clear, friendly message when a list, grid, or section has no content to show |
| **File Path** | `components/shared/empty-state.tsx` |
| **Component Type** | Server Component (no interaction unless `action` prop provided) |
| **When to Use** | Any list/grid that can be empty: events, members, gallery, reports, clubs, filtered results |
| **When NOT to Use** | Loading states (use Skeleton), error states (use Alert/ErrorState), page-level 404 |

---

## 2. Props / API

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `icon` | `LucideIcon` | — | Yes | Lucide icon component to display |
| `message` | `string` | — | Yes | Primary message text |
| `action` | `ReactNode` | `undefined` | No | Optional action element (Button, Link) below the message |

### Usage Example

```tsx
<EmptyState
  icon={CalendarX}
  message="No events scheduled"
  action={
    <Button variant="outline" asChild>
      <Link href="/admin/events/new">Create Event</Link>
    </Button>
  }
/>
```

---

## 3. Visual Structure

```
<div className="flex flex-col items-center justify-center py-16 gap-4 text-center"
     role="status">
│
├─ <Icon
│    className="w-16 h-16 text-muted-foreground/50"
│    aria-hidden="true"
│    strokeWidth={1.5}
│  />
│
├─ <p className="text-muted-foreground text-lg">{message}</p>
│
└─ {action && (
     <div className="mt-2">{action}</div>
   )}
</div>
```

Design: Simple icon + text only. NO autumn leaf decoration on empty states (clarity priority).

---

## 4. Variant × State Matrix

### Instance Table

| Context | Icon | Message (ja) | Message (en) |
|---|---|---|---|
| Events empty | `CalendarX` | "現在予定されているイベントはありません" | "No events scheduled" |
| Members search 0 results | `SearchX` | "条件に一致するメンバーが見つかりません" | "No members found matching your criteria" |
| Gallery empty | `ImageOff` | "まだ写真がありません" | "No photos yet" |
| Reports empty | `ShieldCheck` | "未処理の報告はありません" | "No pending reports" |
| Users filtered 0 | `UserX` | "該当するユーザーがいません" | "No matching users" |
| Clubs empty | `Building2` | "まだクラブがありません" | "No clubs yet" |

### With/Without Action

| Variant | Action Element |
|---|---|
| Display only | No action — just icon + message |
| With action (admin) | Button (e.g., "Create Event", "Add Photos") |
| With action (user) | Link (e.g., "Browse all members", "Clear filters") |

---

## 5. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (`< md`) | `py-12`, icon `w-12 h-12`, text `text-base` |
| Tablet (`md`) | `py-16`, icon `w-16 h-16`, text `text-lg` |
| Desktop (`lg+`) | Same as tablet |

### Mobile Adjustments

- Reduced padding and icon size for compact display
- Action button full-width on mobile if it's a primary action
- Text wraps naturally within container

---

## 6. Accessibility

### ARIA

- Container: `role="status"` — non-intrusive announcement of empty state
- Icon: `aria-hidden="true"` (decorative, message conveys meaning)
- Message: rendered as `<p>` — read naturally by screen readers
- Action (if present): inherits its own accessibility (Button or Link)

### Keyboard

- If no action: no focusable elements, container is not focusable
- If action present: action element is focusable via Tab

### Screen Reader

- `role="status"` on container ensures the empty state is announced when it appears in a live context
- Message text provides full context: "No events scheduled"
- No redundant ARIA labels — the `<p>` text is sufficient

### Focus Management

- No special focus management — empty state is a static display
- If user triggered a search that yields empty results, focus stays on search input

---

## 7. Animation

### Entrance

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  className="flex flex-col items-center justify-center py-16 gap-4 text-center"
  role="status"
>
  ...
</motion.div>
```

### Icon Subtle Bounce (optional, non-essential)

```tsx
<motion.div
  initial={{ scale: 0.9 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
>
  <Icon className="w-16 h-16 text-muted-foreground/50" />
</motion.div>
```

### Reduced Motion

- Entrance: instant opacity, no y-translation
- No ongoing animations (it's a static state)

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Icon color | `text-muted-foreground/50` | `text-muted-foreground/50` (lighter base) |
| Message text | `text-muted-foreground` | `text-muted-foreground` |
| Background | Transparent (inherits parent) | Transparent (inherits parent) |
| Action button | Variant styling unchanged | Variant styling (dark tokens) |

No structural changes. Empty state is purposefully minimal — colors shift via semantic tokens.
