# Toast Notifications (Sonner)

> Application-wide toast notification system via shadcn/ui Sonner integration

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Provide non-blocking feedback for user actions (success, error, info, warning) |
| **Provider** | Sonner via shadcn/ui integration |
| **Configuration** | `<Toaster />` in root layout (`app/layout.tsx`) |
| **Trigger** | `toast()` / `toast.success()` / `toast.error()` from `sonner` |
| **When to Use** | After successful mutations, API errors, informational messages |
| **When NOT to Use** | Inline form validation (use `<FormMessage>`), critical errors requiring user action (use Alert), confirmation flows (use Dialog) |

---

## 2. Props / API

### Toaster Configuration (root layout)

```tsx
<Toaster
  position="bottom-right"
  toastOptions={{
    duration: 5000,
    className: "rounded-xl",
  }}
/>
```

### Toast Invocation

```ts
import { toast } from "sonner";

// Success
toast.success("Profile saved");

// Error
toast.error("Failed to save. Please try again.");

// Info
toast.info("Your session will expire in 5 minutes.");

// Warning
toast.warning("Approaching upload limit.");
```

### Variant Configuration

| Variant | Method | Icon | Color Accent | Use Case |
|---|---|---|---|---|
| Success | `toast.success()` | CheckCircle | Green accent | Profile saved, action completed |
| Error | `toast.error()` | AlertTriangle | Destructive (red) | API failure, server error |
| Info | `toast.info()` | Info | Primary (coral) | General information |
| Warning | `toast.warning()` | AlertTriangle | Secondary (mustard) | Approaching limits, soft warnings |

---

## 3. Visual Structure

```
<aside className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite">
│
├─ <div className="bg-card border border-border rounded-xl shadow-lg p-4
│               flex items-center gap-3 min-w-[320px] max-w-[420px]">
│  │
│  ├─ <Icon className="w-5 h-5 shrink-0 {variant-color}" aria-hidden="true" />
│  │    ── CheckCircle (success) / AlertTriangle (error/warning) / Info (info)
│  │
│  ├─ <div className="flex-1">
│  │  ├─ <p className="text-sm font-medium">{title}</p>
│  │  └─ {description && <p className="text-sm text-muted-foreground">{description}</p>}
│  │
│  └─ <button className="shrink-0 text-muted-foreground hover:text-foreground"
│             aria-label="Dismiss notification">
│       <X className="w-4 h-4" />
│     </button>
│
├─ ... (stacked toasts, max 3 visible)
```

---

## 4. Variant × State Matrix

| Variant | Icon | Icon Color | Border Accent | Background |
|---|---|---|---|---|
| Success | CheckCircle | `text-green-600 dark:text-green-400` | default border | `bg-card` |
| Error | AlertTriangle | `text-destructive` | default border | `bg-card` |
| Info | Info | `text-primary` | default border | `bg-card` |
| Warning | AlertTriangle | `text-amber-600 dark:text-amber-400` | default border | `bg-card` |

### Behavior States

| State | Behavior |
|---|---|
| Visible | Auto-dismiss after 5000ms |
| Hovered | Pause auto-dismiss timer |
| Focused | Pause auto-dismiss timer |
| Dismissed (button) | Immediate removal |
| Dismissed (timer) | Slide out + fade |
| Queue overflow (> 3) | Oldest toast dismissed, new one enters |

---

## 5. Responsive Behavior

| Breakpoint | Position | Width |
|---|---|---|
| Mobile (`< md`) | `bottom-center`, full-width with `mx-4` | `calc(100% - 2rem)` |
| Tablet (`md`) | `bottom-right` | `min-w-[320px] max-w-[420px]` |
| Desktop (`lg+`) | `bottom-right` | `min-w-[320px] max-w-[420px]` |

### Mobile Adjustments

Sonner handles responsive positioning automatically. On mobile, toasts stack from bottom center for easier thumb reach.

---

## 6. Accessibility

### ARIA

- Toast container: `aria-live="polite"` (non-intrusive announcements)
- Individual toasts: `role="status"` 
- Dismiss button: `aria-label="Dismiss notification"`
- Icons: `aria-hidden="true"` (decorative, message text conveys meaning)

### Keyboard

- **Tab**: Can focus dismiss button within visible toast
- **Enter / Space**: Dismiss focused toast
- **Escape**: Dismiss all visible toasts (Sonner default)

### Screen Reader

- Toast messages announced by `aria-live="polite"` — content read aloud when toast appears
- Plain text only — no interactive elements inside toast body (links, buttons, etc.)
- Action notifications are self-contained: "Profile saved", "Failed to save. Please try again."

### Focus Management

- Toasts do NOT steal focus from current user interaction
- Focus remains on the element that triggered the action
- Dismiss button focusable via Tab but not auto-focused

---

## 7. Animation

### Entrance (Sonner defaults)

```
// Slide in from right + fade
initial: { opacity: 0, x: 100 }
animate: { opacity: 1, x: 0 }
transition: { duration: 0.3, ease: "easeOut" }
```

### Exit

```
// Slide right + fade out
exit: { opacity: 0, x: 100 }
transition: { duration: 0.2, ease: "easeIn" }
```

### Stack Animation

```
// Toasts shift up when new toast enters, smooth layout transition
// Handled internally by Sonner
```

### Reduced Motion

When `prefers-reduced-motion: reduce`:
- Entrance: instant opacity (no slide)
- Exit: instant opacity (no slide)
- Sonner respects this automatically

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Toast background | `bg-card` (white/ivory) | `bg-card` (dark surface) |
| Toast border | `border-border` | `border-border` (dark) |
| Toast shadow | `shadow-lg` (warm soft brown shadow) | `shadow-lg` (darker shadow) |
| Text | `text-foreground` | `text-foreground` (light text) |
| Description text | `text-muted-foreground` | `text-muted-foreground` |
| Success icon | `text-green-600` | `text-green-400` |
| Error icon | `text-destructive` | `text-destructive` |
| Info icon | `text-primary` | `text-primary` |
| Warning icon | `text-amber-600` | `text-amber-400` |
| Dismiss button | `text-muted-foreground` | `text-muted-foreground` |

No structural changes between modes.
