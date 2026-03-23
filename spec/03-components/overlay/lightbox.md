# Gallery Lightbox

> Full-screen image viewer with navigation for club photo galleries

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Display gallery images in a full-screen overlay with prev/next navigation |
| **File Path** | `components/features/clubs/lightbox.tsx` |
| **Component Type** | Client Component (`"use client"`) |
| **Dependencies** | Framer Motion (`AnimatePresence`, `motion`), Radix Dialog primitive (for a11y), `next/image` |
| **When to Use** | Club gallery image viewing, any grid-to-detail image expansion |
| **When NOT to Use** | Profile avatar viewing (simple modal), document/PDF viewing |

---

## 2. Props / API

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `images` | `{ src: string; alt?: string }[]` | — | Yes | Array of image objects |
| `initialIndex` | `number` | `0` | No | Index of the initially displayed image |
| `isOpen` | `boolean` | — | Yes | Controls lightbox visibility |
| `onClose` | `() => void` | — | Yes | Callback when lightbox is closed |

### Internal State

| State | Type | Description |
|---|---|---|
| `currentIndex` | `number` | Currently displayed image index |
| `direction` | `1 \| -1` | Navigation direction for animation |

---

## 3. Visual Structure

```
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm
                 flex items-center justify-center"
      role="dialog"
      aria-label="Image gallery viewer"
      aria-roledescription="carousel"
      aria-modal="true"
      onClick={onClose}>
    │
    ├─ <motion.div
    │    initial={{ scale: 0.9, opacity: 0 }}
    │    animate={{ scale: 1, opacity: 1 }}
    │    exit={{ scale: 0.9, opacity: 0 }}
    │    transition={{ duration: 0.2, ease: "easeOut" }}
    │    className="relative max-w-5xl max-h-[85vh] w-full mx-4"
    │    onClick={(e) => e.stopPropagation()}>
    │  │
    │  ├─ <AnimatePresence mode="wait" custom={direction}>
    │  │  └─ <motion.div
    │  │       key={currentIndex}
    │  │       custom={direction}
    │  │       initial={{ opacity: 0, x: direction * 50 }}
    │  │       animate={{ opacity: 1, x: 0 }}
    │  │       exit={{ opacity: 0, x: direction * -50 }}
    │  │       transition={{ duration: 0.25 }}>
    │  │     └─ <Image
    │  │          src={images[currentIndex].src}
    │  │          alt={images[currentIndex].alt || `Gallery image ${currentIndex + 1}`}
    │  │          className="rounded-xl object-contain max-h-[85vh] w-auto mx-auto"
    │  │          width={1200}
    │  │          height={800}
    │  │          priority
    │  │        />
    │  │
    │  ├─ [Close button]
    │  │  <Button variant="ghost" size="icon"
    │  │    className="absolute top-4 right-4 text-foreground/80 hover:text-foreground
    │  │              bg-background/50 backdrop-blur-sm rounded-full"
    │  │    onClick={onClose}
    │  │    aria-label="Close gallery">
    │  │    <X className="w-5 h-5" />
    │  │  </Button>
    │  │
    │  ├─ [Previous button]
    │  │  <Button variant="ghost" size="icon"
    │  │    className="absolute left-4 top-1/2 -translate-y-1/2
    │  │              bg-background/50 backdrop-blur-sm rounded-full"
    │  │    onClick={onPrev}
    │  │    aria-label="Previous image"
    │  │    disabled={currentIndex === 0}>
    │  │    <ChevronLeft className="w-6 h-6" />
    │  │  </Button>
    │  │
    │  └─ [Next button]
    │     <Button variant="ghost" size="icon"
    │       className="absolute right-4 top-1/2 -translate-y-1/2
    │                 bg-background/50 backdrop-blur-sm rounded-full"
    │       onClick={onNext}
    │       aria-label="Next image"
    │       disabled={currentIndex === images.length - 1}>
    │       <ChevronRight className="w-6 h-6" />
    │     </Button>
    │
    └─ <p className="absolute bottom-8 left-1/2 -translate-x-1/2
                     text-muted-foreground text-sm bg-background/50
                     backdrop-blur-sm rounded-full px-4 py-1"
          aria-live="polite">
         {currentIndex + 1} / {images.length}
       </p>
  </motion.div>
  )}
</AnimatePresence>
```

---

## 4. Variant × State Matrix

| State | Visual | Behavior |
|---|---|---|
| Closed | Not rendered | Gallery grid visible |
| Opening | Fade + scale animation | Focus trapped, scroll locked |
| Viewing image | Image displayed, nav buttons visible | Keyboard/click navigation |
| Navigating (prev/next) | Slide transition between images | Current index updates |
| First image | Previous button disabled/hidden | Only Next available |
| Last image | Next button disabled/hidden | Only Previous available |
| Single image | No prev/next buttons | Only close available |
| Closing | Reverse animation | Focus returns to trigger |

### Navigation Controls Visibility

| Condition | Previous | Next | Counter |
|---|---|---|---|
| Single image | Hidden | Hidden | Hidden |
| First image | Disabled (opacity-50) | Enabled | Shown |
| Middle image | Enabled | Enabled | Shown |
| Last image | Enabled | Disabled (opacity-50) | Shown |

---

## 5. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (`< md`) | Full-screen, `mx-2`, nav buttons at edges, swipe enabled |
| Tablet (`md`) | `max-w-5xl mx-4`, nav buttons visible |
| Desktop (`lg+`) | `max-w-5xl mx-4`, nav buttons visible |

### Mobile Adjustments

- Image takes full width minus small margin
- Nav buttons smaller: `w-10 h-10`
- Counter at bottom: smaller text
- **Touch swipe**: horizontal swipe detection for prev/next
  - Swipe threshold: 50px minimum horizontal distance
  - Vertical swipe ignored (no conflict with scroll)
- Close button always visible (no hover dependency)

### Body Scroll Lock

When lightbox is open:
```ts
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }
}, [isOpen]);
```

---

## 6. Accessibility

### ARIA

- Container: `role="dialog"`, `aria-modal="true"`, `aria-label="Image gallery viewer"`, `aria-roledescription="carousel"`
- Image: descriptive `alt` text if available, else `alt="Gallery image {index}"`
- Close button: `aria-label="Close gallery"`
- Previous button: `aria-label="Previous image"`
- Next button: `aria-label="Next image"`
- Counter: `aria-live="polite"` — announces "{current} / {total}" on navigation
- Disabled buttons: `aria-disabled="true"`

### Keyboard

- **Left Arrow**: Previous image
- **Right Arrow**: Next image
- **Escape**: Close lightbox
- **Tab**: Cycle through Close, Previous, Next buttons (focus trapped)
- **Home**: First image (optional enhancement)
- **End**: Last image (optional enhancement)

### Screen Reader

- On open: "Image gallery viewer" dialog announced
- On navigation: counter `aria-live="polite"` announces "3 / 12"
- Image alt text announced when image changes
- Close/nav buttons clearly labeled

### Focus Management

- On open: focus moves to Close button (first focusable in dialog)
- Focus trapped within lightbox (Close, Prev, Next buttons)
- On close: focus returns to the gallery thumbnail that triggered the lightbox
- Focus visible: standard `focus-visible:ring-2` on all buttons

---

## 7. Animation

### Lightbox Open

```tsx
// Backdrop
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
/>

// Image container
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
/>
```

### Image Navigation (slide)

```tsx
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentIndex}
    custom={direction}
    initial={{ opacity: 0, x: direction * 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction * -50 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
  />
</AnimatePresence>
```

### Preloading

```tsx
// Preload adjacent images for smooth navigation
useEffect(() => {
  const preload = (index: number) => {
    if (index >= 0 && index < images.length) {
      const img = new Image();
      img.src = images[index].src;
    }
  };
  preload(currentIndex + 1);
  preload(currentIndex - 1);
}, [currentIndex, images]);
```

### Reduced Motion

- Backdrop: instant opacity (no fade)
- Image container: instant show (no scale)
- Navigation: instant swap (no slide)
- Swipe gestures still functional (they are input, not animation)

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Backdrop | `bg-background/90` (warm ivory, 90% opacity) | `bg-background/90` (dark, 90% opacity) |
| Backdrop blur | `backdrop-blur-sm` | `backdrop-blur-sm` |
| Button backgrounds | `bg-background/50` (semi-transparent white) | `bg-background/50` (semi-transparent dark) |
| Button icons | `text-foreground/80` | `text-foreground/80` |
| Counter text | `text-muted-foreground` | `text-muted-foreground` |
| Counter bg | `bg-background/50` | `bg-background/50` |
| Image border-radius | `rounded-xl` | `rounded-xl` |

Dark mode actually benefits the lightbox — dark backdrop provides better image contrast. No structural changes.
