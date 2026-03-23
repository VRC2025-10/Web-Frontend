# Profile Editor

> `/settings/profile` — プロフィール編集ページ

---

## 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/settings/profile` |
| Page Title | Edit Profile \| VRChat October Cohort |
| Next.js File | `app/(public)/settings/profile/page.tsx` |
| Component Type | RSC（Form は Client Component） |
| Auth | Required — Middleware が未認証ユーザーを `/login` にリダイレクト |

---

## 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/internal/me/profile` | SSR no-store | `cache: 'no-store'` | `session_id` (必須) |

```typescript
// app/(public)/settings/profile/page.tsx
async function ProfileEditorPage() {
  const cookieStore = await cookies();
  const res = await fetch(`${API_BASE}/api/v1/internal/me/profile`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    throw new Error('Failed to load profile');
  }

  const profile = await res.json();
  return <ProfileForm defaultValues={profile} />;
}
```

---

## 3. SEO

```typescript
export const metadata: Metadata = {
  title: 'Edit Profile | VRChat October Cohort',
  robots: { index: false, follow: false }, // noindex — private page
};
```

---

## 4. Component Hierarchy

```
<ProfileEditorPage> (RSC)
  └── Container (max-w-2xl mx-auto py-12 px-4)
       ├── h1 "Edit Profile"
       │    className="text-2xl font-bold"
       └── ProfileForm (Client — "use client")
            └── Card (rounded-[2rem] p-8 space-y-8 mt-8)
                 ├── Alert (server error, if any)
                 │    └── AlertDestructive: error.message
                 │
                 ├── FormField: Display Name (read-only)
                 │    ├── Label "Display Name"
                 │    ├── Input (rounded-xl, disabled, value=discord_username)
                 │    └── FormDescription "Discord username is used as display name"
                 │
                 ├── FormField: VRC ID (optional)
                 │    ├── Label "VRC ID"
                 │    ├── Input (rounded-xl, placeholder="usr_xxxxxxxx-xxxx-...")
                 │    └── FormMessage (validation error)
                 │
                 ├── FormField: X/Twitter ID (optional)
                 │    ├── Label "X/Twitter"
                 │    ├── InputWithPrefix (rounded-xl)
                 │    │    ├── Prefix: "@" (text-muted-foreground bg-muted px-3)
                 │    │    └── Input (placeholder="username")
                 │    └── FormMessage
                 │
                 ├── FormField: Bio (Markdown, required for profile publication)
                 │    ├── Label "Bio"
                 │    ├── Tabs (rounded-lg)
                 │    │    ├── Tab "Edit"
                 │    │    │    └── Textarea (rounded-xl min-h-[150px] font-mono text-sm)
                 │    │    └── Tab "Preview"
                 │    │         └── div.prose.prose-warm.max-w-none
                 │    │              └── ReactMarkdown (remarkGfm) — リアルタイムプレビュー
                 │    ├── FormDescription "Markdown supported. Use ## for headings."
                 │    └── FormMessage
                 │
                 ├── FormField: Public toggle
                 │    ├── div (flex items-center justify-between)
                 │    │    ├── div
                 │    │    │    ├── Label "Public Profile"
                 │    │    │    └── p "When enabled, your profile is visible to everyone"
                 │    │    │         className="text-sm text-muted-foreground"
                 │    │    └── Switch
                 │    └── FormMessage
                 │
                 └── SubmitArea (flex justify-end pt-6 border-t border-border)
                      └── Button type="submit" (rounded-full px-8)
                           ├── [idle] "Save"
                           └── [submitting] Loader2 (animate-spin) + "Saving..."
                           disabled={isSubmitting}
```

### Form 実装（react-hook-form + zod）

```typescript
// lib/schemas/profile.ts
const profileSchema = z.object({
  vrc_id: z.string().max(100).optional().or(z.literal('')),
  twitter_id: z
    .string()
    .max(15)
    .regex(/^[a-zA-Z0-9_]*$/, 'Invalid Twitter ID')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(5000).optional().or(z.literal('')),
  is_public: z.boolean(),
});

// components/profile/profile-form.tsx ("use client")
function ProfileForm({ defaultValues }) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      vrc_id: defaultValues?.vrc_id ?? '',
      twitter_id: defaultValues?.twitter_id ?? '',
      bio: defaultValues?.bio ?? '',
      is_public: defaultValues?.is_public ?? false,
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    const result = await updateProfile(data); // Server Action
    if (result?.error) {
      form.setError('root', { message: result.error });
      return;
    }
    toast.success(t('profile.saved'));
  }

  return <Form {...form}>...</Form>;
}
```

### Form 送信フロー

```
1. ユーザーがフィールドを編集
2. クライアント側 zod バリデーション（onBlur ごと）
3. "Save" クリック
4. Server Action: updateProfile(formData)
    ├── zod で再バリデーション
    ├── PUT /api/v1/internal/me/profile (session cookie 付き)
    ├── 成功 → revalidateTag('members'), return { success: true }
    └── 失敗 → return { error: "..." }
5. 成功 → toast "Profile saved"
6. エラー → Alert at form top
```

```typescript
// app/(public)/settings/profile/actions.ts
'use server';

async function updateProfile(data: ProfileFormValues) {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid input' };
  }

  const cookieStore = await cookies();
  const res = await fetch(`${API_BASE}/api/v1/internal/me/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
    },
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { error: body?.message ?? 'Failed to save profile' };
  }

  revalidateTag('members');
  return { success: true };
}
```

### 初回ユーザー

- `/api/v1/auth/discord/me` が `profile: null` を返す場合
- フォームは空のデフォルト値で表示
- Bio は未入力でも保存可能（プロフィール公開時のみ推奨メッセージ表示）

---

## 5. All 5 States

| State | UI |
|---|---|
| **Loading** | Skeleton フォーム: Card shape + 5 フィールドプレースホルダー（h-10 rounded-xl × 5） |
| **Success** | プリフィルされたフォーム |
| **Empty (初回)** | 空のデフォルト値でフォーム表示。Display Name のみ Discord ユーザー名が入る |
| **Validation Error** | 無効なフィールドに赤ボーダー (`border-destructive`) + インラインエラーメッセージ (`text-destructive text-sm`) |
| **Server Error** | フォーム上部に `Alert variant="destructive"`: エラーメッセージ + リロードガイダンス |
| **Stale** | SSR no-store のためキャッシュなし。毎回最新データ |

#### loading.tsx

```
<ProfileEditorLoadingSkeleton>
  └── Container (max-w-2xl mx-auto py-12 px-4)
       ├── Skeleton h-8 w-48 (title)
       └── Card (rounded-[2rem] p-8 space-y-8 mt-8)
            ├── Skeleton h-10 w-full rounded-xl (field 1)
            ├── Skeleton h-10 w-full rounded-xl (field 2)
            ├── Skeleton h-10 w-full rounded-xl (field 3)
            ├── Skeleton h-32 w-full rounded-xl (bio textarea)
            ├── Skeleton h-6 w-48 rounded-full (toggle)
            └── Skeleton h-10 w-24 rounded-full ml-auto (submit)
```

---

## 6. Responsive Layout

| Breakpoint | Layout | Form Width |
|---|---|---|
| **base** | 1カラム、full-width | `w-full px-4` |
| **md+** | 中央揃え | `max-w-2xl mx-auto` |

- Card padding: base `p-6`、md+ `p-8`
- Submit button: 常に右寄せ (`flex justify-end`)
- Bio Tabs: base ではタブが full-width、md+ では auto-width

---

## 7. Accessibility

### Landmarks

- `<main>` (Public Layout)
- Form: `<form aria-label="Edit profile">`

### Heading Hierarchy

```
h1: "Edit Profile"
```

### Keyboard Flow

1. h1
2. Display Name (read-only, Tab でスキップ可能)
3. VRC ID Input
4. X/Twitter Input
5. Bio Tabs → Edit tab → Textarea / Preview tab
6. Public toggle Switch
7. Save button

### ARIA

- 各 FormField: shadcn Form が `aria-describedby` (description) + `aria-invalid` (error) を自動付与
- Switch: `aria-checked`, `aria-label="Public profile toggle"`
- Disabled Input (Display Name): `aria-disabled="true"`
- Submit button loading: `aria-busy="true"` when submitting
- Alert: `role="alert"` on server error

### フォーカス管理

- サーバーエラー時: Alert がマウントされた後、Alert にフォーカスを移動
- バリデーションエラー時: 最初のエラーフィールドにフォーカスを移動
- 保存成功時: toast 通知のみ（フォーカスは移動しない）

---

## 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| Card mount | Page load | Fade in + slide up | `initial={{ opacity: 0, y: 16 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.3 }}` |
| Bio tab switch | Click | Content fade | `AnimatePresence mode="wait"`, crossfade 200ms |
| Save button | Submitting | Loader2 spin | CSS `animate-spin` (Tailwind) |
| Success toast | After save | Slide in from right | Sonner default animation |
| Validation error | On blur | Shake | `animate={{ x: [-4, 4, -4, 4, 0] }}`, `transition={{ duration: 0.3 }}` |

---

## 9. i18n Keys

```
profile.meta.title               — "Edit Profile | VRChat October Cohort"
profile.heading                  — "Edit Profile"
profile.field.displayName        — "Display Name"
profile.field.displayName.desc   — "Discord username is used as display name"
profile.field.vrcId              — "VRC ID"
profile.field.vrcId.placeholder  — "usr_xxxxxxxx-xxxx-..."
profile.field.twitter            — "X/Twitter"
profile.field.twitter.placeholder — "username"
profile.field.bio                — "Bio"
profile.field.bio.desc           — "Markdown supported. Use ## for headings."
profile.field.bio.tabEdit        — "Edit"
profile.field.bio.tabPreview     — "Preview"
profile.field.isPublic           — "Public Profile"
profile.field.isPublic.desc      — "When enabled, your profile is visible to everyone"
profile.submit                   — "Save"
profile.submit.loading           — "Saving..."
profile.saved                    — "Profile saved"
profile.error.generic            — "Failed to save profile"
profile.error.validation         — "Please fix the errors below"
profile.error.twitterId          — "Invalid Twitter ID"
```

---

## 10. Dark Mode

| Element | Light | Dark |
|---|---|---|
| Card background | `bg-card` | 同じトークン |
| Input background | `bg-background` | 同じトークン |
| Disabled Input | `bg-muted` | 同じトークン（muted が dark で調整済み） |
| Bio preview (prose) | `prose-warm` | `dark:prose-invert` + warm tones |
| Alert destructive | `bg-destructive/10 text-destructive` | `dark:bg-destructive/20` |

ページ固有の追加調整なし。
