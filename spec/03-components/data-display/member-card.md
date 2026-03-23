# MemberCard Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Displays a member profile summary as a compact, avatar-centered card |
| **File path** | `components/features/members/member-card.tsx` |
| **Component type** | Client Component (`"use client"`) — hover animation via Framer Motion |
| **When to use** | Member listing grid on Members page, Home page "community" section |
| **When NOT to use** | Admin user management table (use AdminDataTable). Detailed profile view. |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `id` | `string` | — | Yes | Member ID, used for link href |
| `name` | `string` | — | Yes | Display name |
| `avatarUrl` | `string \| null` | `null` | No | Avatar image URL. `null` → fallback icon |
| `bioSummary` | `string` | `""` | No | Short bio excerpt, max ~80 chars |

> **Private profiles**: Members with private profiles are **not passed** to this component. Filtering happens server-side; the card never renders hidden or disabled states for privacy.

---

## Visual Structure

```
<motion.div                                      ← whileHover={{ y: -5 }}
  transition={{ type: "spring",                     stiffness: 400, damping: 15 }}
>
  <Card className="rounded-2xl p-6 text-center    ← border border-border/50 shadow-sm
                   group                              hover:shadow-[0_4px_20px_rgba(232,106,88,0.12)]
                   transition-shadow duration-300">
    <Link href={`/members/${id}`}                ← block focus-visible:ring-2
          className="block">                        focus-visible:ring-primary
                                                    focus-visible:ring-offset-2
                                                    focus-visible:outline-none
                                                    focus-visible:rounded-2xl

      <!-- Avatar -->
      <Avatar className="w-24 h-24 mx-auto        ← ring-2 ring-background shadow-md
                         ring-2 ring-background">
        <AvatarImage
          src={avatarUrl}
          alt={`${name}'s avatar`}
        />
        <AvatarFallback                           ← bg-muted
          className="bg-muted">
          <User className="w-10 h-10               text-muted-foreground
                           text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <!-- Name -->
      <h3 className="font-bold text-lg mt-4       ← line-clamp-1 text-foreground
                     line-clamp-1">
        {name}
      </h3>

      <!-- Bio -->
      <p className="text-muted-foreground          ← text-sm mt-2 line-clamp-2
                    text-sm mt-2 line-clamp-2">
        {bioSummary}
      </p>

    </Link>
  </Card>
</motion.div>
```

---

## Variant × State Matrix

| State | Card Shadow | Y Offset | Avatar | Focus Ring |
|---|---|---|---|---|
| **Default** | `shadow-sm` | `0` | Normal | — |
| **Hover** | `shadow-[0_4px_20px_rgba(232,106,88,0.12)]` (coral tint) | `-5px` | Normal | — |
| **Focus-visible** | `shadow-sm` | `0` | Normal | `ring-2 ring-primary ring-offset-2` |
| **Active (tap)** | `shadow-sm` | `-2px` | Normal | — |
| **Loading** | — | — | Skeleton circle | — |

### Loading Skeleton

```
<Card className="rounded-2xl p-6 text-center">
  <Skeleton className="w-24 h-24 rounded-full mx-auto" />
  <Skeleton className="h-5 w-32 mx-auto mt-4" />
  <Skeleton className="h-4 w-48 mx-auto mt-2" />
</Card>
```

---

## Responsive Behavior

| Breakpoint | Grid Columns | Card Size |
|---|---|---|
| **< sm** (< 640px) | 2 columns | Compact |
| **sm** (640px) | 3 columns | Medium |
| **lg** (1024px) | 4 columns | Standard |
| **xl** (1280px) | 5 columns | Standard |

> Grid layout is defined by the parent container. Card is fluid width.

| Element | < sm | sm+ |
|---|---|---|
| Avatar size | `w-20 h-20` | `w-24 h-24` |
| Name | `text-base` | `text-lg` |
| Bio lines | 1 line | 2 lines |

---

## Accessibility

### Semantics

| Element | Role/Attribute | Notes |
|---|---|---|
| Card root `<Link>` | `<a href="/members/{id}">` | Entire card is one clickable link |
| Avatar `<AvatarImage>` | `alt="{name}'s avatar"` | Descriptive alt text |
| Avatar fallback | `aria-hidden="true"` on User icon | Decorative when name announced |

### Keyboard Interaction

| Key | Behavior |
|---|---|
| `Tab` | Focuses the card (the Link element) |
| `Enter` | Navigates to member profile page |

### Screen Reader

- Announced as: link, "{name} — {bioSummary}"
- Avatar alt text: "{name}'s avatar"
- Fallback icon not announced (decorative)

---

## Animation

### Card Hover (Framer Motion)

```ts
<motion.div
  whileHover={{ y: -5 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 15,
  }}
>
```

### Shadow Transition (CSS)

```
transition-shadow duration-300
```

The coral-tinted hover shadow (`rgba(232,106,88,0.12)`) gives a warm, inviting lift effect consistent with the Autumn Soft theme.

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
| Hover shadow | `rgba(232,106,88,0.12)` | `rgba(232,106,88,0.08)` (subtler) |
| Avatar ring | `ring-background` | Same (adapts to dark bg) |
| Fallback bg | `bg-muted` | Same |
| Bio text | `text-muted-foreground` | Same |

---

## Related Components

- [EventCard](event-card.md) — similar hover pattern, thumbnail-focused
- [ClubCard](club-card.md) — similar hover pattern, cover-image-focused
- [AdminDataTable](data-table.md) — tabular view of users in admin
