# Form Patterns

> Global form UX specification — shadcn/ui Form + react-hook-form + zod

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Define global form patterns, input styling, validation UX, and submit behavior shared across all forms in the application |
| **Component Type** | Pattern Specification (not a single component) |
| **Dependencies** | `shadcn/ui Form` (wraps react-hook-form `FormProvider`), `zod`, `sonner`, `lucide-react` |
| **When to Use** | Every form in the application MUST follow these patterns |
| **When NOT to Use** | N/A — this is a mandatory standard, not an optional component |

All forms use `<Form>` from shadcn/ui which wraps react-hook-form's `FormProvider`. Every field uses the composition:

```
<FormField> → <FormItem> → <FormLabel> + <FormControl> + <FormDescription> + <FormMessage>
```

---

## 2. Props / API

### Zod Schema Convention

Every form defines a co-located zod schema:

```ts
// schema defined in same file or imported from lib/validations/<domain>.ts
const profileFormSchema = z.object({
  name: z.string().min(1, "This field is required").max(50, "Maximum 50 characters"),
  // ...
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
```

### react-hook-form Configuration

```ts
const form = useForm<ProfileFormValues>({
  resolver: zodResolver(profileFormSchema),
  mode: "onBlur",          // validate on blur, NOT on change
  defaultValues: { ... },  // always provide defaultValues
});
```

| Config | Value | Rationale |
|---|---|---|
| `resolver` | `zodResolver(schema)` | Centralized validation via zod |
| `mode` | `"onBlur"` | Validate on blur — less intrusive than onChange |
| `defaultValues` | Always provided | Prevents uncontrolled → controlled warnings |

---

## 3. Visual Structure

### Field Layout

```
<Form>                                          ← FormProvider wrapper
│
├─ <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
│  │
│  ├─ {serverError && <Alert variant="destructive" className="rounded-xl">}
│  │    ├─ <AlertTriangle />
│  │    ├─ <AlertTitle>Error</AlertTitle>
│  │    └─ <AlertDescription>{message}</AlertDescription>
│  │
│  ├─ <FormField control={form.control} name="fieldName">
│  │  └─ <FormItem>
│  │     ├─ <FormLabel>                         ← "Label *" for required
│  │     │   ├─ "Field Name"
│  │     │   ├─ {required && <span aria-hidden="true"> *</span>}
│  │     │   └─ {required && <span className="sr-only">(required)</span>}
│  │     ├─ <FormDescription>                   ← optional help text (above input)
│  │     │   └─ "Helper description text"
│  │     ├─ <FormControl>
│  │     │   └─ <Input className="rounded-xl" />
│  │     └─ <FormMessage className="text-destructive text-sm mt-1" />
│  │
│  ├─ ... more FormFields (space-y-6 between) ...
│  │
│  └─ <div className="flex justify-end pt-6 border-t">
│     ├─ <Button variant="outline" type="button">Cancel</Button>
│     └─ <Button type="submit" disabled={isSubmitting}>
│        ├─ {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
│        └─ "Save"
│
</form>
```

### Input Styling Rules

| State | Classes |
|---|---|
| Default | `rounded-xl border border-input bg-background` |
| Focus | `focus-visible:ring-2 ring-primary ring-offset-2` |
| Error | `border-destructive focus-visible:ring-destructive` |
| Disabled | `opacity-50 cursor-not-allowed` |
| Placeholder | `text-muted-foreground` |

---

## 4. Variant × State Matrix

### Validation States

| State | Visual | Behavior |
|---|---|---|
| Pristine | Default border | No validation message shown |
| Touched + Valid | Default border | No message (don't show success) |
| Touched + Invalid | `border-destructive` + red error message | Error shown below field on blur |
| Submitting | All inputs disabled, submit shows spinner | Prevent double submit |
| Submitted + Server Error | Alert at form top + individual field errors if returned | Never clear form |
| Submitted + Success | Toast notification | Revalidate cache, optional redirect |

### Error Text Standard Messages

| Rule | Message |
|---|---|
| Required | "This field is required" |
| Max length | "Maximum {n} characters" |
| Min length | "At least {n} characters required" |
| Invalid format | "Invalid format" |
| Invalid email | "Please enter a valid email address" |
| Pattern mismatch | Context-specific (e.g., "Only alphanumeric characters and underscores") |

---

## 5. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (`< md`) | Full-width fields, stack all vertically, buttons full-width |
| Tablet (`md`) | Max-width container (e.g., `max-w-2xl mx-auto`), buttons right-aligned |
| Desktop (`lg+`) | Same as tablet, optionally 2-column grid for related short fields |

### Form Container Pattern

```
<div className="max-w-2xl mx-auto py-12 px-4">
  <Card className="rounded-[2rem] p-8">
    <form className="space-y-6">...</form>
  </Card>
</div>
```

---

## 6. Accessibility

### ARIA

- `<FormControl>` automatically sets `aria-describedby` linking to `<FormMessage>` and `<FormDescription>` (handled by shadcn/ui Form)
- `aria-invalid="true"` set on inputs with validation errors (handled by shadcn/ui Form)
- Required fields: `aria-required="true"` on input + visual asterisk + sr-only "(required)" text

### Keyboard

- **Tab**: Move between form fields in DOM order
- **Enter**: Submits single-field forms (e.g., search). In multi-field forms, Enter in the last field or explicit button click
- **Escape**: Does NOT clear form (prevent accidental data loss)

### Screen Reader

- Error messages announced when field loses focus and validation fails (via `aria-describedby`)
- Server error Alert has `role="alert"` for immediate announcement
- Submit button loading state: sr-only "Submitting..." text alongside spinner
- Required indicator: sr-only "(required)" inside label

### Focus Management

- On server error: focus moves to Alert banner at top of form
- On validation error: focus moves to first invalid field
- After successful submit: focus managed by navigation or toast

---

## 7. Animation

### Submit Button Loading

```tsx
<Button type="submit" disabled={isSubmitting}>
  <AnimatePresence mode="wait">
    {isSubmitting ? (
      <motion.span
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Saving...
      </motion.span>
    ) : (
      <motion.span
        key="idle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Save
      </motion.span>
    )}
  </AnimatePresence>
</Button>
```

### Error Alert Entrance

```tsx
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  <Alert variant="destructive">...</Alert>
</motion.div>
```

### Field Error Message

```tsx
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.15 }}
>
  <FormMessage />
</motion.div>
```

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Input background | `bg-background` (warm ivory) | `bg-background` (dark surface) |
| Input border | `border-input` (soft brown/border) | `border-input` (dark border) |
| Focus ring | `ring-primary` (coral) | `ring-primary` (lighter coral) |
| Error border | `border-destructive` (red) | `border-destructive` (lighter red) |
| Placeholder | `text-muted-foreground` | `text-muted-foreground` (lighter) |
| Description text | `text-muted-foreground` | `text-muted-foreground` |
| Card background | `bg-card` (white) | `bg-card` (dark card) |
| Disabled overlay | `opacity-50` | `opacity-50` (same) |

No structural changes between modes — only token-level color shifts via CSS custom properties.
