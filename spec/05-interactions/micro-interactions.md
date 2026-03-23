# Micro-Interactions

> Version: 1.0 | Last updated: 2026-03-20

Defines hover, focus, tap, and toggle micro-interactions across all interactive elements. Every interaction uses GPU-composited properties (`transform`, `opacity`) to guarantee 60 fps.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Global Motion Tokens](#2-global-motion-tokens)
3. [Button Interactions](#3-button-interactions)
4. [Card Interactions](#4-card-interactions)
5. [Input Focus](#5-input-focus)
6. [Toggle / Switch](#6-toggle--switch)
7. [Avatar Hover](#7-avatar-hover)
8. [Tag Chip](#8-tag-chip)
9. [Link Hover](#9-link-hover)
10. [Icon Button](#10-icon-button)
11. [Reduced Motion](#11-reduced-motion)
12. [Performance Guidelines](#12-performance-guidelines)

---

## 1. Design Principles

| Principle | Detail |
|---|---|
| **Warmth** | Interactions feel soft and organic — spring physics over linear easing |
| **Subtlety** | Maximum translate ≤ 5 px, maximum scale deviation ≤ 0.03 |
| **Speed** | Hover/focus feedback within 1 frame (< 16 ms response) |
| **Accessibility** | Every interaction has a `prefers-reduced-motion` fallback |
| **Composability** | Tokens are consumed via Framer Motion variants so components stay declarative |

---

## 2. Global Motion Tokens

Referenced from [../02-tokens/motion.md](../02-tokens/motion.md).

```ts
// lib/motion-tokens.ts

export const spring = {
  /** Primary spring used for hover/tap feedback */
  bounce: { type: "spring", stiffness: 400, damping: 15 } as const,
  /** Softer spring for layout shifts */
  soft: { type: "spring", stiffness: 300, damping: 25 } as const,
  /** Snappy spring for toggle slides */
  snappy: { type: "spring", stiffness: 500, damping: 30 } as const,
} as const;

export const duration = {
  instant: 0.1,   // 100 ms
  fast: 0.15,     // 150 ms
  normal: 0.25,   // 250 ms
  slow: 0.35,     // 350 ms
} as const;

export const easing = {
  easeOut: [0.0, 0.0, 0.2, 1],       // cubic-bezier(0, 0, 0.2, 1)
  easeInOut: [0.4, 0.0, 0.2, 1],     // cubic-bezier(0.4, 0, 0.2, 1)
  bounce: [0.34, 1.56, 0.64, 1],     // cubic-bezier(0.34, 1.56, 0.64, 1)
} as const;
```

---

## 3. Button Interactions

### 3.1 Hover — Bounce Scale

| Property | Value |
|---|---|
| `scale` | `1.03` |
| Transition | `spring.bounce` (stiffness 400, damping 15) |

### 3.2 Tap / Active

| Property | Value |
|---|---|
| `scale` | `0.97` |
| Transition | `spring.bounce` |

### 3.3 Focus Ring

| Property | Value |
|---|---|
| Ring width | `2px` |
| Ring color | `ring-primary` (`hsl(var(--ring))`) |
| Ring offset | `2px` (background-colored offset) |
| Transition | `box-shadow 150ms ease-out` |

> Focus ring uses `box-shadow` rather than `outline` to respect `border-radius`.

### 3.4 Reference Implementation

```tsx
import { motion } from "framer-motion";
import { spring } from "@/lib/motion-tokens";

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

export function AnimatedButton({ children, ...props }) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={spring.bounce}
      className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

### 3.5 Disabled State

No hover/tap animations. Cursor changes to `not-allowed`, opacity reduces to `0.5`.

---

## 4. Card Interactions

Applies to all card surfaces: event cards, member cards, club cards.

### 4.1 Hover — Lift

| Property | Rest | Hover |
|---|---|---|
| `y` | `0` | `-4px` to `-5px` (use `-4` for small cards, `-5` for large) |
| `box-shadow` | `shadow-soft-sm` | `shadow-soft-md` |
| `border-color` | `border` token | `primary/20` |
| Transition | — | `spring.soft` (stiffness 300, damping 25) |

Shadow tokens are defined in [../02-tokens/elevation.md](../02-tokens/elevation.md).

### 4.2 Reference Implementation

```tsx
const cardVariants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgba(120,80,50,0.08)",
  },
  hover: {
    y: -4,
    boxShadow: "0 8px 24px -4px rgba(120,80,50,0.12)",
  },
};

<motion.div
  variants={cardVariants}
  initial="rest"
  whileHover="hover"
  transition={spring.soft}
  className="rounded-2xl border border-border hover:border-primary/20 transition-colors duration-150"
>
  {/* card content */}
</motion.div>
```

### 4.3 Clickable Card

For cards that act as links, add `whileTap={{ scale: 0.985 }}` for press feedback.

---

## 5. Input Focus

### 5.1 Focus Ring

| Property | Value |
|---|---|
| Ring | `2px ring-primary` with `2px` offset |
| Scale | `1.005` (barely perceptible, adds life) |
| Transition | `150ms ease-out` |

### 5.2 Label Animation

Floating label pattern: on focus or when input has value, the label translates up and scales down.

| State | `y` | `scale` | `color` |
|---|---|---|---|
| Resting | `0` | `1` | `muted-foreground` |
| Active | `-24px` | `0.85` | `primary` |
| Transition | — | `spring.soft` | `150ms` |

### 5.3 Reference Implementation

```tsx
<motion.label
  animate={isFocused || hasValue ? "active" : "rest"}
  variants={{
    rest: { y: 0, scale: 1 },
    active: { y: -24, scale: 0.85 },
  }}
  transition={spring.soft}
  className="origin-left pointer-events-none text-muted-foreground data-[active]:text-primary"
>
  {label}
</motion.label>
```

---

## 6. Toggle / Switch

### 6.1 Thumb Slide

| Property | Off | On |
|---|---|---|
| `x` | `2px` | `22px` (for 44 px track) |
| `background` | `muted` | `primary-foreground` |
| Track `background` | `muted` | `primary` |
| Transition | `spring.snappy` (stiffness 500, damping 30) | — |

### 6.2 Reference Implementation

```tsx
<motion.div
  className="h-5 w-5 rounded-full bg-background shadow-sm"
  animate={{ x: checked ? 22 : 2 }}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
/>
```

---

## 7. Avatar Hover

Used on member cards, profile headers, and comment threads.

| Property | Rest | Hover |
|---|---|---|
| `border-color` | `transparent` | `primary` |
| `scale` | `1` | `1.05` |
| Transition | `duration.fast` (150 ms) | `ease-out` |

A tooltip appears after a 300 ms delay via Radix Tooltip with `sideOffset={8}`.

```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
  className="rounded-full border-2 border-transparent hover:border-primary transition-colors duration-150"
>
  <Avatar />
</motion.div>
```

---

## 8. Tag Chip

Toggle-able tags for event categories, skill tags, interest filters.

### 8.1 States

| State | `background` | `color` | `scale` |
|---|---|---|---|
| Unselected | `muted` | `muted-foreground` | `1` |
| Selected | `primary` | `primary-foreground` | `1` |
| Hover (unselected) | `muted` + slight tint | `foreground` | `1.03` |
| Tap | — | — | `0.95` |

### 8.2 Selection Animation

Background color cross-fades over `200ms ease-in-out`. A subtle check icon fades in with `opacity 0→1, scale 0.5→1` over `150ms`.

```tsx
<motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.95 }}
  animate={{
    backgroundColor: selected ? "hsl(var(--primary))" : "hsl(var(--muted))",
    color: selected ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
  }}
  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
  className="rounded-full px-3 py-1 text-sm font-medium"
>
  {selected && (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.15 }}
    >
      ✓{" "}
    </motion.span>
  )}
  {label}
</motion.button>
```

---

## 9. Link Hover

### 9.1 Underline Slide-in

The underline pseudo-element scales from `scaleX(0)` to `scaleX(1)` originating from the left.

| Property | Value |
|---|---|
| `transform-origin` | `left` |
| `scaleX` | `0 → 1` |
| Duration | `200ms` |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Color | `primary` |

### 9.2 CSS Implementation

```css
.link-underline {
  position: relative;
}
.link-underline::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: hsl(var(--primary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.link-underline:hover::after {
  transform: scaleX(1);
}
```

> CSS-only approach is preferred for links because Framer Motion's `whileHover` on inline elements can cause layout shifts.

---

## 10. Icon Button

Small icon-only buttons (close, menu, settings, etc.).

### 10.1 Hover / Tap

| Interaction | Property | Value |
|---|---|---|
| Hover | `scale` | `1.1` |
| Hover | `rotate` | `0°` (default) or `15°` for refresh icons |
| Tap | `scale` | `0.9` |
| Transition | — | `spring.bounce` |

### 10.2 Contextual Rotations

| Icon | Hover Rotate |
|---|---|
| Refresh / Sync | `90°` with `spring.bounce` |
| Settings / Gear | `45°` with `spring.soft` |
| Close (×) | `0°` (scale only) |
| Expand / Collapse | `180°` (chevron flip) |

```tsx
<motion.button
  whileHover={{ scale: 1.1, rotate: isGear ? 45 : 0 }}
  whileTap={{ scale: 0.9 }}
  transition={spring.bounce}
  className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-accent"
>
  <Icon className="h-4 w-4" />
</motion.button>
```

---

## 11. Reduced Motion

All animations **must** respect `prefers-reduced-motion: reduce`.

### 11.1 Strategy

```ts
// hooks/use-reduced-motion.ts
import { useReducedMotion } from "framer-motion";

export function useMotionSafe() {
  const shouldReduce = useReducedMotion();
  return {
    animate: shouldReduce ? false : undefined,
    transition: shouldReduce ? { duration: 0 } : undefined,
  };
}
```

### 11.2 Fallback Behavior

| Normal | Reduced Motion |
|---|---|
| Spring scale on hover | Instant color change only |
| Card lift + shadow | Shadow change only (no `y` translate) |
| Underline slide-in | Underline appears instantly |
| Toggle slide | Instant position change |
| Label float animation | Instant position change |

### 11.3 CSS Fallback

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Performance Guidelines

| Rule | Detail |
|---|---|
| **Animate only composited properties** | `transform` (`scale`, `translate`, `rotate`) and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`. |
| **Use `will-change` sparingly** | Only set on elements currently animating. Remove after animation ends. |
| **Avoid layout thrash** | Card shadows use `box-shadow` transitions — acceptable because they don't trigger layout. Use `filter: drop-shadow()` if shadow triggers repaints. |
| **Batch DOM reads/writes** | When measuring for layout animations, use `useLayoutEffect` or Framer Motion's `layout` prop. |
| **Limit concurrent animations** | No more than 8 simultaneous animating elements in viewport. Stagger lists to reduce GPU load. |

---

## Cross-References

- Motion tokens: [../02-tokens/motion.md](../02-tokens/motion.md)
- Elevation / shadow tokens: [../02-tokens/elevation.md](../02-tokens/elevation.md)
- Color tokens: [../02-tokens/colors.md](../02-tokens/colors.md)
- Page transitions: [./page-transitions.md](./page-transitions.md)
- Loading choreography: [./loading-choreography.md](./loading-choreography.md)
- Feedback animations: [./feedback-animations.md](./feedback-animations.md)
- Button component: [../03-components/input/button.md](../03-components/input/button.md)
- Card component: [../03-components/data-display/card.md](../03-components/data-display/card.md)
