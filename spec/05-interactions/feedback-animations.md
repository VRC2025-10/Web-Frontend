# Feedback Animations

> Version: 1.0 | Last updated: 2026-03-20

Defines all user feedback animations — success, error, progress, and confirmation patterns. Every feedback animation reinforces the Autumn Soft theme's warm, reassuring character while maintaining clarity and accessibility.

---

## Table of Contents

1. [Feedback Principles](#1-feedback-principles)
2. [Toast System](#2-toast-system)
3. [Success Feedback](#3-success-feedback)
4. [Error Feedback](#4-error-feedback)
5. [Progress Indicators](#5-progress-indicators)
6. [Form Validation](#6-form-validation)
7. [Optimistic Updates](#7-optimistic-updates)
8. [Domain-Specific Feedback](#8-domain-specific-feedback)
9. [Dialog Animations](#9-dialog-animations)
10. [Reduced Motion](#10-reduced-motion)

---

## 1. Feedback Principles

| Principle | Detail |
|---|---|
| **Immediate** | Feedback appears within 100 ms of user action |
| **Proportional** | Small actions get subtle feedback; critical actions get prominent feedback |
| **Accessible** | All feedback is communicated via ARIA live regions, not animation alone |
| **Dismissible** | Toasts auto-dismiss but can be manually dismissed or paused |
| **Non-blocking** | Feedback overlays do not prevent continued interaction (except modal confirmations) |

---

## 2. Toast System

Toasts provide non-blocking feedback for completed actions. Positioned in the **top-right** corner of the viewport.

### 2.1 Animation Parameters

| Phase | Property | Value |
|---|---|---|
| **Entrance** | `x` | `100% → 0` (slide in from right) |
| | `opacity` | `0 → 1` |
| | Duration | `300ms` |
| | Easing | `cubic-bezier(0, 0, 0.2, 1)` |
| **Idle** | Auto-dismiss | `5000ms` (5 seconds) |
| | Pause | On hover / focus |
| | Progress bar | Thin bottom bar shrinking from right to left |
| **Exit** | `x` | `0 → 100%` |
| | `opacity` | `1 → 0` |
| | Duration | `200ms` |
| | Easing | `cubic-bezier(0.4, 0, 1, 1)` |

### 2.2 Toast Variants

| Variant | Icon | Border Accent | Background |
|---|---|---|---|
| `success` | Animated checkmark | `border-l-4 border-green-600` | `bg-card` |
| `error` | Alert circle | `border-l-4 border-destructive` | `bg-card` |
| `info` | Info circle | `border-l-4 border-primary` | `bg-card` |
| `warning` | Alert triangle | `border-l-4 border-yellow-600` | `bg-card` |

### 2.3 Reference Implementation

```tsx
import { motion, AnimatePresence } from "framer-motion";

const toastVariants = {
  initial: { x: "100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

export function ToastContainer({ toasts }) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-80 rounded-xl border bg-card p-4 shadow-soft-md"
            role="status"
            aria-live="polite"
          >
            {/* Toast content */}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### 2.4 Stacking

| Token | Value |
|---|---|
| Max visible toasts | `3` |
| Gap between toasts | `12px` (`gap-3`) |
| Overflow behavior | Oldest toast dismissed, new toast added at bottom |
| Layout animation | `layout` prop on each toast (Framer Motion) for smooth reflow |

### 2.5 Auto-Dismiss Timer

```tsx
export function useToastTimer(id: string, duration = 5000) {
  const [paused, setPaused] = useState(false);
  const { dismiss } = useToast();

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, paused, dismiss]);

  return {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };
}
```

---

## 3. Success Feedback

### 3.1 Checkmark Icon Animation

An animated SVG checkmark that draws in after a successful action.

| Property | Value |
|---|---|
| Stroke dasharray | Full path length |
| Stroke dashoffset | Path length → `0` |
| Duration | `400ms` |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` |
| Delay | `100ms` (after toast entrance) |

```tsx
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: [0, 0, 0.2, 1], delay: 0.1 },
      opacity: { duration: 0.1 },
    },
  },
};

export function AnimatedCheckmark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-600">
      <motion.path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={checkmarkVariants}
        initial="hidden"
        animate="visible"
      />
    </svg>
  );
}
```

### 3.2 Success Toast Composition

```
┌──────────────────────────────────┐
│ ✓  Profile updated successfully  │
│    border-l-4 border-green-600   │
│    ▬▬▬▬▬▬▬▬▬▬▬▬░░░░ progress    │
└──────────────────────────────────┘
```

---

## 4. Error Feedback

### 4.1 Form Field Shake

Applied to input fields with validation errors on submit.

| Property | Value |
|---|---|
| Keyframes `x` | `[0, -8, 8, -4, 4, 0]` |
| Duration | `400ms` |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |

```tsx
const shakeVariants = {
  shake: {
    x: [0, -8, 8, -4, 4, 0],
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

<motion.div
  animate={hasError ? "shake" : undefined}
  variants={shakeVariants}
>
  <Input aria-invalid={hasError} aria-describedby={hasError ? `${id}-error` : undefined} />
</motion.div>
```

### 4.2 Destructive Alert

Full-width alert bar for critical errors (API failures, session expiration).

| Property | Value |
|---|---|
| Entrance | `opacity 0→1`, `y -8→0` |
| Duration | `250ms` |
| Background | `hsl(var(--destructive) / 0.1)` |
| Border | `border-destructive` |
| Icon | Alert circle, `text-destructive` |

```tsx
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
  className="rounded-xl border border-destructive bg-destructive/10 p-4"
  role="alert"
>
  <AlertCircle className="h-4 w-4 text-destructive" />
  <p>{message}</p>
</motion.div>
```

---

## 5. Progress Indicators

### 5.1 Upload Progress Bar

A smooth determinate progress bar for file uploads (event images, profile avatars).

| Property | Value |
|---|---|
| Height | `4px` |
| Border radius | `rounded-full` |
| Track | `bg-muted` |
| Fill | `bg-primary` |
| Transition | `width` via `spring.soft` (stiffness 300, damping 25) |
| Completion | Fill pulses once (`opacity 1→0.7→1` over `300ms`) then bar fades out |

```tsx
<div className="h-1 w-full overflow-hidden rounded-full bg-muted">
  <motion.div
    className="h-full rounded-full bg-primary"
    initial={{ width: "0%" }}
    animate={{ width: `${progress}%` }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
  />
</div>
```

### 5.2 Indeterminate Progress

For operations with unknown duration (API calls), use the leaf spinner. See [./page-transitions.md](./page-transitions.md#32-leaf-spinner).

---

## 6. Form Validation

### 6.1 Inline Error Message

Error messages fade in below the invalid field.

| Property | Value |
|---|---|
| `opacity` | `0 → 1` |
| `y` | `-4px → 0` |
| `height` | `0 → auto` (via `AnimatePresence` + `motion.div`) |
| Duration | `200ms` |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` |

```tsx
<AnimatePresence>
  {error && (
    <motion.p
      id={`${fieldId}-error`}
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className="mt-1 text-sm text-destructive"
      role="alert"
    >
      {error}
    </motion.p>
  )}
</AnimatePresence>
```

### 6.2 Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Error announced to screen readers | `role="alert"` on error message |
| Field linked to error | `aria-describedby={fieldId + "-error"}` |
| Invalid state announced | `aria-invalid="true"` on the input |
| Focus management | On submit with errors, focus moves to first invalid field |

### 6.3 Real-Time vs Submit Validation

| Timing | Fields | Behavior |
|---|---|---|
| On blur | Email, password, URL fields | Validate after the user leaves the field |
| On change (debounced 300 ms) | Username (uniqueness check) | Show inline result |
| On submit | All other fields | Shake + inline errors |

---

## 7. Optimistic Updates

### 7.1 Pattern

When a mutation is expected to succeed (e.g., toggling event attendance), update the UI immediately and revert on failure.

```
User action
  ↓ instant
Optimistic UI update (no loading state)
  ↓ server responds
Success → no further action (UI already correct)
Error → revert UI + show error toast
```

### 7.2 Visual Indicators

| Action | Optimistic State | Revert on Error |
|---|---|---|
| RSVP to event | Button fills immediately, count increments | Button reverts, count decrements, error toast |
| Like/favorite | Heart fills with scale pulse (`1→1.2→1`, 200 ms) | Heart reverts |
| Toggle role | Badge color changes immediately | Badge reverts, error toast |
| Edit profile field | New value shown immediately | Old value restored, field shakes |

### 7.3 Implementation with `useOptimistic`

```tsx
import { useOptimistic } from "react";

const [optimisticRsvp, setOptimisticRsvp] = useOptimistic(
  isAttending,
  (_, newState: boolean) => newState
);

async function handleRsvp() {
  setOptimisticRsvp(!optimisticRsvp);
  const result = await toggleRsvp(eventId);
  if (!result.success) {
    toast.error("Failed to update RSVP. Please try again.");
  }
}
```

---

## 8. Domain-Specific Feedback

### 8.1 Report Submission Confirmation

After submitting a user/content report:

| Step | Visual |
|---|---|
| Submit | Button loading state |
| Success | Modal content cross-fades to confirmation message (opacity swap, 200 ms) |
| Confirmation | Checkmark icon + "Report submitted" + "We'll review within 24 hours" |
| Dismiss | Modal exit animation (see [Dialog Animations](#9-dialog-animations)) |

### 8.2 Login Redirect

| Step | Visual |
|---|---|
| Login success | Button shows checkmark briefly (500 ms) |
| Redirect | Full-page fade to white/ivory (`opacity 0→1` over `200ms`) then navigate |
| Target page | Normal page load with skeleton → content |

```tsx
// After successful login
await new Promise((r) => setTimeout(r, 500)); // Show checkmark
router.push(callbackUrl ?? "/");
```

### 8.3 Role Change Success

When an admin changes a user's role:

| Step | Visual |
|---|---|
| Action | Dropdown closes |
| Feedback | Row highlights briefly (`bg-primary/5` pulse for `1s`) |
| Toast | "Role updated to {role}" success toast |
| Badge | Badge color transitions smoothly (`200ms ease-in-out`) |

```tsx
const rowHighlight = {
  highlight: {
    backgroundColor: [
      "hsl(var(--primary) / 0)",
      "hsl(var(--primary) / 0.05)",
      "hsl(var(--primary) / 0)",
    ],
    transition: { duration: 1, ease: "easeInOut" },
  },
};
```

### 8.4 Image Upload with Preview

| Step | Visual |
|---|---|
| File selected | Thumbnail preview fades in (`opacity 0→1, scale 0.95→1`, 200 ms) |
| Uploading | Progress bar below thumbnail (see [Section 5.1](#51-upload-progress-bar)) |
| Complete | Progress bar fades out, checkmark overlay on thumbnail |
| Error | Progress bar turns `destructive`, error message below |

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
  className="relative overflow-hidden rounded-xl"
>
  <img src={previewUrl} alt="Upload preview" className="aspect-square object-cover" />
  {uploading && <ProgressBar progress={uploadProgress} />}
  {uploaded && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-black/20"
    >
      <AnimatedCheckmark />
    </motion.div>
  )}
</motion.div>
```

---

## 9. Dialog Animations

### 9.1 Overlay (Backdrop)

| Property | Value |
|---|---|
| `opacity` | `0 → 1` |
| `background` | `black / 0.4` |
| `backdrop-filter` | `blur(4px)` |
| Duration | `200ms` |
| Easing | `ease-out` |

### 9.2 Dialog Panel

| Property | Enter | Exit |
|---|---|---|
| `opacity` | `0 → 1` | `1 → 0` |
| `scale` | `0.95 → 1` | `1 → 0.95` |
| `y` | `8px → 0` | `0 → 8px` |
| Duration | `250ms` | `150ms` |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` | `cubic-bezier(0.4, 0, 1, 1)` |

### 9.3 Reference Implementation

```tsx
<AnimatePresence>
  {open && (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{
          enter: { duration: 0.25, ease: [0, 0, 0.2, 1] },
          exit: { duration: 0.15, ease: [0.4, 0, 1, 1] },
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft-lg">
          {children}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 9.4 Delete Confirmation Dialog

Specific animation for destructive confirmations:

| Element | Detail |
|---|---|
| Dialog | Standard dialog entrance |
| Warning icon | Scales in with bounce: `scale 0→1` via `spring.bounce` (stiffness 400, damping 15) |
| Destructive button | Subtle red glow pulse on hover (`box-shadow` transition) |
| Cancel | Standard button hover interactions |

---

## 10. Reduced Motion

### 10.1 Fallback Table

| Normal Behavior | Reduced Motion |
|---|---|
| Toast slide-in (300 ms) | Toast appears instantly (`opacity` only, 100 ms) |
| Toast slide-out (200 ms) | Toast disappears instantly |
| Shake animation (400 ms) | No shake — red border + focus on field |
| Checkmark draw (400 ms) | Static checkmark icon, no path animation |
| Progress bar spring | Linear `width` transition |
| Dialog scale + slide | Instant display (`opacity` only, 100 ms) |
| Row highlight pulse | Static highlight then fade |
| Image preview scale | Instant display |

### 10.2 Implementation

```tsx
import { useReducedMotion } from "framer-motion";

export function useFeedbackVariants() {
  const reduced = useReducedMotion();

  return {
    toast: reduced
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.1 } },
          exit: { opacity: 0, transition: { duration: 0.05 } },
        }
      : {
          initial: { x: "100%", opacity: 0 },
          animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
          exit: { x: "100%", opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
        },
    dialog: reduced
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.1 } },
          exit: { opacity: 0, transition: { duration: 0.05 } },
        }
      : {
          initial: { opacity: 0, scale: 0.95, y: 8 },
          animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0, 0, 0.2, 1] } },
          exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
        },
    shake: reduced
      ? {} // No shake — handled via CSS border color only
      : {
          shake: { x: [0, -8, 8, -4, 4, 0], transition: { duration: 0.4 } },
        },
  };
}
```

### 10.3 ARIA Announcements

All feedback that relies on animation for meaning **must** have an equivalent ARIA announcement:

| Feedback | ARIA |
|---|---|
| Toast | `role="status"` + `aria-live="polite"` |
| Form error | `role="alert"` + `aria-describedby` link |
| Destructive alert | `role="alert"` |
| Progress | `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` |
| Dialog | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` |

---

## Cross-References

- Motion tokens: [../02-tokens/motion.md](../02-tokens/motion.md)
- Color tokens (destructive, primary): [../02-tokens/colors.md](../02-tokens/colors.md)
- Elevation / shadow tokens: [../02-tokens/elevation.md](../02-tokens/elevation.md)
- Micro-interactions: [./micro-interactions.md](./micro-interactions.md)
- Page transitions: [./page-transitions.md](./page-transitions.md)
- Loading choreography: [./loading-choreography.md](./loading-choreography.md)
- Toast component: [../03-components/feedback/toast.md](../03-components/feedback/toast.md)
- Alert component: [../03-components/feedback/alert.md](../03-components/feedback/alert.md)
- Dialog component: [../03-components/overlay/dialog.md](../03-components/overlay/dialog.md)
- Button component: [../03-components/input/button.md](../03-components/input/button.md)
- Form patterns: [../06-patterns/](../06-patterns/)
