# SectionHeader

> Section title with optional description and action link

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Provide a consistent section heading pattern with optional description and action element |
| **File Path** | `components/shared/section-header.tsx` |
| **Component Type** | Server Component (no client-side interaction) |
| **When to Use** | Top of any content section on landing pages, list pages, and detail pages |
| **When NOT to Use** | Page-level `<h1>` headings (use page layout directly), card headers (use CardHeader) |

---

## 2. Props / API

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `title` | `string` | — | Yes | Section heading text |
| `description` | `string` | `undefined` | No | Optional subtitle / description below the heading |
| `action` | `ReactNode` | `undefined` | No | Optional action element (typically a Link with arrow icon) |

### Usage Examples

```tsx
// Basic
<SectionHeader title="Upcoming Events" />

// With description
<SectionHeader
  title="Our Members"
  description="Meet the community"
/>

// With action link
<SectionHeader
  title="Upcoming Events"
  description="See what's happening next"
  action={
    <Link href="/events" className="text-primary hover:underline inline-flex items-center gap-1">
      View all <ArrowRight className="w-4 h-4" />
    </Link>
  }
/>
```

---

## 3. Visual Structure

```
<div className="flex items-center justify-between">
│
├─ <div>
│  ├─ <h2 className="text-3xl font-bold">{title}</h2>
│  └─ {description && (
│       <p className="text-muted-foreground mt-2">{description}</p>
│     )}
│
└─ {action && (
     <div className="shrink-0">{action}</div>
   )}
</div>
```

### Common Action Pattern

```
<Link
  href="/events"
  className="text-primary hover:underline inline-flex items-center gap-1
             text-sm font-medium transition-colors"
>
  View all
  <ArrowRight className="w-4 h-4" />
</Link>
```

---

## 4. Variant × State Matrix

| Variant | Title | Description | Action | Layout |
|---|---|---|---|---|
| Title only | Visible | Hidden | Hidden | Single line |
| Title + Description | Visible | Visible below title | Hidden | Two lines, left-aligned |
| Title + Action | Visible | Hidden | Visible right-aligned | Flex row space-between |
| Full (all props) | Visible | Visible below title | Visible right-aligned | Flex row space-between |

### Action Element States

| State | Visual | Behavior |
|---|---|---|
| Default | `text-primary` | Normal link |
| Hover | `text-primary underline` | Underline appears |
| Focus | `focus-visible:ring-2 ring-primary` | Keyboard focus ring |
| Active | `text-primary/80` | Slightly dimmed on click |

---

## 5. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (`< md`) | Stack vertically: title/description above, action below (full-width row) |
| Tablet (`md`) | Flex row: title/description left, action right |
| Desktop (`lg+`) | Same as tablet |

### Mobile Adjustments

```tsx
<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
  <div>
    <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
    {description && <p className="text-muted-foreground mt-1 md:mt-2">{description}</p>}
  </div>
  {action && <div className="shrink-0">{action}</div>}
</div>
```

- Title size: `text-2xl` on mobile, `text-3xl` on tablet+
- Action: appears below title on mobile, right-aligned on tablet+

---

## 6. Accessibility

### ARIA

- `<h2>` provides semantic heading structure (section heading level)
- No additional ARIA needed — semantic HTML is sufficient
- Action Link: inherent link semantics with descriptive text

### Keyboard

- **Tab**: Focus moves to action link (if present)
- **Enter**: Activates action link
- No other keyboard interactions

### Screen Reader

- `<h2>` announced as heading level 2
- Description `<p>` read as normal text after heading
- Action link: "View all" + link destination announced
- ArrowRight icon inside link: should be `aria-hidden="true"` (decorative)

```tsx
<Link href="/events" className="...">
  View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
</Link>
```

### Focus Management

- No special focus management — standard document flow
- Focus ring on action link: `focus-visible:ring-2 ring-primary ring-offset-2 rounded-sm`

---

## 7. Animation

### No Animation

SectionHeader is a Server Component with no animation. It renders immediately as static HTML.

If parent containers use staggered entrance animations (e.g., home page sections), the SectionHeader animates as part of the parent's `motion.div`:

```tsx
<motion.section
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4 }}
>
  <SectionHeader title="Upcoming Events" action={...} />
  <EventGrid ... />
</motion.section>
```

### Action Link Hover

```css
/* CSS transition only */
.transition-colors {
  transition: color 0.15s ease;
}
```

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Title text | `text-foreground` (dark brown/black) | `text-foreground` (light/white) |
| Description text | `text-muted-foreground` | `text-muted-foreground` |
| Action link | `text-primary` (coral) | `text-primary` (lighter coral) |
| Action link underline | `text-primary` | `text-primary` |

No structural changes — all colors shift via semantic tokens.
