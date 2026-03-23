# Admin Pages

> `/admin/*` — 管理者ページ群

すべての Admin ページ共通事項:
- **Layout**: AdminSidebar + main（Header / Footer なし）
- **Auth**: SSR no-store + Cookie 必須。RSC で `/api/v1/auth/discord/me` を呼び出しロール検証
- **トーン**: `rounded-xl`（2xl ではない）、控えめなアニメーション（fadeIn のみ、bounce なし）、タイトな余白（`p-4` 〜 `p-6`, `gap-4`）

---

## Common: Admin Layout

```
<AdminLayout> (RSC)
  └── div (flex min-h-screen)
       ├── AdminSidebar
       │    └── → 03-components/layout/admin-sidebar.md
       │    固定サイドナビ (w-64, hidden on mobile → Sheet)
       │    Links:
       │      - Dashboard (/admin) — LayoutDashboard icon
       │      - Users (/admin/users) — Users icon [admin+ only]
       │      - Events (/admin/events) — Calendar icon [admin+ only]
       │      - Galleries (/admin/galleries) — Image icon
       │      - Tags (/admin/tags) — Tag icon [admin+ only]
       │      - Reports (/admin/reports) — Flag icon [admin+ only]
       │      - Clubs (/admin/clubs) — Building2 icon [admin+ only]
       │      - Separator
       │      - Back to site (/) — ExternalLink icon
       └── main (flex-1 overflow-auto p-4 md:p-6)
            └── {children}
```

### Auth check (共通)

```typescript
// app/admin/layout.tsx
async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me || !['staff', 'admin', 'super_admin'].includes(me.role)) {
    redirect('/');
  }
  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={me} />
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
```

---

## 1. Dashboard — `/admin`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/admin` |
| Page Title | Dashboard \| Admin |
| Next.js File | `app/admin/page.tsx` |
| Component Type | RSC |
| Access | Staff+ |

### Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/admin/stats` | SSR no-store | `cache: 'no-store'` | `session_id` |

> **Note**: このエンドポイントはバックエンド追加が必要 → `09-roadmap/backend-requirements.md` 参照

### SEO

```typescript
export const metadata: Metadata = {
  title: 'Dashboard | Admin',
  robots: { index: false, follow: false },
};
```

### Component Hierarchy

```
<AdminDashboard> (RSC)
  ├── h1 "Dashboard" (text-2xl font-bold)
  └── StatsGrid (grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6)
       ├── StatCard: Members
       │    ├── Users icon (text-primary)
       │    ├── Label "Members" (text-sm text-muted-foreground)
       │    └── Value (text-3xl font-bold)
       ├── StatCard: Events
       │    ├── Calendar icon (text-primary)
       │    ├── Label "Events"
       │    └── Value
       ├── StatCard: Gallery Images
       │    ├── Image icon (text-primary)
       │    ├── Label "Gallery Images"
       │    └── Value
       └── StatCard: Pending Reports
            ├── Flag icon (text-destructive)
            ├── Label "Pending Reports"
            └── Value (text-destructive if > 0)
```

StatCard: `Card rounded-xl p-4 md:p-6`

### All 5 States

| State | UI |
|---|---|
| **Success** | 4つの StatCard に数値表示 |
| **Empty** | 各値が 0（0 と表示） |
| **Loading** | Skeleton × 4（h-24 rounded-xl） |
| **Error** | `error.tsx` → retry |
| **Stale** | no-store のためなし |

### Responsive

| Breakpoint | Grid |
|---|---|
| **base** | `grid-cols-1` |
| **sm** | `grid-cols-2` |
| **xl** | `grid-cols-4` |

---

## 2. User Management — `/admin/users`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/admin/users` |
| Page Title | User Management \| Admin |
| Next.js File | `app/admin/users/page.tsx` |
| Component Type | RSC + Client DataTable |
| Access | Admin+ |

### Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/admin/users?page={page}&per_page=20&role={role}&search={q}` | SSR no-store | `cache: 'no-store'` | `session_id` |
| `PATCH /api/v1/internal/admin/users/{id}/role` | Client (mutation) | — | `session_id` |
| `PATCH /api/v1/internal/admin/users/{id}/status` | Client (mutation) | — | `session_id` |

### SEO

```typescript
export const metadata: Metadata = {
  title: 'User Management | Admin',
  robots: { index: false, follow: false },
};
```

### Component Hierarchy

```
<UserManagementPage> (RSC + Client DataTable)
  ├── SectionHeader title="User Management"
  ├── Filters (flex gap-4 mb-4)
  │    ├── RoleFilter: Select (rounded-xl, options: all/member/staff/admin)
  │    └── NameSearch: Input (rounded-xl, Search icon, debounce 300ms)
  └── DataTable
       ├── Columns:
       │    ├── Avatar — next/image (w-8 h-8 rounded-full)
       │    ├── Name — text
       │    ├── Discord Username — text (text-muted-foreground)
       │    ├── Role — RoleBadge (see badge colors below)
       │    ├── Status — StatusBadge
       │    ├── Created — formatted date
       │    └── Actions — DropdownMenu (rounded-xl)
       │         ├── "View Profile" → /members/{id}
       │         ├── "Change Role" (admin only) → RoleChangeDialog
       │         └── "Suspend" (admin only) → ConfirmationDialog
       └── Pagination (built into DataTable)
```

### RoleChangeDialog

```
<Dialog>
  └── DialogContent (rounded-xl max-w-sm)
       ├── DialogHeader
       │    └── DialogTitle "Change Role"
       ├── Select (options: member, staff, admin)
       │    └── Current role pre-selected
       └── DialogFooter
            ├── Button variant="outline" — Cancel
            └── Button variant="default" — Confirm
                 → PATCH /api/v1/internal/admin/users/{id}/role
                 → Success: toast + revalidate
```

### ConfirmationDialog (Suspend)

```
<AlertDialog>
  └── AlertDialogContent (rounded-xl max-w-sm)
       ├── AlertDialogHeader
       │    ├── AlertDialogTitle "Suspend User"
       │    └── AlertDialogDescription "Are you sure? This user will lose access."
       └── AlertDialogFooter
            ├── AlertDialogCancel
            └── AlertDialogAction (variant="destructive")
                 → PATCH /api/v1/internal/admin/users/{id}/status { status: "suspended" }
```

### All 5 States

| State | UI |
|---|---|
| **Success** | DataTable with user rows |
| **Empty** | DataTable empty state: 「No users found」 |
| **Loading** | Skeleton table rows × 5 |
| **Error** | `error.tsx` → retry |
| **Stale** | no-store のためなし |

---

## 3. Gallery Management — `/admin/galleries`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/admin/galleries` |
| Page Title | Gallery Management \| Admin |
| Next.js File | `app/admin/galleries/page.tsx` |
| Component Type | RSC + Client |
| Access | Staff+ |

### Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/admin/galleries?page={page}&per_page=20` | SSR no-store | `cache: 'no-store'` | `session_id` |
| `POST /api/v1/internal/admin/galleries/upload` | Client (mutation) | — | `session_id` |
| `PATCH /api/v1/internal/admin/galleries/{id}/status` | Client (mutation) | — | `session_id` |
| `DELETE /api/v1/internal/admin/galleries/{id}` | Client (mutation) | — | `session_id` |

### Component Hierarchy

```
<GalleryManagementPage> (RSC + Client)
  ├── SectionHeader title="Gallery Management"
  ├── ImageDropzone (Client — "use client")
  │    └── div (border-2 border-dashed border-primary/30 rounded-xl p-8 text-center)
  │         ├── Upload icon (w-12 h-12 text-muted-foreground mx-auto)
  │         ├── "Drop images here or click to upload" (text-muted-foreground mt-4)
  │         ├── "PNG, JPG, WebP up to 10MB" (text-sm text-muted-foreground mt-1)
  │         ├── ClubSelect: Select (which club to upload to)
  │         └── <input type="file" accept="image/*" multiple hidden />
  │         → upload: POST multipart/form-data → show progress bar per file
  │
  └── DataTable
       ├── Columns:
       │    ├── Thumbnail — next/image (w-16 h-12 rounded-lg object-cover)
       │    ├── Filename — text
       │    ├── Uploader — text
       │    ├── Club — text
       │    ├── Status — StatusBadge (pending/approved/rejected)
       │    ├── Date — formatted date
       │    └── Actions — DropdownMenu
       │         ├── "Approve" → PATCH status: "approved"
       │         ├── "Reject" → PATCH status: "rejected"
       │         └── "Delete" → ConfirmationDialog → DELETE
       └── Pagination
```

### All 5 States

| State | UI |
|---|---|
| **Success** | Upload area + DataTable with gallery items |
| **Empty** | DataTable empty state: 「No images uploaded yet」 |
| **Loading** | Skeleton table rows × 5 |
| **Error** | `error.tsx` → retry |
| **Stale** | no-store のためなし |

---

## 4. Event Management — `/admin/events`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/admin/events` |
| Page Title | Event Management \| Admin |
| Next.js File | `app/admin/events/page.tsx` |
| Component Type | RSC + Client DataTable |
| Access | Admin+ |

> **Note**: POST/PUT/DELETE エンドポイントはバックエンド追加が必要

### Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/admin/events?page={page}&per_page=20` | SSR no-store | `cache: 'no-store'` | `session_id` |
| `POST /api/v1/internal/admin/events` | Client (mutation) | — | `session_id` |
| `PUT /api/v1/internal/admin/events/{id}` | Client (mutation) | — | `session_id` |
| `DELETE /api/v1/internal/admin/events/{id}` | Client (mutation) | — | `session_id` |

### Component Hierarchy

```
<EventManagementPage> (RSC + Client DataTable)
  ├── SectionHeader
  │    ├── title="Event Management"
  │    └── Button "Create Event" → EventFormDialog
  └── DataTable
       ├── Columns:
       │    ├── Title — text
       │    ├── Date — formatted date
       │    ├── Status — StatusBadge (published/draft/cancelled)
       │    ├── Tags — Badge × N (flex gap-1)
       │    └── Actions — DropdownMenu
       │         ├── "Edit" → EventFormDialog (pre-filled)
       │         └── "Delete" → ConfirmationDialog
       └── Pagination
```

### EventFormDialog

```
<Dialog>
  └── DialogContent (rounded-xl max-w-lg)
       ├── DialogHeader
       │    └── DialogTitle "Create Event" / "Edit Event"
       ├── Form (react-hook-form + zod)
       │    ├── FormField: Title (Input rounded-xl)
       │    ├── FormField: Description (Textarea rounded-xl min-h-[100px])
       │    ├── FormField: Start time (DateTimePicker)
       │    ├── FormField: End time (DateTimePicker, optional)
       │    ├── FormField: Thumbnail URL (Input rounded-xl)
       │    ├── FormField: VRChat instance link (Input rounded-xl, optional)
       │    ├── FormField: Discord link (Input rounded-xl, optional)
       │    ├── FormField: Tags (MultiSelect)
       │    └── FormField: Status (Select: published/draft)
       └── DialogFooter
            ├── Button variant="outline" — Cancel
            └── Button type="submit" — Save
```

### All 5 States

| State | UI |
|---|---|
| **Success** | SectionHeader + Create button + DataTable |
| **Empty** | DataTable empty state: 「No events created yet」 |
| **Loading** | Skeleton table rows × 5 |
| **Error** | `error.tsx` → retry |
| **Stale** | no-store のためなし |

---

## 5. Tag Management — `/admin/tags`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/admin/tags` |
| Page Title | Tag Management \| Admin |
| Next.js File | `app/admin/tags/page.tsx` |
| Component Type | RSC + Client DataTable |
| Access | Admin+ |

### Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/admin/tags` | SSR no-store | `cache: 'no-store'` | `session_id` |
| `POST /api/v1/internal/admin/tags` | Client (mutation) | — | `session_id` |
| `PUT /api/v1/internal/admin/tags/{id}` | Client (mutation) | — | `session_id` |
| `DELETE /api/v1/internal/admin/tags/{id}` | Client (mutation) | — | `session_id` |

### Component Hierarchy

```
<TagManagementPage> (RSC + Client DataTable)
  ├── SectionHeader
  │    ├── title="Tag Management"
  │    └── Button "Create Tag" → TagFormDialog
  └── DataTable
       ├── Columns:
       │    ├── Tag name — text
       │    ├── Color — chip preview (rounded-full w-6 h-6 + Badge with tag name)
       │    ├── Used by — count (number of events using this tag)
       │    └── Actions — DropdownMenu
       │         ├── "Edit" → TagFormDialog (pre-filled)
       │         └── "Delete" (blocked if used_by > 0) → ConfirmationDialog
       └── (No pagination — tags are expected to be few)
```

### TagFormDialog

```
<Dialog>
  └── DialogContent (rounded-xl max-w-sm)
       ├── DialogHeader
       │    └── DialogTitle "Create Tag" / "Edit Tag"
       ├── Form
       │    ├── FormField: Name (Input rounded-xl)
       │    └── FormField: Color (ColorPicker or preset swatches)
       └── DialogFooter
            ├── Button variant="outline" — Cancel
            └── Button type="submit" — Save
```

### All 5 States

| State | UI |
|---|---|
| **Success** | SectionHeader + Create button + DataTable |
| **Empty** | DataTable empty state: 「No tags created yet」 |
| **Loading** | Skeleton table rows × 3 |
| **Error** | `error.tsx` → retry |
| **Stale** | no-store のためなし |

---

## 6. Report Management — `/admin/reports`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/admin/reports` |
| Page Title | Report Management \| Admin |
| Next.js File | `app/admin/reports/page.tsx` |
| Component Type | RSC + Client DataTable |
| Access | Admin+ |

> **Note**: GET reports, PATCH resolve/dismiss エンドポイントはバックエンド追加が必要

### Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/admin/reports?page={page}&per_page=20` | SSR no-store | `cache: 'no-store'` | `session_id` |
| `PATCH /api/v1/internal/admin/reports/{id}` | Client (mutation) | — | `session_id` |

### Component Hierarchy

```
<ReportManagementPage> (RSC + Client DataTable)
  ├── SectionHeader title="Report Management"
  └── DataTable
       ├── Columns:
       │    ├── Reporter — text (reporter name)
       │    ├── Target Type — Badge (profile/event — typeごとにアイコン付き)
       │    ├── Target — text (target name, truncated)
       │    ├── Reason — text (truncated to 50 chars)
       │    ├── Status — StatusBadge (pending/resolved/dismissed)
       │    ├── Date — formatted date
       │    └── Actions — DropdownMenu
       │         ├── "View target" → link to /members/{id} or /events/{id}
       │         ├── "View full reason" → ReasonDialog
       │         ├── "Resolve" → ConfirmationDialog → PATCH { status: "resolved" }
       │         └── "Dismiss" → ConfirmationDialog → PATCH { status: "dismissed" }
       └── Pagination
```

### All 5 States

| State | UI |
|---|---|
| **Success** | DataTable with report rows |
| **Empty** | DataTable empty state: 「No reports」 + check icon |
| **Loading** | Skeleton table rows × 5 |
| **Error** | `error.tsx` → retry |
| **Stale** | no-store のためなし |

---

## 7. Club Management — `/admin/clubs`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/admin/clubs` |
| Page Title | Club Management \| Admin |
| Next.js File | `app/admin/clubs/page.tsx` |
| Component Type | RSC + Client DataTable |
| Access | Admin+ |

### Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/admin/clubs` | SSR no-store | `cache: 'no-store'` | `session_id` |
| `POST /api/v1/internal/admin/clubs` | Client (mutation) | — | `session_id` |
| `PUT /api/v1/internal/admin/clubs/{id}` | Client (mutation) | — | `session_id` |
| `DELETE /api/v1/internal/admin/clubs/{id}` | Client (mutation) | — | `session_id` |

### Component Hierarchy

```
<ClubManagementPage> (RSC + Client DataTable)
  ├── SectionHeader
  │    ├── title="Club Management"
  │    └── Button "Create Club" → ClubFormDialog
  └── DataTable
       ├── Columns:
       │    ├── Club name — text
       │    ├── Cover — next/image (w-20 h-12 rounded-lg object-cover)
       │    ├── Description — text (truncated to 80 chars)
       │    ├── Created — formatted date
       │    └── Actions — DropdownMenu
       │         ├── "Edit" → ClubFormDialog (pre-filled)
       │         └── "Delete" → ConfirmationDialog
       └── (No pagination — clubs are expected to be few)
```

### ClubFormDialog

```
<Dialog>
  └── DialogContent (rounded-xl max-w-lg)
       ├── DialogHeader
       │    └── DialogTitle "Create Club" / "Edit Club"
       ├── Form (react-hook-form + zod)
       │    ├── FormField: Name (Input rounded-xl)
       │    ├── FormField: Description (Textarea rounded-xl min-h-[80px])
       │    └── FormField: Cover Image URL (Input rounded-xl + preview)
       └── DialogFooter
            ├── Button variant="outline" — Cancel
            └── Button type="submit" — Save
```

### All 5 States

| State | UI |
|---|---|
| **Success** | SectionHeader + Create button + DataTable |
| **Empty** | DataTable empty state: 「No clubs created yet」 |
| **Loading** | Skeleton table rows × 3 |
| **Error** | `error.tsx` → retry |
| **Stale** | no-store のためなし |

---

## Common: Badge Color Definitions

### Role Badge

| Role | Style |
|---|---|
| `super_admin` | `bg-primary text-primary-foreground` |
| `admin` | `bg-primary/15 text-primary` |
| `staff` | `bg-secondary/15 text-secondary-foreground` |
| `member` | `bg-muted text-muted-foreground` |

### Status Badge

| Status | Light | Dark |
|---|---|---|
| `active` | `bg-green-100 text-green-800` | `bg-green-900/30 text-green-400` |
| `suspended` | `bg-red-100 text-red-800` | `bg-red-900/30 text-red-400` |
| `pending` | `bg-yellow-100 text-yellow-800` | `bg-yellow-900/30 text-yellow-400` |
| `approved` | `bg-green-100 text-green-800` | `bg-green-900/30 text-green-400` |
| `rejected` | `bg-red-100 text-red-800` | `bg-red-900/30 text-red-400` |
| `resolved` | `bg-green-100 text-green-800` | `bg-green-900/30 text-green-400` |
| `dismissed` | `bg-muted text-muted-foreground` | 同じトークン |
| `published` | `bg-green-100 text-green-800` | `bg-green-900/30 text-green-400` |
| `draft` | `bg-muted text-muted-foreground` | 同じトークン |
| `cancelled` | `bg-red-100 text-red-800` | `bg-red-900/30 text-red-400` |

---

## Common: Accessibility

### All Admin Pages

- **Landmarks**: `<main>` (Admin Layout), 各ページ `<section aria-labelledby="{page}-heading">`
- **Heading**: 全ページ `h1` あり
- **DataTable**: `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, `<td>`
- **Actions DropdownMenu**: `aria-label="Actions for {item name}"`
- **Dialog**: `role="dialog"`, `aria-modal="true"`, focus trap
- **ConfirmationDialog**: `role="alertdialog"`, destructive action は `variant="destructive"`

### Keyboard Flow (共通)

1. AdminSidebar ナビゲーション（Tab + Enter）
2. Page heading
3. Filters / Create button
4. DataTable rows → Actions DropdownMenu（Enter で開く、Arrow keys で選択）
5. Pagination

---

## Common: Interactions & Animation

Admin ページは**控えめなアニメーション**:

| Element | Trigger | Animation |
|---|---|---|
| Page content | Mount | `fadeIn` only (`initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `duration: 0.2`) |
| DataTable rows | Mount | 一括 fade in (stagger なし) |
| Dialog | Open / Close | Scale + fade (`initial={{ scale: 0.95, opacity: 0 }}`, `duration: 0.15`) |
| Toast (mutation result) | After action | Sonner default |

Bounce / spring アニメーションは Admin では**不使用**。

---

## Common: i18n Keys

```
admin.sidebar.dashboard        — "Dashboard"
admin.sidebar.users            — "User Management"
admin.sidebar.events           — "Event Management"
admin.sidebar.galleries        — "Gallery Management"
admin.sidebar.tags             — "Tag Management"
admin.sidebar.reports          — "Report Management"
admin.sidebar.clubs            — "Club Management"
admin.sidebar.backToSite       — "Back to site"

admin.dashboard.title          — "Dashboard"
admin.dashboard.stats.members  — "Members"
admin.dashboard.stats.events   — "Events"
admin.dashboard.stats.images   — "Gallery Images"
admin.dashboard.stats.reports  — "Pending Reports"

admin.users.title              — "User Management"
admin.users.filter.role        — "Role"
admin.users.filter.search      — "Search by name..."
admin.users.actions.viewProfile — "View Profile"
admin.users.actions.changeRole — "Change Role"
admin.users.actions.suspend    — "Suspend"
admin.users.dialog.changeRole  — "Change Role"
admin.users.dialog.suspend     — "Suspend User"
admin.users.dialog.suspendDesc — "Are you sure? This user will lose access."
admin.users.empty              — "No users found"

admin.events.title             — "Event Management"
admin.events.create            — "Create Event"
admin.events.actions.edit      — "Edit"
admin.events.actions.delete    — "Delete"
admin.events.empty             — "No events created yet"

admin.galleries.title          — "Gallery Management"
admin.galleries.upload.title   — "Drop images here or click to upload"
admin.galleries.upload.hint    — "PNG, JPG, WebP up to 10MB"
admin.galleries.actions.approve — "Approve"
admin.galleries.actions.reject — "Reject"
admin.galleries.actions.delete — "Delete"
admin.galleries.empty          — "No images uploaded yet"

admin.tags.title               — "Tag Management"
admin.tags.create              — "Create Tag"
admin.tags.actions.edit        — "Edit"
admin.tags.actions.delete      — "Delete"
admin.tags.deleteBlocked       — "Cannot delete: tag is in use"
admin.tags.empty               — "No tags created yet"

admin.reports.title            — "Report Management"
admin.reports.actions.viewTarget — "View target"
admin.reports.actions.viewReason — "View full reason"
admin.reports.actions.resolve  — "Resolve"
admin.reports.actions.dismiss  — "Dismiss"
admin.reports.empty            — "No reports"

admin.clubs.title              — "Club Management"
admin.clubs.create             — "Create Club"
admin.clubs.actions.edit       — "Edit"
admin.clubs.actions.delete     — "Delete"
admin.clubs.empty              — "No clubs created yet"

admin.common.confirm           — "Confirm"
admin.common.cancel            — "Cancel"
admin.common.save              — "Save"
admin.common.delete            — "Delete"
admin.common.deleteConfirm     — "Are you sure you want to delete this?"
admin.common.success           — "Saved successfully"
admin.common.error             — "An error occurred"
```

---

## Common: Dark Mode

Admin ページは CSS Variables で自動切り替え。追加調整:

| Element | Note |
|---|---|
| AdminSidebar | `bg-card` → dark で自動切り替え |
| DataTable stripe | `even:bg-muted/50` → dark で自動 |
| Status badges | 上記 Badge Color Definitions 参照（dark 用指定あり） |
| Dialog overlay | `bg-black/60` → dark: `bg-black/70` |
