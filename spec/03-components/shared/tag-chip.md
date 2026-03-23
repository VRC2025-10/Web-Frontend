# TagChip

> Inline tag/category chip for event tags, club categories, and filter toggles

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Display a colored tag chip for categories and tags, optionally functioning as a filter toggle |
| **File Path** | `components/shared/tag-chip.tsx` |
| **Component Type** | Server Component (display-only) or Client Component (when clickable/toggle) |
| **When to Use** | Event card tags, club categories, filter UI for tag-based filtering |
| **When NOT to Use** | Status badges (use Badge), navigation (use Tabs/Links), action buttons |

---

## 2. Props / API

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `name` | `string` | — | Yes | Tag display text |
| `color` | `string` | — | Yes | Hex color code (e.g., `"#E86A58"`) used for background tint and text |
| `onClick` | `() => void` | `undefined` | No | Click handler — if provided, renders as interactive toggle button |
| `isActive` | `boolean` | `false` | No | Active/selected state for filter toggle mode |

### Usage Examples

```tsx
// Display-only (Server Component compatible)
<TagChip name="Social" color="#E86A58" />

// Filter toggle (Client Component)
<TagChip
  name="Social"
  color="#E86A58"
  onClick={() => toggleFilter("social")}
  isActive={activeFilters.includes("social")}
/>
```

---

## 3. Visual Structure

### Display-Only Mode

```
<span
  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
  style={{ backgroundColor: `${color}20`, color: color }}
>
  {name}
</span>
```

### Interactive Toggle Mode

```
<button
  role="switch"
  aria-checked={isActive}
  onClick={onClick}
  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
             transition-all duration-150 cursor-pointer"
  style={{
    backgroundColor: isActive ? `${color}30` : `${color}10`,
    color: color,
    boxShadow: isActive ? `inset 0 0 0 1px ${color}` : "none",
  }}
>
  {name}
</button>
```

### Color Application

The `color` prop is applied inline to support arbitrary color values from the API:

| Property | Inactive | Active |
|---|---|---|
| Background | `${color}10` (6% opacity) | `${color}30` (19% opacity) |
| Text | `${color}` (full color) | `${color}` (full color) |
| Ring/Border | None | `inset box-shadow 1px ${color}` |

> **Note:** Inline styles used intentionally because tag colors come from API data and cannot be static Tailwind classes.

---

## 4. Variant × State Matrix

### Display Mode (span)

| State | Background | Text | Border |
|---|---|---|---|
| Default | `${color}20` | `${color}` | None |

### Toggle Mode (button)

| State | Background | Text | Border | Cursor |
|---|---|---|---|---|
| Inactive | `${color}10` | `${color}` | None | `pointer` |
| Inactive + Hover | `${color}20` | `${color}` | None | `pointer` |
| Active | `${color}30` | `${color}` | `1px solid ${color}` via box-shadow | `pointer` |
| Active + Hover | `${color}40` | `${color}` | `1px solid ${color}` | `pointer` |
| Focus | (any state) | (any state) | `focus-visible:ring-2 ring-primary ring-offset-2` | — |

---

## 5. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile (`< md`) | Same size, wraps naturally in flex container |
| Tablet (`md`) | Same as mobile |
| Desktop (`lg+`) | Same |

### Tag Wrap Pattern

Tags are typically rendered in a flex-wrap container:

```tsx
<div className="flex flex-wrap gap-2">
  {tags.map(tag => (
    <TagChip key={tag.id} name={tag.name} color={tag.color} />
  ))}
</div>
```

No size changes across breakpoints — tags are intrinsically sized by content.

---

## 6. Accessibility

### ARIA

**Display-only (`<span>`):**
- No ARIA attributes needed — decorative/informational text
- Rendered as inline text, read naturally by screen readers

**Toggle mode (`<button>`):**
- `role="switch"` — indicates toggle behavior
- `aria-checked={isActive}` — communicates on/off state
- Inherent button semantics — no additional `role` needed for the base element

### Keyboard

**Display-only:**
- Not focusable — no keyboard interaction

**Toggle mode:**
- **Tab**: Focus the tag button
- **Enter / Space**: Toggle active state
- Focus ring: `focus-visible:ring-2 ring-primary ring-offset-2 rounded-full`

### Screen Reader

**Display-only:**
- Announced as text: "Social" (the tag name)

**Toggle mode:**
- Announced as: "Social, switch, not checked" / "Social, switch, checked"
- State change announced on toggle

### Focus Management

- Standard button focus — no special management
- Focus ring wraps the rounded-full shape

---

## 7. Animation

### Toggle State Transition

```css
/* CSS transition — not Framer Motion */
transition: background-color 0.15s ease, box-shadow 0.15s ease;
```

### Hover

```css
transition: background-color 0.15s ease;
```

### Active Toggle Press

```tsx
// Optional micro-interaction
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.1 }}
>
  {name}
</motion.button>
```

### Reduced Motion

- `transition: none` — instant state changes
- `whileTap` disabled

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Background (inactive) | `${color}10` | `${color}15` (slightly brighter to maintain visibility) |
| Background (active) | `${color}30` | `${color}25` |
| Text color | `${color}` | `${color}` (colors may need lightened variants in dark mode) |
| Ring (active) | `${color}` solid | `${color}` solid |
| Focus ring | `ring-primary` | `ring-primary` |

### Dark Mode Color Adjustment

Since tag colors come from the API as hex values, ensure sufficient contrast in dark mode:

```ts
// If needed, lighten colors for dark mode readability:
// This can be handled via CSS filter or adjusted inline
const adjustedColor = isDark ? lighten(color, 0.15) : color;
```

> **Implementation note:** If all API-provided colors pass contrast checks in both modes, no runtime adjustment is needed. Verify during design QA.
