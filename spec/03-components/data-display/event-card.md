# EventCard Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Displays an event summary as a clickable card with thumbnail, tags, title, date, and host |
| **File path** | `components/features/events/event-card.tsx` |
| **Component type** | Client Component (`"use client"`) — hover animation via Framer Motion |
| **When to use** | Event listing grids on Home page, Events page, and Member profile "hosted events" section |
| **When NOT to use** | Admin data tables (use AdminDataTable rows instead). Event detail pages (use full layout). |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `id` | `string` | — | Yes | Event ID, used for link href |
| `title` | `string` | — | Yes | Event title |
| `thumbnailUrl` | `string \| null` | `null` | No | Thumbnail image URL. `null` → gradient placeholder |
| `hostName` | `string` | — | Yes | Display name of the event host |
| `startTime` | `string` | — | Yes | ISO 8601 datetime string for event start |
| `endTime` | `string \| null` | `null` | No | ISO 8601 datetime string for event end. `null` → no end time shown |
| `tags` | `Tag[]` | `[]` | No | Array of `{ id: string; name: string; color?: string }` |

### Tag Type

```ts
interface Tag {
  id: string;
  name: string;
  color?: string; // Optional hex color for chip background
}
```

---

## Visual Structure

```
<motion.div                                      ← whileHover={{ y: -4 }}
  transition={{ type: "spring",                     stiffness: 400, damping: 15 }}
>
  <Card className="rounded-2xl overflow-hidden    ← shadow-sm hover:shadow-md
                   border border-border/50           transition-shadow duration-300
                   group">
    <Link href={`/events/${id}`}                 ← block focus-visible:ring-2
          className="block">                        focus-visible:ring-primary
                                                    focus-visible:ring-offset-2
                                                    focus-visible:outline-none
                                                    focus-visible:rounded-2xl

      <!-- Thumbnail -->
      <div className="relative aspect-video       ← overflow-hidden bg-muted
                      overflow-hidden">
        <!-- When thumbnailUrl exists: -->
        <Image
          src={thumbnailUrl}
          alt=""                                     decorative — title provides context
          fill
          className="object-cover
                     transition-transform duration-300
                     group-hover:scale-105"
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 50vw,
                 33vw"
        />

        <!-- When thumbnailUrl is null (fallback): -->
        <div className="w-full h-full
                        bg-gradient-to-br
                        from-primary/20 to-accent/20
                        flex items-center justify-center">
          <Calendar className="w-12 h-12 text-primary/40" />
        </div>
      </div>

      <!-- Content -->
      <CardContent className="p-5 space-y-3">

        <!-- Tags -->
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <TagChip key={tag.id}                ← text-xs px-2.5 py-0.5 rounded-full
                     name={tag.name}                bg-secondary/15 text-secondary-foreground
                     color={tag.color} />            font-medium
          ))}
        </div>

        <!-- Title -->
        <h3 className="text-lg font-bold          ← line-clamp-2 text-foreground
                       line-clamp-2">
          {title}
        </h3>

        <!-- Date/Time -->
        <div className="bg-secondary/15            ← rounded-lg px-3 py-1.5
                        rounded-lg px-3 py-1.5       inline-flex items-center gap-2
                        inline-flex items-center       text-sm text-foreground/80
                        gap-2 text-sm">
          <Calendar className="w-4 h-4              shrink-0
                               text-muted-foreground" />
          <span>{formattedDateRange}</span>          e.g. "3月15日 21:00 〜 22:30"
        </div>

        <!-- Host -->
        <p className="text-muted-foreground         text-sm
                      text-sm">
          主催: {hostName}
        </p>

      </CardContent>
    </Link>
  </Card>
</motion.div>
```

---

## Variant × State Matrix

| State | Card Shadow | Card Border | Image | Y Offset | Focus Ring |
|---|---|---|---|---|---|
| **Default** | `shadow-sm` | `border-border/50` | Normal | `0` | — |
| **Hover** | `shadow-md` | `border-border/50` | `scale-105` | `-4px` | — |
| **Focus-visible** | `shadow-sm` | — | Normal | `0` | `ring-2 ring-primary ring-offset-2` |
| **Active (tap)** | `shadow-sm` | `border-border/50` | Normal | `-2px` | — |
| **Loading** | — | — | Skeleton | — | — |

### Loading Skeleton

```
<Card className="rounded-2xl overflow-hidden">
  <Skeleton className="aspect-video w-full" />
  <div className="p-5 space-y-3">
    <div className="flex gap-1.5">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-5 w-48 rounded-lg" />
    <Skeleton className="h-4 w-32" />
  </div>
</Card>
```

---

## Responsive Behavior

| Breakpoint | Grid Columns | Card Width |
|---|---|---|
| **< sm** (< 640px) | 1 column | Full width |
| **sm** (640px) | 2 columns | ~50% |
| **lg** (1024px) | 3 columns | ~33% |

> Grid layout is defined by the parent container, not the card itself. Card is fluid width.

| Element | < sm | sm+ |
|---|---|---|
| Title `line-clamp` | 2 lines | 2 lines |
| Tag chips | wrap | wrap |
| Image aspect ratio | `aspect-video` (16:9) | Same |

---

## Accessibility

### Semantics

| Element | Role/Attribute | Notes |
|---|---|---|
| Card root `<Link>` | `<a href="/events/{id}">` | Entire card is one clickable link |
| Thumbnail `<Image>` | `alt=""` | Decorative — the card title provides meaning |
| Tag chips | `<span aria-label="{tag.name} tag">` | Context for screen readers |
| Date block | Uses `<time datetime="{ISO}">` inside | Machine-readable date |

### Keyboard Interaction

| Key | Behavior |
|---|---|
| `Tab` | Focuses the card (the Link element) |
| `Enter` | Navigates to event detail page |
| `Space` | Navigates to event detail page (link behavior) |

### Screen Reader

- Announced as: link, "Event Title — 3月15日 21:00 〜 22:30 — 主催: HostName"
- Tags visible but secondary — announced if user navigates into card content
- Image skipped (decorative `alt=""`)

---

## Animation

### Card Hover (Framer Motion)

```ts
<motion.div
  whileHover={{ y: -4 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 15,
  }}
>
```

### Image Zoom (CSS)

```css
.group:hover img {
  transform: scale(1.05);
}
/* Applied via: transition-transform duration-300 group-hover:scale-105 */
```

### Card Enter (Grid Animation)

```ts
// When cards appear in a grid (e.g., page load, filter change)
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: i * 0.05, // stagger by index
    },
  }),
};
```

---

## Dark Mode

| Element | Light | Dark |
|---|---|---|
| Card bg | `bg-card` | Same (token adapts) |
| Card border | `border-border/50` | Same |
| Card shadow | warm brown tint | neutral shadow |
| Thumbnail fallback gradient | `from-primary/20 to-accent/20` | Same (slightly more muted) |
| Tag chips | `bg-secondary/15` | Same |
| Date bg | `bg-secondary/15` | Same |

---

## Date Formatting

```ts
// Format: "3月15日 21:00 〜 22:30" (Japanese locale)
// Format: "Mar 15, 21:00 – 22:30" (English locale)
function formatEventDateRange(
  startTime: string,
  endTime: string | null,
  locale: "ja" | "en"
): string;
```

When `endTime` is null, show only the start: `"3月15日 21:00 〜"`

---

## Related Components

- [MemberCard](member-card.md) — similar hover pattern, avatar-focused
- [ClubCard](club-card.md) — similar hover pattern, cover-image-focused
- [TagChip](../shared/tag-chip.md) — reusable tag component used in card
- [AdminDataTable](data-table.md) — tabular view of events in admin
