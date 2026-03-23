# Motion & Animation System

Duration scale, easing curves, animation catalogue, reduced motion, and performance rules for the Autumn Soft theme.

---

## Core Principle

> **"Rich but purposeful."** Framer Motion is fully leveraged. Every animation has a reason — **delight**, **feedback**, **orientation**, or **hierarchy**. Never animate for animation's sake.

Animation in Autumn Soft reinforces the warm, café-like atmosphere. Movements are soft, slightly bouncy, and organic — like leaves drifting, not like machine snapping. However, admin pages prioritize efficiency over delight and use minimal animation.

---

## Duration Scale

| Token | Value | CSS Variable | Use Case |
|---|---|---|---|
| `--duration-instant` | 100ms | `--duration-instant: 100ms` | Checkbox toggle, switch state, color change on active |
| `--duration-fast` | 150ms | `--duration-fast: 150ms` | Hover color transitions, focus ring appearance, tooltip show |
| `--duration-normal` | 250ms | `--duration-normal: 250ms` | Standard fade in/out, dropdown open, tab switch |
| `--duration-slow` | 400ms | `--duration-slow: 400ms` | Page section entrance, modal open/close, sheet slide |
| `--duration-slower` | 600ms | `--duration-slower: 600ms` | Hero animations, complex stagger sequences, page transitions |

### Duration Guidelines

- **Hover effects:** Always `fast` (150ms). Users expect immediate feedback.
- **Entrance animations:** `normal` (250ms) to `slow` (400ms). Fast enough to not feel sluggish, slow enough to be noticed.
- **Exit animations:** Generally 20–30% shorter than entrance. A modal that enters at 400ms should exit at ~300ms.
- **Stagger delays:** 50ms between children in a list. Longer stagger (80-100ms) only for hero sequences.

### CSS Custom Properties

```css
@layer base {
  :root {
    --duration-instant: 100ms;
    --duration-fast: 150ms;
    --duration-normal: 250ms;
    --duration-slow: 400ms;
    --duration-slower: 600ms;
  }
}
```

---

## Easing Curves

| Token | Value | Type | Use Case |
|---|---|---|---|
| `--ease-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | CSS | General-purpose transitions |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | CSS | Exit animations (element leaving the screen) |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | CSS | Entrance animations (element appearing) |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | CSS | Symmetric transitions (color change, resize) |
| `--ease-spring` | `type: "spring", stiffness: 400, damping: 15` | Framer Motion | Bouncy interactions — card hover, button press |
| `--ease-gentle` | `type: "spring", stiffness: 200, damping: 20` | Framer Motion | Gentle float — hero particles, soft entrances |

### Easing Selection Rules

- **CSS transitions** (hover, focus, color): Use `--ease-default` or `--ease-in-out`.
- **Framer Motion entrances**: Use `--ease-out` (CSS) or `--ease-gentle` (spring).
- **Framer Motion interactive** (hover scale, tap): Use `--ease-spring` for snappy bounce.
- **Framer Motion exits**: Use `--ease-in` or let Framer Motion's `AnimatePresence` handle it.

### CSS Custom Properties

```css
@layer base {
  :root {
    --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
```

### Framer Motion Transition Presets

```ts
// lib/motion.ts — Shared transition presets

export const springSnappy = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
};

export const springGentle = {
  type: "spring" as const,
  stiffness: 200,
  damping: 20,
};

export const easeOut = {
  duration: 0.4,
  ease: [0, 0, 0.2, 1] as const,
};

export const easeInOut = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const,
};
```

---

## Standard Animation Catalogue

All named animations used in the application, with complete Framer Motion configuration.

### 1. bounceHover

| Property | Value |
|---|---|
| **Trigger** | Mouse hover / tap on interactive card or button |
| **Effect** | Slight scale-up on hover, scale-down on tap |
| **Framer Config** | `whileHover={{ scale: 1.03 }}` `whileTap={{ scale: 0.97 }}` `transition={{ type: "spring", stiffness: 400, damping: 15 }}` |
| **Use Case** | EventCard, ClubCard, gallery thumbnails, CTA buttons |
| **Duration** | Spring-driven (no fixed duration) |

```tsx
<motion.div
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
>
  <Card>...</Card>
</motion.div>
```

### 2. fadeInUp

| Property | Value |
|---|---|
| **Trigger** | Element enters the viewport or component mounts |
| **Effect** | Fades in while sliding up 20px |
| **Framer Config** | `initial={{ opacity: 0, y: 20 }}` `animate={{ opacity: 1, y: 0 }}` `transition={{ duration: 0.4, ease: "easeOut" }}` |
| **Use Case** | Section content, list items, card grid children |
| **Duration** | 400ms |

```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Usage
<motion.div {...fadeInUp}>
  <SectionContent />
</motion.div>
```

### 3. staggerChildren

| Property | Value |
|---|---|
| **Trigger** | Parent container enters viewport |
| **Effect** | Children animate in sequence with 50ms delay between each |
| **Framer Config** | Parent: `variants={{ show: { transition: { staggerChildren: 0.05 } } }}` Children: use `fadeInUp` variants |
| **Use Case** | Card grids, list pages, member directories |
| **Stagger Delay** | 50ms |

```tsx
const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Usage
<motion.div variants={staggerContainer} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItem}>
      <Card {...item} />
    </motion.div>
  ))}
</motion.div>
```

### 4. slideIn

| Property | Value |
|---|---|
| **Trigger** | Sheet / side panel opens |
| **Effect** | Slides in from the right edge |
| **Framer Config** | `initial={{ x: "100%" }}` `animate={{ x: 0 }}` `exit={{ x: "100%" }}` `transition={{ type: "spring", damping: 25, stiffness: 300 }}` |
| **Use Case** | Mobile navigation Sheet, admin mobile sidebar |
| **Duration** | Spring-driven |

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-80 bg-background shadow-xl"
    >
      <SheetContent />
    </motion.div>
  )}
</AnimatePresence>
```

### 5. spinLeaf

| Property | Value |
|---|---|
| **Trigger** | Loading state active |
| **Effect** | Leaf icon rotates continuously |
| **Framer Config** | `animate={{ rotate: 360 }}` `transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}` |
| **Use Case** | Page loading spinner, inline loading indicators |
| **Duration** | 1.5s per rotation, infinite |

```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
  className="inline-flex items-center justify-center"
>
  <Leaf className="h-6 w-6 text-primary" />
</motion.div>
```

### 6. heroParticle

| Property | Value |
|---|---|
| **Trigger** | Hero section mounts (home page, login background) |
| **Effect** | 3-5 SVG leaf icons float gently with vertical bobbing and slight rotation |
| **Framer Config** | Each leaf: `animate={{ y: [0, -20, 0], rotate: [0, 10, -5, 0], opacity: [0.3, 0.6, 0.3] }}` `transition={{ repeat: Infinity, duration: 8-12s (randomized per leaf), ease: "easeInOut" }}` |
| **Use Case** | Home hero background, login page background ambience |
| **Duration** | 8–12s per cycle (varies per particle), infinite |

```tsx
const leafParticles = [
  { x: "10%", y: "20%", duration: 8, delay: 0, size: 24 },
  { x: "70%", y: "40%", duration: 10, delay: 1.5, size: 18 },
  { x: "40%", y: "60%", duration: 12, delay: 0.8, size: 20 },
  { x: "85%", y: "15%", duration: 9, delay: 2.2, size: 16 },
  { x: "25%", y: "75%", duration: 11, delay: 3.0, size: 22 },
];

{leafParticles.map((leaf, i) => (
  <motion.div
    key={i}
    className="absolute text-primary/20"
    style={{ left: leaf.x, top: leaf.y }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -5, 0],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      repeat: Infinity,
      duration: leaf.duration,
      delay: leaf.delay,
      ease: "easeInOut",
    }}
  >
    <Leaf style={{ width: leaf.size, height: leaf.size }} />
  </motion.div>
))}
```

### 7. scaleIn

| Property | Value |
|---|---|
| **Trigger** | Dialog / modal opens |
| **Effect** | Scales up slightly from 95% with fade |
| **Framer Config** | `initial={{ opacity: 0, scale: 0.95 }}` `animate={{ opacity: 1, scale: 1 }}` `exit={{ opacity: 0, scale: 0.95 }}` `transition={{ duration: 0.2 }}` |
| **Use Case** | Radix Dialog content, confirmation modals, popovers |
| **Duration** | 200ms |

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl shadow-lg p-8"
    >
      <DialogContent />
    </motion.div>
  )}
</AnimatePresence>
```

### 8. cardLift

| Property | Value |
|---|---|
| **Trigger** | Card hover |
| **Effect** | Shadow transitions from `shadow-sm` to `shadow-md` |
| **Implementation** | Pure CSS transition (Tailwind), no Framer Motion needed |
| **Classes** | `shadow-sm hover:shadow-md transition-shadow duration-300` |
| **Use Case** | EventCard, ClubCard, any card with interactive behavior |
| **Duration** | 300ms |

```tsx
<div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
  <CardContent />
</div>
```

### Animation Summary Table

| Name | Type | Trigger | Duration | Engine | Pages |
|---|---|---|---|---|---|
| bounceHover | Interactive | hover/tap | Spring | Framer Motion | Public pages |
| fadeInUp | Entrance | viewport/mount | 400ms | Framer Motion | All pages |
| staggerChildren | Entrance | viewport/mount | 50ms stagger | Framer Motion | List/grid pages |
| slideIn | Entrance | panel open | Spring | Framer Motion | Mobile nav |
| spinLeaf | Loading | loading state | 1.5s loop | Framer Motion | Global |
| heroParticle | Ambient | mount | 8-12s loop | Framer Motion | Home, Login |
| scaleIn | Entrance | dialog open | 200ms | Framer Motion | Dialogs |
| cardLift | Interactive | hover | 300ms | CSS | All cards |

---

## Reduced Motion

Users who prefer reduced motion (via OS accessibility settings) must have a fully functional experience without animation. This is a WCAG 2.1 SC 2.3.3 requirement.

### CSS Global Override

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Framer Motion Integration

```tsx
// hooks/useMotionSafe.ts
import { useReducedMotion } from "framer-motion";

/**
 * Returns animation props only if the user has not requested reduced motion.
 * If reduced motion is preferred, returns the "animate" state directly as initial
 * so that the final visual state is shown without animation.
 */
export function useMotionSafe<T extends Record<string, unknown>>(
  animationProps: {
    initial: T;
    animate: T;
    transition?: Record<string, unknown>;
  }
) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      initial: animationProps.animate, // Skip directly to end state
      animate: animationProps.animate,
      transition: { duration: 0 },
    };
  }

  return animationProps;
}
```

### Per-Animation Reduced Motion Behavior

| Animation | Reduced Motion Behavior |
|---|---|
| bounceHover | Disabled entirely. No scale change on hover. |
| fadeInUp | Elements appear immediately at final position (opacity: 1, y: 0). |
| staggerChildren | All children appear simultaneously, no stagger delay. |
| slideIn | Sheet appears immediately at final position (x: 0). |
| spinLeaf | Static leaf icon, no rotation. Show a text "Loading..." instead. |
| heroParticle | Particles rendered at static positions, no floating. Opacity fixed at 0.4. |
| scaleIn | Dialog appears immediately at full size and opacity. |
| cardLift | Shadow still changes on hover (CSS transition still effectively instant). |

---

## Performance Rules

### The Golden Rule

> Only animate **`transform`** and **`opacity`**. These properties are composited by the GPU and achieve 60fps without triggering layout or paint.

### Forbidden Properties to Animate

Never animate these properties — they trigger expensive layout/paint recalculations:

- ❌ `width`, `height` (triggers layout)
- ❌ `top`, `left`, `right`, `bottom` (triggers layout)
- ❌ `margin`, `padding` (triggers layout)
- ❌ `border-width` (triggers layout)
- ❌ `font-size` (triggers layout)
- ❌ `box-shadow` (triggers paint — except when used with `transition-shadow` which is acceptable for subtle hover effects)

**Exception:** `box-shadow` transitions are used for `cardLift` because the visual payoff is worth the minor paint cost, and it only triggers on hover (not scroll-driven).

### `will-change` Policy

```css
/* DO: Apply only to elements actively animating */
.animating-element {
  will-change: transform;
}

/* DON'T: Apply globally or to static elements */
* {
  will-change: transform; /* BAD — wastes GPU memory */
}
```

- Apply `will-change: transform` only during active animation.
- Remove after animation completes (Framer Motion handles this automatically).
- Never apply to more than 5-10 elements simultaneously.

### Layout Containment

For complex animated containers (hero section with particles, gallery with stagger):

```css
.animated-container {
  contain: layout style paint;
}
```

This prevents animations inside the container from triggering recalculations outside it.

### Code Splitting for Framer Motion

```tsx
// Only import Framer Motion on pages that need it
// pages that DON'T need Framer Motion: admin list views, static info pages

// Dynamic import for motion components
import dynamic from "next/dynamic";

const AnimatedHero = dynamic(
  () => import("@/components/home/AnimatedHero"),
  { ssr: false } // Particles don't need SSR
);
```

### Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| First animation frame | < 100ms after component mount | Chrome DevTools Performance |
| Animation frame rate | 60fps (16.67ms/frame) | Chrome DevTools Performance → Frames |
| Framer Motion bundle | < 30 KB gzipped | Build analysis |
| Total animation CPU usage | < 10% on idle page | Chrome DevTools Performance |

---

## Admin Panel Motion Policy

Admin pages prioritize **efficiency and clarity** over delight. Animation budget is strictly limited.

### Allowed in Admin

| Animation | Implementation | Notes |
|---|---|---|
| fadeInUp | Framer Motion | Page/section entrance only, not individual rows |
| CSS hover transitions | Tailwind `transition-colors duration-150` | Button/link hover color changes |
| CSS shadow transitions | Tailwind `transition-shadow duration-300` | Card hover lift |

### Forbidden in Admin

| Animation | Reason |
|---|---|
| bounceHover (scale) | Distracting in data-dense layouts |
| heroParticle | No hero sections in admin |
| spinLeaf (custom spinner) | Use simple CSS spinner or skeleton instead |
| staggerChildren | Delays content visibility; admins want instant data |
| Spring physics | Too playful for administrative context |

### Admin Loading States

Instead of animated spinners, admin pages use:
- **Skeleton screens** (`bg-muted animate-pulse rounded-lg`) for initial data loads
- **Inline spinners** (simple CSS rotation) for action feedback
- **Progress bars** for long operations (file uploads, batch actions)
