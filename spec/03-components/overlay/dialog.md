# Dialog / Confirmation Modal

> Shadcn/ui Dialog (Radix primitive) patterns for forms and confirmations

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Present focused content overlays for forms, confirmations, and destructive action gates |
| **File Path** | `components/ui/dialog.tsx` (shadcn standard) |
| **Component Type** | Client Component (inherits from Radix Dialog) |
| **Dependencies** | shadcn/ui Dialog, Radix UI Dialog primitive |
| **When to Use** | Report submission, delete/suspend confirmation, small forms that don't need a full page |
| **When NOT to Use** | Complex multi-step forms (use full pages), information display (use cards/sheets), image viewing (use Lightbox) |

---

## 2. Props / API

### Standard Dialog (shadcn/ui)

Follows shadcn/ui Dialog composition. No custom props beyond shadcn defaults.

### ReportDialog Component

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `targetType` | `"member" \| "event"` | — | Yes | Type of content being reported |
| `targetId` | `string` | — | Yes | ID of the reported entity |
| `targetName` | `string` | — | Yes | Display name of the reported entity |
| `trigger` | `ReactNode` | — | Yes | Trigger element (e.g., Button) |

### Confirmation Dialog (Destructive)

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `title` | `string` | — | Yes | Dialog title |
| `description` | `string` | — | Yes | Explanation of consequences |
| `confirmLabel` | `string` | `"Confirm"` | No | Confirm button text |
| `onConfirm` | `() => Promise<void>` | — | Yes | Async confirm handler |
| `variant` | `"default" \| "destructive"` | `"default"` | No | Controls button color and backdrop behavior |
| `trigger` | `ReactNode` | — | Yes | Trigger element |

---

## 3. Visual Structure

### Standard Dialog (Report, Create)

```
<Dialog>
│
├─ <DialogTrigger asChild>
│  └─ <Button>Report</Button>
│
└─ <DialogPortal>
   ├─ <DialogOverlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
   │
   └─ <DialogContent className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
                                 rounded-2xl max-w-md w-full bg-card border shadow-lg p-6">
      │
      ├─ <DialogHeader>
      │  ├─ <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
      │  └─ <DialogDescription className="text-sm text-muted-foreground">
      │       {description}
      │     </DialogDescription>
      │
      ├─ <div className="space-y-4 py-4">
      │  └─ {form content}
      │
      ├─ <DialogFooter className="flex justify-end gap-2">
      │  ├─ <DialogClose asChild>
      │  │  └─ <Button variant="outline" className="rounded-full">Cancel</Button>
      │  └─ <Button className="rounded-full">{confirm}</Button>
      │
      └─ <DialogClose className="absolute right-4 top-4">
         └─ <X className="w-4 h-4" />
</DialogContent>
```

### Confirmation Dialog (Delete, Suspend)

```
<Dialog>
│
├─ <DialogTrigger asChild>
│  └─ <Button variant="destructive">Delete</Button>
│
└─ <DialogContent className="rounded-2xl max-w-md"
                   onInteractOutside={(e) => e.preventDefault()}  ← prevent backdrop close
                   onEscapeKeyDown={(e) => e.preventDefault()}>   ← prevent Escape close
      │
      ├─ <DialogHeader>
      │  ├─ <DialogTitle>Are you sure?</DialogTitle>
      │  └─ <DialogDescription>
      │       "This action cannot be undone. This will permanently delete..."
      │     </DialogDescription>
      │
      └─ <DialogFooter>
         ├─ <DialogClose asChild>
         │  └─ <Button variant="outline" className="rounded-full">Cancel</Button>
         └─ <Button variant="destructive" className="rounded-full"
                    onClick={onConfirm} disabled={isConfirming}>
              {isConfirming && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
```

### ReportDialog

```
<Dialog>
│
├─ <DialogTrigger asChild>{trigger}</DialogTrigger>
│
└─ <DialogContent className="rounded-2xl max-w-md">
   │
   ├─ <DialogHeader>
   │  ├─ <DialogTitle>Report {targetType}</DialogTitle>
   │  └─ <DialogDescription>
   │       Reporting: <strong>{targetName}</strong>
   │     </DialogDescription>
   │
   ├─ <Form {...form}>
   │  └─ <form onSubmit={...} className="space-y-4 py-4">
   │     └─ <FormField name="reason">
   │        └─ <FormItem>
   │           ├─ <FormLabel>Reason *<span className="sr-only">(required)</span></FormLabel>
   │           ├─ <FormControl>
   │           │  └─ <Textarea
   │           │       className="rounded-xl min-h-[100px]"
   │           │       placeholder="Describe the issue..."
   │           │     />
   │           └─ <FormMessage />
   │
   └─ <DialogFooter>
      ├─ <DialogClose asChild>
      │  └─ <Button variant="outline" className="rounded-full">Cancel</Button>
      └─ <Button type="submit" className="rounded-full" disabled={isSubmitting}>
           {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
           Submit Report
         </Button>
```

**ReportDialog validation:** reason min 10 chars, max 1000 chars.
**ReportDialog submit:** Server Action → POST /api/v1/internal/reports → `toast.success("Report submitted")` → close dialog.

---

## 4. Variant × State Matrix

### Dialog Types

| Type | Backdrop Click | Escape Key | Confirm Button | Use Case |
|---|---|---|---|---|
| Standard (form) | Closes dialog | Closes dialog | Primary (coral) | Report, Create forms |
| Destructive confirmation | **Does NOT close** | **Does NOT close** | Destructive (red) | Delete, Suspend actions |
| Non-destructive confirmation | Closes dialog | Closes dialog | Primary (coral) | Soft confirmations |

### Dialog States

| State | Visual | Behavior |
|---|---|---|
| Closed | Not rendered | Trigger visible |
| Opening | Scale + fade animation | Focus trapped inside |
| Open (idle) | Full dialog visible | Interact with content |
| Submitting | Confirm button disabled + spinner | Prevent double submit |
| Success | Dialog closes | Toast notification shown |
| Error | Alert inside dialog | Dialog stays open for retry |

---

## 5. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (`< md`) | `max-w-[calc(100%-2rem)]`, `mx-4`, content may scroll if tall |
| Tablet (`md`) | `max-w-md`, centered |
| Desktop (`lg+`) | `max-w-md`, centered |

### Mobile Adjustments

- Dialog takes near-full width with small margins
- Footer buttons stack vertically on very small screens
- Textarea min-height reduced slightly
- DialogContent gets `max-h-[85vh] overflow-y-auto` for tall content

---

## 6. Accessibility

### ARIA

- Managed by Radix Dialog primitive:
  - `role="dialog"` on DialogContent
  - `aria-labelledby` → linked to DialogTitle
  - `aria-describedby` → linked to DialogDescription
  - `aria-modal="true"` on DialogContent
- Close button: `aria-label="Close"` (via DialogClose)
- Form fields within dialog: standard form accessibility (see `forms.md`)

### Keyboard

- **Tab**: Cycles through focusable elements within dialog (focus trap)
- **Shift + Tab**: Reverse cycle
- **Escape**: Closes dialog (except destructive confirmation)
- **Enter**: Submits form (in ReportDialog) or activates focused button
- **Space**: Activates focused button

### Screen Reader

- Dialog title announced on open
- Dialog description announced after title
- Focus trap prevents reading content behind dialog
- Form errors within dialog announced via `aria-describedby`
- Close/cancel actions clearly labeled

### Focus Management

- On open: focus moves to first focusable element inside dialog (typically first input or Cancel button)
- On close: focus returns to the trigger element that opened the dialog
- Focus trapped: Tab cannot leave dialog while open

---

## 7. Animation

### Dialog Open (scaleIn)

```tsx
// Applied via Radix + Tailwind animation or Framer Motion
// Using shadcn/ui's built-in dialog animation:

// DialogOverlay
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
  className="fixed inset-0 bg-background/80 backdrop-blur-sm"
/>

// DialogContent
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
```

### Dialog Close

```
exit: { opacity: 0, scale: 0.95 }
transition: { duration: 0.15, ease: "easeIn" }
```

### Reduced Motion

- Open/close: instant opacity, no scale transform
- Overlay: instant opacity change

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Overlay | `bg-background/80` (warm ivory, semi-transparent) | `bg-background/80` (dark, semi-transparent) |
| Backdrop blur | `backdrop-blur-sm` | `backdrop-blur-sm` |
| Dialog card bg | `bg-card` (white) | `bg-card` (dark surface) |
| Dialog border | `border-border` | `border-border` (dark) |
| Dialog shadow | `shadow-lg` (warm brown) | `shadow-lg` (darker) |
| Title text | `text-foreground` | `text-foreground` |
| Description text | `text-muted-foreground` | `text-muted-foreground` |
| Destructive button | `bg-destructive text-destructive-foreground` | Same tokens (adapted) |
| Form inputs | See `forms.md` dark mode | See `forms.md` |

No structural changes between modes.
