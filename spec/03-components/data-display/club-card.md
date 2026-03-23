# ClubCard Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Displays a club summary as a magazine-style card with wide cover image and text below |
| **File path** | `components/features/clubs/club-card.tsx` |
| **Component type** | Client Component (`"use client"`) — hover animation via Framer Motion |
| **When to use** | Club listing grid on Clubs page, Home page "clubs" section |
| **When NOT to use** | Admin club management table (use AdminDataTable). Club detail page. |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `id` | `string` | — | Yes | Club ID, used for link href |
| `name` | `string` | — | Yes | Club name |
| `description` | `string` | `""` | No | Short description of the club |
| `coverImageUrl` | `string \| null` | `null` | No | Cover image URL. `null` → gradient fallback with icon |

---

## Visual Structure

```
<motion.div                                      ← whileHover={{ y: -4 }}
  transition={{ type: "spring",                     stiffness: 400, damping: 15 }}
>
  <Card className="rounded-2xl overflow-hidden    ← border border-border/50 shadow-sm
                   group                              hover:shadow-md
                   transition-shadow duration-300">
    <Link href={`/clubs/${id}`}                  ← block focus-visible:ring-2
          className="block">                        focus-visible:ring-primary
                                                    focus-visible:ring-offset-2
                                                    focus-visible:outline-none
                                                    focus-visible:rounded-2xl

      <!-- Cover Image -->
      <div className="h-48 overflow-hidden         ← bg-muted
                      overflow-hidden">

        <!-- When coverImageUrl exists: -->
        <Image
          src={coverImageUrl}
          alt=""                                     decorative — name provides context
          fill
          className="object-cover w-full h-full
                     transition-transform duration-300
                     group-hover:scale-105"
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 50vw,
                 33vw"
        />

        <!-- When coverImageUrl is null (fallback): -->
        <div className="w-full h-full
                        bg-gradient-to-br
                        from-primary/20 to-accent/20
                        flex items-center justify-center">
          <Building2 className="w-12 h-12 text-primary/40" />
        </div>
      </div>

      <!-- Content -->
      <CardContent className="p-5">

        <!-- Club Name -->
        <h3 className="text-xl font-bold           ← line-clamp-1 text-foreground
                       line-clamp-1">
          {name}
        </h3>

        <!-- Description -->
        <p className="text-muted-foreground         ← line-clamp-2 mt-2 text-sm
                      line-clamp-2 mt-2">
          {description}
        </p>

      </CardContent>
    </Link>
  </Card>
</motion.div>
```

---

## Variant × State Matrix

| State | Card Shadow | Image | Y Offset | Focus Ring |
|---|---|---|---|---|
| **Default** | `shadow-sm` | Normal | `0` | — |
| **Hover** | `shadow-md` | `scale-105` | `-4px` | — |
| **Focus-visible** | `shadow-sm` | Normal | `0` | `ring-2 ring-primary ring-offset-2` |
| **Active (tap)** | `shadow-sm` | Normal | `-2px` | — |
| **Loading** | — | Skeleton | — | — |

### Loading Skeleton

```
<Card className="rounded-2xl overflow-hidden">
  <Skeleton className="h-48 w-full" />
  <div className="p-5">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-4 w-full mt-2" />
    <Skeleton className="h-4 w-3/4 mt-1" />
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

> Grid layout is defined by the parent container. Card is fluid width.

| Element | < sm | sm+ |
|---|---|---|
| Cover height | `h-40` | `h-48` |
| Name | `text-lg` | `text-xl` |
| Description lines | 2 lines | 2 lines |

---

## Accessibility

### Semantics

| Element | Role/Attribute | Notes |
|---|---|---|
| Card root `<Link>` | `<a href="/clubs/{id}">` | Entire card is one clickable link |
| Cover `<Image>` | `alt=""` | Decorative — the club name provides context |
| Fallback icon | `aria-hidden="true"` | Decorative |

### Keyboard Interaction

| Key | Behavior |
|---|---|
| `Tab` | Focuses the card (the Link element) |
| `Enter` | Navigates to club detail page |

### Screen Reader

- Announced as: link, "{name} — {description}"
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
/* Applied via: transition-transform duration-300 group-hover:scale-105 */
```

### Card Enter (Grid Animation)

```ts
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: i * 0.05,
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
| Cover fallback gradient | `from-primary/20 to-accent/20` | Same |
| Description | `text-muted-foreground` | Same |

No special dark-mode overrides — semantic tokens handle the switch.

---

## Related Components

- [EventCard](event-card.md) — similar hover pattern, event-focused
- [MemberCard](member-card.md) — similar hover pattern, avatar-focused
- [AdminDataTable](data-table.md) — tabular view of clubs in admin
