# Elevation, Shadows, Borders & Shape

Shadow scale, border radii, border styles, focus indicators, and z-index layering for the Autumn Soft theme.

---

## Shadow Scale

All light-mode shadows use a warm brown tint (`rgba(74, 59, 50, ...)`) instead of black. This preserves the café-like warmth and prevents harsh, cold shadow edges. Shadows are the primary mechanism for conveying depth and interactivity.

### Light Mode Shadows

| Token | Value | Use Case |
|---|---|---|
| `--shadow-none` | `none` | Flat elements, pressed state |
| `--shadow-xs` | `0 1px 2px rgba(74, 59, 50, 0.05)` | Subtle baseline lift — resting buttons, inputs |
| `--shadow-sm` | `0 2px 8px rgba(74, 59, 50, 0.06)` | Cards at rest, dropdown trigger |
| `--shadow-md` | `0 4px 20px rgba(74, 59, 50, 0.08)` | Cards on hover, active dropdowns, popovers |
| `--shadow-lg` | `0 8px 30px rgba(74, 59, 50, 0.10)` | Modal dialogs, full-screen sheets |
| `--shadow-xl` | `0 12px 40px rgba(74, 59, 50, 0.12)` | Top-level floating elements, drag previews |

### Dark Mode Shadows

In dark mode, warm brown tint becomes invisible against dark backgrounds. Shadows switch to pure black at higher opacity to remain visible.

| Token | Dark Value | Notes |
|---|---|---|
| `--shadow-none` | `none` | — |
| `--shadow-xs` | `0 1px 2px rgba(0, 0, 0, 0.15)` | Slightly higher opacity than light |
| `--shadow-sm` | `0 2px 8px rgba(0, 0, 0, 0.20)` | Visible against #1A1512 background |
| `--shadow-md` | `0 4px 20px rgba(0, 0, 0, 0.25)` | Hover state on dark cards |
| `--shadow-lg` | `0 8px 30px rgba(0, 0, 0, 0.30)` | Modals on dark background |
| `--shadow-xl` | `0 12px 40px rgba(0, 0, 0, 0.35)` | Top-level floating on dark |

### Shadow Usage Guidelines

| Element State | Light Shadow | Dark Shadow | Transition |
|---|---|---|---|
| Card (resting) | `shadow-sm` | `shadow-sm` | — |
| Card (hover) | `shadow-md` | `shadow-md` | `transition-shadow duration-300` |
| Button (resting) | `shadow-xs` | `shadow-xs` | — |
| Button (hover) | `shadow-sm` | `shadow-sm` | `transition-shadow duration-150` |
| Button (pressed) | `shadow-none` | `shadow-none` | `transition-shadow duration-100` |
| Dropdown menu | `shadow-md` | `shadow-md` | Appears with animation |
| Modal / Dialog | `shadow-lg` | `shadow-lg` | Appears with animation |
| Popover | `shadow-xl` | `shadow-xl` | Appears with animation |
| Toast notification | `shadow-md` | `shadow-md` | Appears with animation |
| Sticky header | `shadow-sm` | `shadow-sm` | Appears on scroll |

### CSS Custom Properties

```css
@layer base {
  :root {
    --shadow-xs: 0 1px 2px rgba(74, 59, 50, 0.05);
    --shadow-sm: 0 2px 8px rgba(74, 59, 50, 0.06);
    --shadow-md: 0 4px 20px rgba(74, 59, 50, 0.08);
    --shadow-lg: 0 8px 30px rgba(74, 59, 50, 0.10);
    --shadow-xl: 0 12px 40px rgba(74, 59, 50, 0.12);
  }

  .dark {
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.15);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.20);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.25);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.30);
    --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.35);
  }
}
```

---

## Border Radius Scale

Autumn Soft uses generously rounded corners as a core visual characteristic. The default radius is `rounded-xl` — significantly rounder than most UI systems. This creates the warm, soft, approachable feel central to the theme.

| Token | Value (rem) | Value (px) | Tailwind | Use Case |
|---|---|---|---|---|
| `--radius-none` | 0 | 0 | `rounded-none` | — (never used in Autumn Soft) |
| `--radius-sm` | 0.375rem | 6px | `rounded-md` | Small badges, inline code, compact tags |
| `--radius-md` | 0.5rem | 8px | `rounded-lg` | Admin table cells, data-dense UI, form inputs |
| `--radius-lg` | 0.75rem | 12px | `rounded-xl` | **Standard cards**, buttons, dropdowns, popovers |
| `--radius-xl` | 1rem | 16px | `rounded-2xl` | Feature cards, image containers, login card |
| `--radius-2xl` | 1.5rem | 24px | `rounded-[1.5rem]` | Hero sections, prominent feature elements |
| `--radius-3xl` | 2rem | 32px | `rounded-[2rem]` | Profile card, major decorative elements |
| `--radius-full` | 9999px | — | `rounded-full` | Avatars, pill badges, circular buttons, chips |

### Radius Assignment Rules

> **"Autumn Soft uses generous radii. Default to `rounded-xl` or `rounded-2xl` for cards. Only admin UI drops to `rounded-lg`."**

| Component Category | Default Radius | Tailwind | Notes |
|---|---|---|---|
| **Public cards** (EventCard, ClubCard) | `--radius-lg` (12px) | `rounded-xl` | Standard for all public-facing cards |
| **Feature/hero cards** | `--radius-xl` (16px) | `rounded-2xl` | Larger radius for prominent elements |
| **Admin cards** | `--radius-md` (8px) | `rounded-lg` | Tighter for data density |
| **Buttons** | `--radius-lg` (12px) | `rounded-xl` | Large, friendly click targets |
| **Input fields** | `--radius-md` (8px) | `rounded-lg` | Slightly less than buttons for visual hierarchy |
| **Dropdown menus** | `--radius-lg` (12px) | `rounded-xl` | Match card radius |
| **Modal dialogs** | `--radius-xl` (16px) | `rounded-2xl` | Prominent overlay elements |
| **Toast notifications** | `--radius-lg` (12px) | `rounded-xl` | Consistent with cards |
| **Avatars** | `--radius-full` | `rounded-full` | Always circular |
| **Images in cards** | `--radius-lg` (12px) | `rounded-xl` | Match card radius minus card padding |
| **Badges / Tags** | `--radius-full` | `rounded-full` | Pill shape for status/category tags |
| **Login card** | `--radius-2xl` (24px) | `rounded-[1.5rem]` | Extra-soft for welcoming feel |
| **Profile card** | `--radius-3xl` (32px) | `rounded-[2rem]` | Maximum softness for personal content |

### CSS Custom Property

```css
@layer base {
  :root {
    --radius: 0.75rem; /* 12px — maps to rounded-xl, used by shadcn/ui */
  }
}
```

The `--radius` variable is used by shadcn/ui components. Individual components apply multiples or fractions of this base:
- `border-radius: var(--radius)` → 12px (buttons, cards)
- `border-radius: calc(var(--radius) - 4px)` → 8px (inputs within cards)
- `border-radius: calc(var(--radius) + 4px)` → 16px (modals)

---

## Border Styles

### Border Token Definitions

| Token | Value | Use Case |
|---|---|---|
| `--border-width` | `1px` | Standard border width for all borders |
| `--border-color` | `var(--border)` | Default border color (Bisque / Dark Border) |
| `--border-input` | `var(--border)` | Form input border color |
| `--ring-width` | `2px` | Focus ring width |
| `--ring-color` | `var(--primary)` | Focus ring color (Maple Coral / Dark Coral) |
| `--ring-offset` | `2px` | Space between element and focus ring |

### Border Usage

| Element | Border Style | Notes |
|---|---|---|
| Cards | `border border-border` | 1px solid, visible separation from background |
| Inputs | `border border-input` | Same color as general border tokens |
| Dividers | `border-t border-border` | Horizontal rules between sections |
| Sidebar | `border-r border-border` | Vertical separator for admin sidebar |
| Table rows | `border-b border-border` | Bottom border on each row |
| Tabs (active) | `border-b-2 border-primary` | 2px bottom border to indicate active tab |

### Border in Dark Mode

Borders remain visible but subtle. The warm `#3A302A` (Dark Border) provides enough contrast against `#231E1A` (Card Dark) and `#1A1512` (Deep Bark) backgrounds without being harsh.

---

## Focus Ring Specification

All interactive elements **MUST** have a visible focus indicator for keyboard accessibility (WCAG 2.1 SC 2.4.7). The Autumn Soft focus style uses the primary color as a ring.

### Standard Focus Ring

```css
/* Applied to all interactive elements via Tailwind */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

This produces:
- A **2px ring** in the primary color (Maple Coral / Dark Coral)
- A **2px offset** between the element edge and the ring
- The offset uses the **background color** so the ring appears to float

### Focus Ring Variants

| Element | Focus Style | Notes |
|---|---|---|
| Buttons | `focus-visible:ring-2 ring-ring ring-offset-2` | Standard ring |
| Inputs | `focus-visible:ring-2 ring-ring ring-offset-0` | No offset — ring hugs the input |
| Links (inline) | `focus-visible:ring-2 ring-ring ring-offset-2 rounded-sm` | Tight radius around text |
| Cards (clickable) | `focus-visible:ring-2 ring-ring ring-offset-2` | Ring around entire card |
| Avatars | `focus-visible:ring-2 ring-ring ring-offset-2` | Ring follows circular shape |
| Tabs | `focus-visible:ring-2 ring-ring ring-offset-2` | Ring around tab button |

### Focus Ring Implementation

```tsx
// Button component focus classes
const buttonFocusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Input component focus classes (no offset)
const inputFocusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
```

---

## Z-Index Scale

Layering system for overlapping elements. Values are kept minimal because Radix UI manages its own z-index via portals for most overlay components.

| Token | Value | Use Case | Notes |
|---|---|---|---|
| `--z-base` | `0` | Default stacking | Page content, cards |
| `--z-raised` | `10` | Raised elements | Floating action buttons |
| `--z-sticky` | `40` | Sticky elements | Sticky header, sticky sidebar |
| `--z-dropdown` | `50` | Dropdown menus | Radix DropdownMenu (usually via portal) |
| `--z-overlay` | `50` | Overlay backgrounds | Semi-transparent backdrop behind modals |
| `--z-modal` | `50` | Modal dialogs | Radix Dialog (via portal, stacks above overlay) |
| `--z-popover` | `50` | Popovers, tooltips | Radix Popover, Tooltip (via portal) |
| `--z-toast` | `100` | Toast notifications | Always on top, above everything |

### Why Many Values Are 50

Radix UI renders overlays (modals, popovers, dropdowns) in **portals** at the end of `<body>`. These naturally stack in DOM order, so they don't need distinct z-index values to layer correctly relative to each other. The `z-50` value simply ensures they appear above regular page content and the sticky header.

Toasts are `z-100` to ensure they are **never** obscured by any other UI element, including open modals.

### CSS Custom Properties

```css
@layer base {
  :root {
    --z-base: 0;
    --z-raised: 10;
    --z-sticky: 40;
    --z-dropdown: 50;
    --z-overlay: 50;
    --z-modal: 50;
    --z-popover: 50;
    --z-toast: 100;
  }
}
```

### Stacking Context Rules

1. **Never use arbitrary z-index values.** Always reference the token scale.
2. **Avoid creating unnecessary stacking contexts.** `position: relative` + `z-index` creates a stacking context. Only add when required.
3. **Portals solve most layering issues.** Radix UI components render in portals, avoiding ancestor stacking context traps.
4. **Sticky header must not cover overlays.** At `z-40`, the header sits below dropdown/modal content at `z-50`.
5. **The toast layer is sacred.** Nothing except another toast should be at `z-100`.
