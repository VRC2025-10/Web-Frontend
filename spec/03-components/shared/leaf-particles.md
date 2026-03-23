# LeafParticles

> Decorative floating leaf animation for hero sections and splash pages

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Add a gentle, ambient floating-leaf animation to reinforce the "Autumn Soft" visual identity |
| **File Path** | `components/shared/leaf-particles.tsx` |
| **Component Type** | Client Component (`"use client"`) |
| **Used In** | Hero section (home page), Login page left panel |
| **Nature** | Purely decorative — NOT interactive |
| **When to Use** | Large visual sections where ambient decoration enhances the mood |
| **When NOT to Use** | Content-heavy areas, data tables, forms, admin pages, anywhere it would distract from primary content |

---

## 2. Props / API

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `count` | `number` | `5` | No | Number of leaf elements to render (3–5 recommended) |
| `className` | `string` | `""` | No | Additional classes for the container |

### Internal Leaf Configuration

```ts
type LeafConfig = {
  x: string;       // CSS left position (e.g., "10%", "80%")
  y: string;       // CSS top position (e.g., "20%", "60%")
  scale: number;   // 0.5 – 1.5
  rotation: number; // max rotation degrees (e.g., 15, -20)
};

// Generated deterministically from index to avoid hydration mismatch
const leaves: LeafConfig[] = useMemo(() =>
  Array.from({ length: count }, (_, i) => ({
    x: `${15 + i * 18}%`,
    y: `${10 + ((i * 37) % 60)}%`,
    scale: 0.6 + (i % 3) * 0.3,
    rotation: 10 + i * 5,
  })),
  [count]
);
```

---

## 3. Visual Structure

```
<div
  className="absolute inset-0 overflow-hidden pointer-events-none"
  aria-hidden="true"
>
│
├─ {leaves.map((leaf, i) => (
│    <motion.div
│      key={i}
│      className="absolute text-primary/20 dark:text-primary/10"
│      style={{ left: leaf.x, top: leaf.y }}
│      animate={{
│        y: [0, -20, 0],
│        rotate: [0, leaf.rotation, -leaf.rotation / 2, 0],
│      }}
│      transition={{
│        duration: 8 + i * 2,
│        repeat: Infinity,
│        ease: "easeInOut",
│      }}
│    >
│      <LeafSvg
│        className="w-8 h-8"
│        style={{ transform: `scale(${leaf.scale})` }}
│      />
│    </motion.div>
│  ))}
```

### LeafSvg Variants

3–5 custom SVG leaf shapes for visual variety:

| Variant | Shape | Usage |
|---|---|---|
| `leaf-1` | Simple oval leaf with stem | Default, most common |
| `leaf-2` | Maple-like silhouette | Accent variation |
| `leaf-3` | Small round leaf | Subtle background fill |
| `leaf-4` | Elongated willow leaf | Optional, for 4+ count |
| `leaf-5` | Ginkgo-like fan shape | Optional, for 5 count |

Each leaf instance uses `leaves[i % leafVariants.length]` to cycle through variants.

---

## 4. Variant × State Matrix

| State | Visual | Behavior |
|---|---|---|
| Default | Leaves floating with gentle animation | Continuous loop |
| Reduced motion | Completely hidden | `display: none` or not rendered |
| Container hidden | Not visible | Animations paused (not running in background) |

### Media Query: Reduced Motion

```tsx
const prefersReducedMotion = useReducedMotion(); // Framer Motion hook

if (prefersReducedMotion) return null;
```

When `prefers-reduced-motion: reduce` is active, the component renders **nothing** — not even static leaves.

---

## 5. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile (`< md`) | Reduce count to 3, smaller scale (0.5–0.8) |
| Tablet (`md`) | Default count (5), standard scale |
| Desktop (`lg+`) | Default count (5), standard scale |

### Mobile Adjustments

- Fewer leaves to reduce visual noise on small screens
- Smaller leaf sizes to maintain proportion
- Same animation timing (no performance difference with fewer elements)

### Container Relationship

The component uses `absolute inset-0` and relies on its parent having `position: relative` and appropriate sizing:

```tsx
<section className="relative overflow-hidden min-h-[60vh]">
  <LeafParticles />
  {/* Hero content */}
</section>
```

---

## 6. Accessibility

### ARIA

- Container: `aria-hidden="true"` — entire component hidden from assistive technology
- All SVGs: inherit `aria-hidden` from container
- No interactive elements: `pointer-events-none` on container

### Keyboard

- No keyboard interaction — component is not focusable
- `pointer-events-none` ensures Tab order is unaffected

### Screen Reader

- Completely invisible to screen readers via `aria-hidden="true"`
- No announcements, no content contribution

### Focus Management

- No focus targets — decorative only
- Does not interfere with any focus flows

---

## 7. Animation

### Per-Leaf Animation

```tsx
<motion.div
  animate={{
    y: [0, -20, 0],                                    // gentle vertical float
    rotate: [0, leaf.rotation, -leaf.rotation / 2, 0],  // subtle rotation
  }}
  transition={{
    duration: 8 + i * 2,   // 8–18 seconds per cycle (staggered)
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

### Animation Characteristics

| Property | Value | Notes |
|---|---|---|
| Y movement | `[0, -20, 0]` px | Gentle floating up and back |
| Rotation | `[0, +deg, -deg/2, 0]` | Subtle rocking motion |
| Duration | 8–18 seconds (staggered by index) | Slow, ambient feel |
| Repeat | Infinity | Continuous loop |
| Ease | `easeInOut` | Smooth, organic movement |

### Performance Optimization

- `pointer-events-none`: no hit testing overhead
- `will-change: transform` on animated elements (implied by Framer Motion)
- GPU-composited: only animating `transform` (translate + rotate) — no layout or paint triggers
- No `opacity` animation in the loop (only transform)
- 3–5 elements maximum: minimal DOM overhead

### Reduced Motion

```tsx
const prefersReducedMotion = useReducedMotion();
if (prefersReducedMotion) return null;
```

Complete removal — no fallback static display.

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Leaf color | `text-primary/20` (coral at 20% opacity) | `text-primary/10` (coral at 10% opacity) |
| Background | Transparent (parent controls) | Transparent |

Dark mode reduces leaf opacity from 20% to 10% to maintain subtlety against dark backgrounds. No structural or animation changes.

### Implementation

```tsx
<motion.div
  className="absolute text-primary/20 dark:text-primary/10"
  // ...
>
```
