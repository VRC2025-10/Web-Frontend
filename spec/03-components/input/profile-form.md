# ProfileForm

> Profile editor form — react-hook-form + zod + Server Action

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Allow authenticated members to edit their public profile information |
| **File Path** | `components/features/profile/profile-form.tsx` |
| **Component Type** | Client Component (`"use client"`) |
| **Form Library** | react-hook-form + zod schema |
| **Submit Handler** | Server Action (`actions/profile.ts`) |
| **When to Use** | Profile settings page (`/settings/profile`) |
| **When NOT to Use** | Admin user editing (use admin-specific form), display-only profile views |

### Data Flow

```
RSC page (settings/profile/page.tsx)
  → fetches GET /api/v1/internal/me/profile (server-side, with cookie)
  → passes defaultValues as prop
  → <ProfileForm defaultValues={data} />
    → User edits fields
    → onSubmit calls Server Action (actions/profile.ts)
      → Server Action calls PUT /api/v1/internal/me/profile
      → revalidateTag('members')
      → Returns success/error
    → Toast "Profile saved" on success
    → Alert banner on error
```

---

## 2. Props / API

### Component Props

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `defaultValues` | `ProfileFormValues` | — | Yes | Pre-filled profile data from API |

### Zod Schema (`lib/validations/profile.ts`)

```ts
export const profileFormSchema = z.object({
  vrc_id: z
    .string()
    .max(100, "Maximum 100 characters")
    .optional()
    .or(z.literal("")),
  short_bio: z
    .string()
    .max(100, "Maximum 100 characters")
    .optional()
    .or(z.literal("")),
  bio_markdown: z
    .string()
    .min(1, "This field is required")
    .max(5000, "Maximum 5000 characters"),
  is_public: z.boolean(),
  x_id: z
    .string()
    .max(16, "Maximum 16 characters")
    .regex(/^@?[a-zA-Z0-9_]{0,15}$/, "Invalid X (Twitter) ID format")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
```

### Form Fields

| Field | UI Component | Validation | API Field | Notes |
|---|---|---|---|---|
| Name (display name) | `Input` rounded-xl | Read-only display | `discord_username` | Shown but not editable (from Discord) |
| VRC ID | `Input` rounded-xl, prefix "usr_" | Optional, max 100 chars | `vrc_id` | |
| Short Bio | `Input` rounded-xl | Optional, max 100 chars | part of `bio_markdown` | Placeholder: "Nice to meet you!" |
| Bio (Markdown) | `MarkdownPreview` (tabs) | Required, max 5000 chars | `bio_markdown` | Edit/Preview tabs |
| Public toggle | `Switch` | Boolean | `is_public` | |
| X (Twitter) ID | `Input` with X icon prefix | Optional, max 16 chars, pattern | `x_id` | Pattern: `^@?[a-zA-Z0-9_]{1,15}$` |

---

## 3. Visual Structure

```
<div className="max-w-2xl mx-auto py-12 px-4">
│
├─ <Card className="rounded-[2rem] p-8">
│  │
│  ├─ <CardHeader>
│  │  ├─ <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
│  │  └─ <CardDescription>Update your public profile information</CardDescription>
│  │
│  ├─ <Form {...form}>
│  │  │
│  │  ├─ {serverError && (
│  │  │    <Alert variant="destructive" className="rounded-xl">
│  │  │      <AlertTriangle /> <AlertTitle>Error</AlertTitle>
│  │  │      <AlertDescription>{serverError}</AlertDescription>
│  │  │    </Alert>
│  │  │  )}
│  │  │
│  │  ├─ <form onSubmit={...} className="space-y-8">
│  │  │  │
│  │  │  ├─ [Name — read-only]
│  │  │  │  <FormItem>
│  │  │  │    <FormLabel>Name</FormLabel>
│  │  │  │    <Input value={discordUsername} disabled className="rounded-xl opacity-70" />
│  │  │  │    <FormDescription>Synced from Discord</FormDescription>
│  │  │  │  </FormItem>
│  │  │  │
│  │  │  ├─ [VRC ID]
│  │  │  │  <FormField name="vrc_id">
│  │  │  │    <FormLabel>VRC ID</FormLabel>
│  │  │  │    <div className="relative">
│  │  │  │      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">usr_</span>
│  │  │  │      <Input className="rounded-xl pl-12" />
│  │  │  │    </div>
│  │  │  │    <FormMessage />
│  │  │  │  </FormField>
│  │  │  │
│  │  │  ├─ [Short Bio]
│  │  │  │  <FormField name="short_bio">
│  │  │  │    <FormLabel>Short Bio</FormLabel>
│  │  │  │    <Input className="rounded-xl" placeholder="Nice to meet you!" />
│  │  │  │    <FormMessage />
│  │  │  │  </FormField>
│  │  │  │
│  │  │  ├─ [Bio Markdown]
│  │  │  │  <FormField name="bio_markdown">
│  │  │  │    <FormLabel>Bio *<span className="sr-only">(required)</span></FormLabel>
│  │  │  │    <MarkdownPreview value={field.value} onChange={field.onChange} />
│  │  │  │    <FormMessage />
│  │  │  │  </FormField>
│  │  │  │
│  │  │  ├─ [Public Toggle]
│  │  │  │  <FormField name="is_public">
│  │  │  │    <div className="flex items-center justify-between rounded-xl border p-4">
│  │  │  │      <div>
│  │  │  │        <FormLabel>Public Profile</FormLabel>
│  │  │  │        <FormDescription>Show your profile in the members list</FormDescription>
│  │  │  │      </div>
│  │  │  │      <Switch checked={field.value} onCheckedChange={field.onChange} />
│  │  │  │    </div>
│  │  │  │  </FormField>
│  │  │  │
│  │  │  ├─ [X (Twitter) ID]
│  │  │  │  <FormField name="x_id">
│  │  │  │    <FormLabel>X (Twitter)</FormLabel>
│  │  │  │    <div className="relative">
│  │  │  │      <XIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
│  │  │  │      <Input className="rounded-xl pl-10" placeholder="@username" />
│  │  │  │    </div>
│  │  │  │    <FormMessage />
│  │  │  │  </FormField>
│  │  │  │
│  │  │  └─ <div className="flex justify-end pt-6 border-t">
│  │  │       <Button type="submit" className="rounded-full px-8 py-3" disabled={isSubmitting}>
│  │  │         {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
│  │  │         Save Profile
│  │  │       </Button>
│  │  │     </div>
```

### MarkdownPreview Sub-component

| Item | Detail |
|---|---|
| **File Path** | `components/features/profile/markdown-preview.tsx` |
| **Component Type** | Client Component |

```
<Tabs defaultValue="edit" className="w-full">
│
├─ <TabsList className="rounded-xl">
│  ├─ <TabsTrigger value="edit">Edit</TabsTrigger>
│  └─ <TabsTrigger value="preview">Preview</TabsTrigger>
│
├─ <TabsContent value="edit">
│  └─ <Textarea
│       className="rounded-xl min-h-[150px] resize-y"
│       value={value}
│       onChange={onChange}
│     />
│
└─ <TabsContent value="preview">
   └─ <div className="prose prose-sm dark:prose-invert min-h-[150px] rounded-xl border p-4">
      └─ <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
   </div>
│
└─ <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
     <Info className="w-3 h-3" /> Markdown formatting supported
   </p>
```

#### MarkdownPreview Props

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `value` | `string` | — | Yes | Current markdown text |
| `onChange` | `(value: string) => void` | — | Yes | Change handler from react-hook-form |

---

## 4. Variant × State Matrix

| State | Visual | Behavior |
|---|---|---|
| Default (pristine) | All fields pre-filled from `defaultValues` | No validation errors shown |
| Editing | Changed fields reflect user input | Validation runs on blur |
| Field Error | `border-destructive` on field + error message below | Focus remains on field |
| Submitting | Submit button disabled + Loader2 spinner | All fields remain visible |
| Server Error | Alert banner at top of form | Form data preserved, user can retry |
| Success | Toast "Profile saved" | `revalidateTag('members')`, optional redirect |
| Name Field | Always disabled/read-only | Grey appearance, "Synced from Discord" note |

### MarkdownPreview Tab States

| State | Edit Tab | Preview Tab |
|---|---|---|
| Empty | Empty textarea with placeholder | "Nothing to preview" message |
| Content | Textarea with markdown source | Rendered HTML with prose styling |
| Error | `border-destructive` on textarea | N/A (preview unaffected) |

---

## 5. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (`< md`) | `px-4 py-8`, card `p-4 rounded-2xl`, full-width fields, submit button full-width |
| Tablet (`md`) | `max-w-2xl mx-auto py-12 px-4`, card `p-8 rounded-[2rem]`, submit right-aligned |
| Desktop (`lg+`) | Same as tablet |

### Mobile Adjustments

- Card padding reduces: `p-8` → `p-4`
- Card border radius: `rounded-[2rem]` → `rounded-2xl`
- Submit button: full-width on mobile, auto-width on tablet+
- Markdown preview: min-height reduced to `min-h-[120px]`

---

## 6. Accessibility

### ARIA

- All form controls linked via shadcn/ui Form's automatic `aria-describedby`
- `aria-invalid="true"` on fields with errors
- `aria-required="true"` on Bio field (the only required editable field)
- Switch: `role="switch"`, `aria-checked`, labeled by FormLabel
- Disabled Name field: `aria-disabled="true"`, `aria-readonly="true"`

### Keyboard

- **Tab**: Navigate between form fields in DOM order
- **Enter**: does NOT submit (multi-field form) — only via Submit button or Enter on button
- **Space**: Toggle Switch
- **Tab in MarkdownPreview**: Tab key inserts character in textarea (standard textarea behavior)

### Screen Reader

- Required field: label includes sr-only "(required)"
- Read-only Name field: description "Synced from Discord" announced
- Server error: Alert with `role="alert"` announced immediately
- Submit loading: sr-only "Saving profile..." alongside spinner
- Success: Sonner toast announced in `aria-live="polite"` region

### Focus Management

- On server error: focus moves to Alert at top of form
- On validation error: focus moves to first invalid field
- On success + redirect: focus managed by navigation

---

## 7. Animation

### Form Card Entrance

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  <Card>...</Card>
</motion.div>
```

### Server Error Alert

```tsx
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  <Alert variant="destructive">...</Alert>
</motion.div>
```

### Submit Button State Transition

```tsx
<AnimatePresence mode="wait">
  {isSubmitting ? (
    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
    </motion.span>
  ) : (
    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      Save Profile
    </motion.span>
  )}
</AnimatePresence>
```

### MarkdownPreview Tab Switch

```tsx
// Use Tabs' built-in transition or:
<TabsContent asChild>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.15 }}
  >
    ...
  </motion.div>
</TabsContent>
```

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Card background | `bg-card` (warm white) | `bg-card` (dark surface) |
| Input background | `bg-background` | `bg-background` (dark) |
| Input border | `border-input` (soft brown) | `border-input` (dark border) |
| Prefix text ("usr_", X icon) | `text-muted-foreground` | `text-muted-foreground` |
| Switch track (on) | `bg-primary` (coral) | `bg-primary` |
| Switch track (off) | `bg-input` | `bg-input` |
| Markdown preview prose | `prose` | `prose-invert` |
| Info tooltip text | `text-muted-foreground` | `text-muted-foreground` |
| Border-t (submit area) | `border-border` | `border-border` (dark) |

No structural or layout changes — only semantic color tokens shift.
