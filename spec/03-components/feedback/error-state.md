# Inline Error States

> Error display patterns for form-level, page-level, and network errors

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Display contextual error messages for API failures, form errors, and network issues |
| **Components Covered** | Form-Level Error (Alert), Network Error Banner, Inline Field Errors |
| **Component Type** | Mixed — some Server Component, some Client Component |
| **When to Use** | API call failures, form submission errors, network connectivity issues |
| **When NOT to Use** | Validation-only errors (use `<FormMessage>`), page-level 404/500 (use `error.tsx` / `not-found.tsx`) |

> **Note:** Full page-level error boundaries (`error.tsx`) are specified in `spec/04-pages/08-error-pages.md`.

---

## 2. Props / API

### Form-Level Error Alert

No separate component — inline usage of shadcn/ui `<Alert>`:

```tsx
{serverError && (
  <Alert variant="destructive" className="rounded-xl">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{serverError}</AlertDescription>
  </Alert>
)}
```

### Network Error Banner

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `onRetry` | `() => void` | — | Yes | Callback to retry the failed operation |
| `message` | `string` | `"Unable to connect. Check your internet connection."` | No | Custom error message |

### Inline Field Error

Handled by shadcn/ui `<FormMessage>` — see `forms.md` for details.

---

## 3. Visual Structure

### Form-Level Error (API failure after submit)

```
<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}>
│
└─ <Alert variant="destructive" className="rounded-xl">
   │
   ├─ <AlertTriangle className="h-4 w-4" />
   │
   ├─ <AlertTitle>Error</AlertTitle>
   │
   └─ <AlertDescription>
        "An error occurred. Please try again later."
      </AlertDescription>
</Alert>
</motion.div>
```

Placement: Top of the form `<form>` element, before any `<FormField>` components.

### Network Error Banner

```
<div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4
                flex items-center gap-3"
     role="alert">
│
├─ <WifiOff className="w-5 h-5 text-destructive shrink-0" aria-hidden="true" />
│
├─ <p className="text-sm flex-1">{message}</p>
│
└─ <Button variant="outline" size="sm" onClick={onRetry}
           className="shrink-0">
     Retry
   </Button>
</div>
```

Placement: Top of the affected section or page content area.

### Inline Field Error (FormMessage)

```
<FormMessage className="text-destructive text-sm mt-1" />
```

Placement: Below the `<FormControl>` input, within `<FormItem>`.

---

## 4. Variant × State Matrix

### Form-Level Error

| State | Visual | Behavior |
|---|---|---|
| No error | Alert hidden | Normal form display |
| Server error (generic) | Alert visible: "An error occurred. Please try again later." | Focus moves to Alert |
| Server error (specific) | Alert visible with specific message from API | Focus moves to Alert |
| Server field errors | Alert + individual field errors highlighted | Focus moves to first errored field |
| Retrying | Alert remains visible until next submit attempt | User can edit and resubmit |

### Network Error Banner

| State | Visual | Behavior |
|---|---|---|
| Connected | Banner hidden | Normal operation |
| Disconnected | Banner visible with WifiOff icon + message | Retry button available |
| Retrying | Retry button shows spinner | Automatic retry in progress |
| Reconnected | Banner disappears | Content loads normally |

### Error Message Catalog

| Error Type | Message (en) | Message (ja) |
|---|---|---|
| Generic server error | "An error occurred. Please try again later." | "エラーが発生しました。後でもう一度お試しください。" |
| Network error | "Unable to connect. Check your internet connection." | "接続できません。インターネット接続を確認してください。" |
| Rate limit | "Too many requests. Please wait a moment." | "リクエストが多すぎます。しばらくお待ちください。" |
| Unauthorized | "Your session has expired. Please log in again." | "セッションが切れました。再度ログインしてください。" |
| Forbidden | "You don't have permission for this action." | "この操作を行う権限がありません。" |

---

## 5. Responsive Behavior

| Breakpoint | Form-Level Alert | Network Banner |
|---|---|---|
| Mobile (`< md`) | Full-width, stacked layout | Full-width, text wraps, button below text |
| Tablet (`md`) | Full-width within form | Inline: icon + text + button in one row |
| Desktop (`lg+`) | Same as tablet | Same as tablet |

### Mobile Adjustments

- Network error banner: flex-wrap, button goes to new line
- Alert text: may wrap to multiple lines
- All error states remain within their parent container's padding

---

## 6. Accessibility

### ARIA

- Form-Level Alert: `role="alert"` (via shadcn/ui Alert `variant="destructive"`) — immediate screen reader announcement
- Network Error Banner: `role="alert"` — announced when it appears
- WifiOff icon: `aria-hidden="true"` (decorative)
- AlertTriangle icon: `aria-hidden="true"` (decorative, title provides context)
- Retry button: inherent button semantics, labeled "Retry"
- Field errors: linked via `aria-describedby` (handled by shadcn/ui Form)

### Keyboard

- **Tab**: Focus moves to Retry button (network banner) or form fields
- **Enter / Space**: Activate Retry button
- No special keyboard shortcuts for error dismissal (errors clear on successful retry)

### Screen Reader

- `role="alert"` ensures immediate announcement without requiring focus
- Error messages are descriptive: "An error occurred. Please try again later."
- Field-level errors announced when field receives focus (via `aria-describedby`)
- Retry button announces "Retry" — context provided by surrounding `role="alert"` text

### Focus Management

- On form server error: programmatic focus to Alert element (`alertRef.current?.focus()`)
- On form field errors: focus to first invalid field
- On network error appearance: no focus steal (it's a passive notification)
- On retry success: banner disappears, focus stays on content

---

## 7. Animation

### Form-Level Alert Entrance

```tsx
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  <Alert variant="destructive" className="rounded-xl">
    ...
  </Alert>
</motion.div>
```

### Network Error Banner Entrance

```tsx
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.25 }}
>
  <div role="alert" className="...">
    ...
  </div>
</motion.div>
```

### Retry Button Loading

```tsx
<Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
  {isRetrying ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    "Retry"
  )}
</Button>
```

### Reduced Motion

- Alert entrance: instant opacity, no y-translation
- Banner entrance: instant show/hide, no height animation
- All error states still appear — only animation is simplified

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Alert (destructive) bg | `bg-destructive/10` (light red tint) | `bg-destructive/10` (dark red tint) |
| Alert border | `border-destructive/20` | `border-destructive/20` |
| Alert icon | `text-destructive` | `text-destructive` |
| Alert text | `text-foreground` | `text-foreground` |
| Network banner bg | `bg-destructive/10` | `bg-destructive/10` |
| Network banner border | `border-destructive/20` | `border-destructive/20` |
| WifiOff icon | `text-destructive` | `text-destructive` |
| Retry button | `variant="outline"` (standard) | `variant="outline"` (dark tokens) |
| FormMessage text | `text-destructive` | `text-destructive` |

No structural changes — error states rely on semantic `destructive` token which adapts automatically.
