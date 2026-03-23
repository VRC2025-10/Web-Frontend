# Forms Pattern

> Version: 1.0 | Last updated: 2026-03-20

This document defines the form architecture, validation strategy, layout conventions, and interactive patterns for all forms in the VRC community website.

---

## Table of Contents

- [Architecture](#architecture)
- [Validation Strategy](#validation-strategy)
- [Error Display](#error-display)
- [Required Fields](#required-fields)
- [Submit Button States](#submit-button-states)
- [Server-Side Validation](#server-side-validation)
- [Multi-Field Validation](#multi-field-validation)
- [Form Layout](#form-layout)
- [Input Styling](#input-styling)
- [Textarea with Character Count](#textarea-with-character-count)
- [Switch / Toggle Pattern](#switch--toggle-pattern)
- [File Upload Pattern](#file-upload-pattern)
- [Form Reset / Cancel](#form-reset--cancel)
- [Autosave](#autosave)
- [Keyboard Behavior](#keyboard-behavior)
- [Form Inventory](#form-inventory)

---

## Architecture

All forms use the following stack:

| Layer | Technology | Purpose |
|---|---|---|
| Form state | **react-hook-form** | Field registration, dirty tracking, submission |
| Schema validation | **zod** | Type-safe validation schemas, shared with server |
| Server mutation | **Server Actions** | Form submission to backend via Next.js |
| UI components | **shadcn/ui** | Input, Textarea, Select, Switch, Button, Label |

### Basic Form Structure

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createEvent } from '@/app/actions/events';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  description: z.string().max(2000, 'Description must be 2000 characters or fewer').optional(),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['draft', 'published']),
});

type EventFormValues = z.infer<typeof eventSchema>;

export function EventForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: 'onBlur',        // First validation on blur
    reValidateMode: 'onChange', // Re-validate on change after first error
  });

  async function onSubmit(data: EventFormValues) {
    const result = await createEvent(data);
    if (result.errors) {
      // Map server errors to form fields
      Object.entries(result.errors).forEach(([field, message]) => {
        setError(field as keyof EventFormValues, { message: message as string });
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-2xl">
      {/* Fields */}
    </form>
  );
}
```

---

## Validation Strategy

### Timing

| Phase | Trigger | Behavior |
|---|---|---|
| First validation | `onBlur` | Validate when user leaves a field for the first time |
| Re-validation after error | `onChange` | Re-validate on every keystroke once an error is shown |
| Submit validation | `onSubmit` | Validate all fields before submitting |
| Server validation | After submit | Server Action returns errors, mapped to fields |

### Why This Timing

- **onBlur first**: Avoids annoying users while they're still typing.
- **onChange after error**: Provides immediate feedback that the error is resolved.
- **No onSubmit-only**: Users get feedback before attempting to submit.

### Zod Schema Sharing

Validation schemas are defined in a shared location and used by both client forms and Server Actions:

```
src/
  lib/
    validations/
      event.ts       # z.object for event forms
      member.ts      # z.object for member/profile forms
      auth.ts        # z.object for login/register
      admin.ts       # z.object for admin actions
```

```tsx
// src/lib/validations/event.ts
import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(2000).optional(),
  date: z.coerce.date().min(new Date(), 'Date must be in the future'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags'),
});

export type EventFormValues = z.infer<typeof eventSchema>;
```

---

## Error Display

### Inline Field Errors

Errors appear directly below the associated input field:

```tsx
<div className="space-y-2">
  <Label htmlFor="title">
    Title <span aria-hidden="true" className="text-destructive">*</span>
    <span className="sr-only">(required)</span>
  </Label>
  <Input
    id="title"
    {...register('title')}
    aria-invalid={!!errors.title}
    aria-describedby={errors.title ? 'title-error' : undefined}
    className={cn(errors.title && 'border-destructive')}
  />
  {errors.title && (
    <p id="title-error" role="alert" className="text-sm text-destructive">
      {errors.title.message}
    </p>
  )}
</div>
```

### Error Styling

| Property | Value | Token |
|---|---|---|
| Text color | `text-destructive` | Red-600 |
| Text size | `text-sm` | 14px |
| Margin top | `mt-1` | 4px |
| Border color (on input) | `border-destructive` | Red-600 |
| Association | `aria-describedby` pointing to error `id` | — |
| Role | `role="alert"` | Announced immediately by screen readers |

### Form-Level Errors

For errors not tied to a specific field (e.g., network errors, general server errors):

```tsx
{formError && (
  <Alert variant="destructive" className="mb-6">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{formError}</AlertDescription>
  </Alert>
)}
```

---

## Required Fields

### Marking Strategy

- Visual: red asterisk `*` next to label (hidden from screen readers via `aria-hidden`)
- Screen reader: `sr-only` text "(required)"
- HTML: `required` attribute + `aria-required="true"`
- Form-level note at top: "Fields marked with * are required"

```tsx
// Required field indicator component
function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-destructive ml-0.5">*</span>
      <span className="sr-only">(required)</span>
    </>
  );
}

// Usage
<Label htmlFor="email">
  Email <RequiredMark />
</Label>
```

---

## Submit Button States

| State | Visual | Behavior |
|---|---|---|
| **Idle** | Primary button, full label | Clickable |
| **Submitting** | Spinner icon + "Saving..." text, `opacity-80` | `disabled`, `aria-busy="true"` |
| **Success** | Check icon + "Saved" text (2s), then return to idle | Non-interactive during feedback |
| **Error** | Button returns to idle, error displayed above form or inline | Clickable again |

```tsx
<Button
  type="submit"
  disabled={isSubmitting}
  aria-busy={isSubmitting}
  className="min-w-[120px]"
>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>
```

### Success Feedback

After successful submission:
- **Profile/Settings forms**: Toast notification "Changes saved" + stay on page.
- **Create forms** (event, club): Redirect to detail page + toast "Created successfully".
- **Delete actions**: Redirect to list page + toast "Deleted successfully".

---

## Server-Side Validation

Server Actions perform independent validation using the same Zod schema:

```tsx
// src/app/actions/events.ts
'use server';

import { eventSchema } from '@/lib/validations/event';
import { revalidatePath } from 'next/cache';

type ActionResult = {
  success: boolean;
  errors?: Record<string, string>;
};

export async function createEvent(formData: EventFormValues): Promise<ActionResult> {
  // Server-side validation (never trust client)
  const parsed = eventSchema.safeParse(formData);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field) errors[String(field)] = issue.message;
    });
    return { success: false, errors };
  }

  // Proceed with API call
  try {
    await api.events.create(parsed.data);
    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    return { success: false, errors: { _form: 'Failed to create event. Please try again.' } };
  }
}
```

### Client-Side Error Mapping

```tsx
async function onSubmit(data: EventFormValues) {
  const result = await createEvent(data);
  if (!result.success && result.errors) {
    // Map field-level errors
    Object.entries(result.errors).forEach(([field, message]) => {
      if (field === '_form') {
        setFormError(message); // General form error
      } else {
        setError(field as keyof EventFormValues, { message });
      }
    });
    return;
  }
  // Success: redirect or show toast
}
```

---

## Multi-Field Validation

Cross-field validation rules are defined in the Zod schema using `.refine()` or `.superRefine()`:

```tsx
const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'], // Attach error to endDate field
  }
);

// Complex cross-field validation
const profileSchema = z.object({
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // At least one social link if bio is provided
  if (data.bio && !data.twitterUrl && !data.websiteUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide at least one social link when a bio is set',
      path: ['twitterUrl'],
    });
  }
});
```

---

## Form Layout

### Standard Layout Rules

| Rule | Value |
|---|---|
| Max width | `max-w-2xl` (672px) |
| Column layout | Single column always (no multi-column forms) |
| Field spacing | `space-y-6` (24px between field groups) |
| Section spacing | `space-y-8` (32px between sections) |
| Section headings | `text-lg font-semibold` + optional description `text-sm text-muted-foreground` |
| Button alignment | Left-aligned, `gap-3` between buttons |
| Button order | Primary action first, then secondary (Cancel) |

### Layout Template

```tsx
<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 max-w-2xl">
  {/* Form-level error */}
  {formError && <Alert variant="destructive">...</Alert>}

  {/* Section 1 */}
  <section className="space-y-6">
    <div>
      <h2 className="text-lg font-semibold">Basic Information</h2>
      <p className="text-sm text-muted-foreground">Set the main details for this event.</p>
    </div>
    {/* Fields */}
  </section>

  {/* Section 2 */}
  <section className="space-y-6">
    <div>
      <h2 className="text-lg font-semibold">Settings</h2>
    </div>
    {/* Fields */}
  </section>

  {/* Actions */}
  <div className="flex gap-3 pt-4">
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </Button>
    <Button type="button" variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
  </div>
</form>
```

---

## Input Styling

All inputs follow the "Autumn Soft" theme:

| Property | Value | Notes |
|---|---|---|
| Border radius | `rounded-xl` | Large rounded corners per theme |
| Border | `border-input` | Warm-gray-200 default |
| Background | `bg-background` | Ivory |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` | Coral ring |
| Error border | `border-destructive` | Red-600 when invalid |
| Disabled | `opacity-50 cursor-not-allowed` | Standard disabled state |
| Placeholder | `text-muted-foreground` | Warm-gray-500, meets contrast |
| Height | `h-10` (40px) | Standard input height |
| Padding | `px-3 py-2` | Consistent internal spacing |

### Input Component Override

```tsx
// In shadcn/ui Input component customization
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2',
          'text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
```

---

## Textarea with Character Count

Textareas that have a character limit display a live counter:

```tsx
function TextareaWithCount({
  maxLength,
  value,
  ...props
}: TextareaProps & { maxLength: number }) {
  const length = value?.toString().length ?? 0;
  const isNearLimit = length > maxLength * 0.9;
  const isOverLimit = length > maxLength;

  return (
    <div className="space-y-1">
      <Textarea
        {...props}
        value={value}
        maxLength={maxLength}
        aria-describedby={`${props.id}-count`}
      />
      <p
        id={`${props.id}-count`}
        className={cn(
          'text-xs text-right',
          isOverLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : 'text-muted-foreground',
        )}
        aria-live="polite"
      >
        {length}/{maxLength}
      </p>
    </div>
  );
}
```

| Threshold | Style | Token |
|---|---|---|
| Normal (< 90%) | `text-muted-foreground` | Warm-gray-500 |
| Near limit (≥ 90%) | `text-warning` | Mustard-600 |
| Over limit (> 100%) | `text-destructive` | Red-600 |

---

## Switch / Toggle Pattern

Used for boolean settings (e.g., "Receive notifications", "Public profile"):

```tsx
<div className="flex items-center justify-between rounded-xl border p-4">
  <div className="space-y-0.5">
    <Label htmlFor="notifications" className="text-base">
      Email Notifications
    </Label>
    <p className="text-sm text-muted-foreground">
      Receive email notifications for new events.
    </p>
  </div>
  <Switch
    id="notifications"
    checked={field.value}
    onCheckedChange={field.onChange}
    aria-describedby="notifications-desc"
  />
</div>
```

### Switch Rules

- Always accompanied by a label and optional description.
- Wrapped in a bordered container for visual grouping.
- No form submission required for immediate-effect toggles — use optimistic update + API call.
- For form-based toggles, include in react-hook-form `Controller`.

---

## File Upload Pattern

Drag-and-drop file upload with preview:

```tsx
function FileUpload({ onFileSelect, accept, maxSizeMB = 5 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }

  function validateAndSelect(file: File) {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMB}MB`);
      return;
    }
    onFileSelect(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      role="button"
      tabIndex={0}
      aria-label="Upload file. Drag and drop or click to select."
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50',
      )}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Drag & drop or <span className="text-primary font-medium">browse</span>
      </p>
      <p className="text-xs text-muted-foreground">Max {maxSizeMB}MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && validateAndSelect(e.target.files[0])}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  );
}
```

### File Upload Requirements

| Requirement | Value |
|---|---|
| Max file size | 5MB (images), configurable per form |
| Accepted types | `image/jpeg, image/png, image/webp` for avatars/galleries |
| Preview | Show thumbnail after selection |
| Remove | "Remove" button to clear selection |
| Progress | Show upload progress bar for large files |
| Error | Toast for invalid file type/size |
| Accessibility | Keyboard-activatable, screen-reader-announced |

---

## Form Reset / Cancel

### Cancel Behavior

| Scenario | Behavior |
|---|---|
| No changes made (form is clean) | Navigate back immediately |
| Changes made (form is dirty) | Show confirmation dialog: "You have unsaved changes. Discard?" |
| After successful submit | Reset form state, redirect or show success |

```tsx
function handleCancel() {
  if (formState.isDirty) {
    setShowDiscardDialog(true);
  } else {
    router.back();
  }
}

// Confirmation dialog
<AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard changes?</AlertDialogTitle>
      <AlertDialogDescription>
        You have unsaved changes that will be lost.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep editing</AlertDialogCancel>
      <AlertDialogAction onClick={() => router.back()}>
        Discard
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Browser Navigation Guard

Warn users when navigating away with unsaved changes:

```tsx
useEffect(() => {
  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (formState.isDirty) {
      e.preventDefault();
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [formState.isDirty]);
```

---

## Autosave

Autosave is **NOT** implemented in v1.0. All forms require explicit submission.

### Future Consideration

If autosave is added later:
- Debounce: 2 seconds after last change.
- Visual indicator: "Saving..." → "Saved at {time}" in form header.
- Conflict resolution: last-write-wins with timestamp.
- Only for profile/settings — never for create/delete actions.

---

## Keyboard Behavior

| Key | Behavior |
|---|---|
| `Enter` | Submits the form (when focus is not on a textarea or button) |
| `Tab` | Moves to next field in source order |
| `Shift + Tab` | Moves to previous field |
| `Space` | Toggles checkboxes and switches |
| `Escape` | Closes dropdowns/selects; triggers cancel if in dialog |
| `Arrow Up/Down` | Navigates select options |

### Enter Key Handling

```tsx
// Prevent Enter from submitting when inside a textarea
// (default browser behavior handles this — textarea inserts newline)

// For single-line inputs, Enter submits the enclosing form.
// react-hook-form's handleSubmit manages this.
```

---

## Form Inventory

| Form | Location | Fields | Validation | Notes |
|---|---|---|---|---|
| **Login** | `/login` | email, password | Required, email format | OAuth buttons separate |
| **Profile Editor** | `/profile` | displayName, bio, avatar, social links | Required name, URL format, max lengths | Tabbed sections |
| **Event Create/Edit** | `/admin/events/new`, `/admin/events/[id]/edit` | title, description, date, time, tags, thumbnail, status | Required title/date, future date, max 5 tags | Shared schema |
| **Club Create/Edit** | `/admin/clubs/new`, `/admin/clubs/[id]/edit` | name, description, logo, category | Required name | — |
| **Gallery Upload** | `/admin/galleries/[id]` | images (multi), captions | File type/size validation | Drag-and-drop |
| **Member Management** | `/admin/members/[id]` | role, status, notes | Enum validation | Admin only |
| **Report Action** | `/admin/reports/[id]` | action (select), reason (textarea) | Required action | AlertDialog wrapper |
| **Search/Filter** | Various list pages | search, status, tags, sort | No submit — controlled inputs | Debounced search |

---

## Cross-References

- [Accessibility Pattern](./accessibility.md) — form a11y requirements
- [Error Handling Pattern](./error-handling.md) — server error mapping
- [Input Components](../03-components/input/) — component specifications
- [Profile Editor Page](../04-pages/04-profile-editor.md) — primary form page
- [Admin Page](../04-pages/06-admin.md) — admin form contexts
