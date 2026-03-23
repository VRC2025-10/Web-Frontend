# ImageDropzone

> Admin gallery image upload — drag & drop + file picker

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Allow admins to upload multiple images to club galleries via drag-and-drop or file picker |
| **File Path** | `components/features/admin/image-dropzone.tsx` |
| **Component Type** | Client Component (`"use client"`) |
| **Used In** | `/admin/galleries` (admin gallery management page) |
| **When to Use** | Admin gallery image upload flow |
| **When NOT to Use** | Profile avatar upload (separate component), non-image file uploads |

---

## 2. Props / API

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `onFilesSelected` | `(files: File[]) => void` | — | Yes | Callback when valid files are selected/dropped |
| `onFileRemoved` | `(index: number) => void` | — | Yes | Callback when a file is removed from the preview list |
| `files` | `File[]` | `[]` | Yes | Currently selected files (controlled) |
| `maxFiles` | `number` | `10` | No | Maximum number of files allowed at once |
| `maxSizeMB` | `number` | `10` | No | Maximum file size in MB per file |
| `accept` | `string[]` | `["image/png", "image/jpeg", "image/webp"]` | No | Accepted MIME types |
| `disabled` | `boolean` | `false` | No | Disable the dropzone (e.g., during upload) |

### Validation Rules

| Rule | Value | Error Message |
|---|---|---|
| Accepted formats | PNG, JPEG, WebP | "Unsupported format. Use PNG, JPG, or WebP." |
| Max file size | 10 MB per file | "File too large. Maximum size is 10MB." |
| Max file count | 10 files at once | "Too many files. Maximum 10 files at once." |

---

## 3. Visual Structure

### Drop Zone (empty / awaiting files)

```
<div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center
                transition-colors cursor-pointer
                hover:border-primary/50 hover:bg-primary/5"
     role="button"
     tabIndex={0}
     aria-label="Upload images. Drag and drop or click to browse."
     onDragOver → add "border-primary bg-primary/5"
     onDragLeave → remove highlight
     onDrop → validate + onFilesSelected
     onClick → trigger hidden file input
     onKeyDown Enter/Space → trigger hidden file input>
│
├─ <input type="file" hidden multiple accept="image/png,image/jpeg,image/webp"
│         ref={fileInputRef} onChange={handleFileSelect} />
│
├─ <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
├─ <p className="text-base font-medium">Drag & drop images or click to browse</p>
└─ <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
```

### Drag-Over State

```
<div className="border-2 border-dashed border-primary bg-primary/5 rounded-2xl p-8 text-center
                transition-colors cursor-pointer">
  <!-- same content, highlighted appearance -->
</div>
```

### File Preview Grid (after selection)

```
<div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
│
├─ <div className="relative rounded-xl overflow-hidden aspect-square group">
│  ├─ <Image
│  │    src={URL.createObjectURL(file)}
│  │    alt={file.name}
│  │    fill
│  │    className="object-cover"
│  │  />
│  ├─ <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
│  └─ <Button
│       variant="destructive"
│       size="icon"
│       className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
│       onClick={() => onFileRemoved(index)}
│       aria-label={`Remove ${file.name}`}>
│     <X className="w-4 h-4" />
│  </Button>
│
├─ ... (repeat for each file)
│
└─ {files.length < maxFiles && (
     <div className="border-2 border-dashed border-muted rounded-xl aspect-square
                     flex items-center justify-center cursor-pointer hover:border-primary/50"
          onClick → open file picker>
       <Plus className="w-8 h-8 text-muted-foreground" />
     </div>
   )}
```

---

## 4. Variant × State Matrix

| State | Drop Zone | Preview Grid | Actions |
|---|---|---|---|
| Empty | Visible, default styling | Hidden | Click/drop to add |
| Drag-over | Highlighted: `border-primary bg-primary/5` | Hidden | Release to drop |
| Has files | Still visible (if < max) | Visible with thumbnails | Remove individual, add more |
| Max files reached | Hidden or disabled | Visible | Remove to add more |
| Disabled (uploading) | `opacity-50 cursor-not-allowed pointer-events-none` | Visible, remove buttons hidden | Wait for upload |
| File rejected | Brief red flash on dropzone border | N/A | Toast error shown |

---

## 5. Responsive Behavior

| Breakpoint | Preview Grid | Drop Zone |
|---|---|---|
| Mobile (`< md`) | `grid-cols-3` | `p-6`, smaller icon (`w-8 h-8`) |
| Tablet (`md`) | `grid-cols-4` | `p-8`, standard |
| Desktop (`lg+`) | `grid-cols-4` | `p-8`, standard |

### Mobile Adjustments

- Remove button always visible on mobile (no hover state on touch)
- Drop zone text simplified: "Tap to upload images"
- File input opens device camera/gallery picker on mobile

---

## 6. Accessibility

### ARIA

- Drop zone: `role="button"`, `tabIndex={0}`, `aria-label="Upload images. Drag and drop or click to browse."`
- Hidden file input: `aria-hidden="true"` (interacted via dropzone proxy)
- Each preview image: descriptive `alt={file.name}`
- Remove button: `aria-label="Remove {filename}"`
- When disabled: `aria-disabled="true"` on dropzone

### Keyboard

- **Tab**: Focus dropzone, then individual remove buttons
- **Enter / Space**: On dropzone → opens file picker
- **Enter / Space**: On remove button → removes file
- **Escape**: Does not clear selections (prevent accidental loss)

### Screen Reader

- After file selection: announce "{count} files selected" via `aria-live="polite"` region
- On file removal: announce "{filename} removed" via `aria-live="polite"`
- On rejection: Toast announces error message
- File list: each item announces filename and size

### Focus Management

- After file selection via picker: focus returns to drop zone
- After file removal: focus moves to next file's remove button, or drop zone if none remain

---

## 7. Animation

### Drop Zone Drag-Over Transition

```tsx
// CSS transition (no Framer Motion needed)
// transition-colors class handles border + background color shift
```

### File Preview Entrance

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ duration: 0.2 }}
  className="relative rounded-xl overflow-hidden aspect-square"
>
  ...
</motion.div>
```

### File Removal

```tsx
<AnimatePresence>
  {files.map((file, i) => (
    <motion.div
      key={file.name + file.size}
      layout
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      ...
    </motion.div>
  ))}
</AnimatePresence>
```

### Rejection Shake

```tsx
// On invalid file drop, briefly shake the dropzone:
<motion.div
  animate={isRejected ? { x: [-4, 4, -4, 4, 0] } : {}}
  transition={{ duration: 0.3 }}
>
  {/* dropzone content */}
</motion.div>
```

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Drop zone border | `border-primary/30` | `border-primary/20` |
| Drop zone hover bg | `bg-primary/5` | `bg-primary/10` |
| Icon color | `text-muted-foreground` | `text-muted-foreground` |
| Preview overlay on hover | `bg-black/20` | `bg-black/40` |
| Remove button | `destructive` variant (unchanged) | `destructive` variant |
| "Add more" dashed border | `border-muted` | `border-muted` |
| Text colors | `text-muted-foreground` | `text-muted-foreground` |

No structural changes — only token-level color adjustments.
