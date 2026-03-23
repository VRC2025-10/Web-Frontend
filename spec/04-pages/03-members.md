# Members Pages

> `/members` — メンバー一覧 / `/members/[id]` — プロフィール詳細

---

## Part A: Member List — `/members`

### 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/members` |
| Page Title | Members \| VRChat October Cohort |
| Next.js File | `app/(public)/members/page.tsx` |
| Component Type | RSC（検索は Client Component） |

### 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/public/members?page={page}&per_page=24` | ISR 60s | `next: { revalidate: 60, tags: ['members'] }` | 不要 |
| `GET /api/v1/public/members?search={q}` | Client fetch | No cache (SWR / useEffect) | 不要 |

```typescript
// app/(public)/members/page.tsx
async function MembersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = params.page ?? '1';

  const res = await fetch(
    `${API_BASE}/api/v1/public/members?page=${page}&per_page=24`,
    { next: { revalidate: 60, tags: ['members'] } }
  );
  const data = await res.json();
  return <MembersPageView initialData={data} />;
}
```

### Client-side 検索

```typescript
// components/members/member-search.tsx ("use client")
function MemberSearch({ onResults }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) { onResults(null); return; }
    fetch(`/api/v1/public/members?search=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => onResults(data));
  }, [debouncedQuery]);

  // ...
}
```

- デバウンス: 300ms
- 検索中: ISR のグリッドを検索結果に差し替え、ページネーション非表示
- 検索クリア: ISR データに復帰

### 3. SEO

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('members');
  return {
    title: t('meta.title'),            // "Members | VRChat October Cohort"
    description: t('meta.description'), // "VRChat 10月同期会のメンバー一覧"
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      images: ['/og-default.png'],
    },
  };
}
```

### 4. Component Hierarchy

```
<MembersPage> (RSC)
  ├── SectionHeader
  │    └── title="Members"
  ├── MemberSearch (Client — "use client")
  │    └── Input (rounded-xl, Search icon prefix, placeholder="Search members...")
  │         className="max-w-md"
  ├── MemberGrid (motion.div, staggerChildren)
  │    └── MemberCard × N
  │         └── → 03-components/data-display/member-card.md
  │         grid: grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6
  ├── EmptyState (if 0 results)
  │    └── icon=UserX, message="No members found"
  └── Pagination (?page=N, hidden during search)
       └── → 03-components/shared/pagination.md
```

### 5. All 5 States

| State | UI |
|---|---|
| **Success** | 検索バー + メンバーカードグリッド + ページネーション |
| **Success (partial)** | 検索結果が少数 → グリッドが1〜2行に縮小 |
| **Empty** | EmptyState: UserX アイコン + 「No members found」 |
| **Loading** | ISR 初回はビルド時生成。ナビゲーション中は `loading.tsx` Skeleton。検索中は inline Spinner |
| **Error** | `error.tsx` → 「Failed to load members」+ retry |
| **Stale** | ISR 60s で stale-while-revalidate |

#### loading.tsx (Member List)

```
<MembersLoadingSkeleton>
  ├── SectionHeader (static)
  ├── Skeleton Input (h-10 max-w-md rounded-xl)
  ├── Grid: Skeleton MemberCard × 12 (aspect-square rounded-2xl)
  └── Skeleton Pagination
```

### 6. Responsive Layout

| Breakpoint | Grid Columns | Card Size |
|---|---|---|
| **base** | `grid-cols-2` | コンパクト |
| **sm** | `grid-cols-3` | 中 |
| **md** | `grid-cols-4` | 中 |
| **lg** | `grid-cols-5` | フル |
| **xl** | `grid-cols-5` | フル |

コンテナ: `max-w-6xl mx-auto px-4 md:px-8 py-12`

### 7. Accessibility

#### Landmarks

- `<section aria-labelledby="members-heading">`

#### Heading Hierarchy

```
h1: "Members"
```

#### Keyboard Flow

1. SectionHeader
2. Search Input（type to search）
3. MemberCard × N（Tab → Enter でプロフィールへ）
4. Pagination

#### ARIA

- Search Input: `role="searchbox"`, `aria-label="Search members"`
- Grid: `role="list"` on container, `role="listitem"` on each card
- Empty state: `role="status"`, `aria-live="polite"`
- Search results: `aria-live="polite"` で検索結果数をアナウンス

### 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| MemberCard list | Viewport enter | Stagger fade-in | Parent: `staggerChildren: 0.03`. Child: `initial={{ opacity: 0, scale: 0.95 }}`, `whileInView={{ opacity: 1, scale: 1 }}`, `viewport={{ once: true }}` |
| MemberCard | Hover | Lift + glow | `whileHover={{ y: -4 }}`, `transition={{ type: "spring", stiffness: 300, damping: 20 }}` |
| Search results | Query change | Fade swap | `AnimatePresence mode="wait"`, `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}` |

### 9. i18n Keys

```
members.meta.title              — "Members | VRChat October Cohort"
members.meta.description        — "VRChat 10月同期会のメンバー一覧"
members.heading                 — "Members"
members.search.placeholder      — "Search members..."
members.search.noResults        — "No members found"
members.empty                   — "No members yet"
members.pagination.prev         — "Previous"
members.pagination.next         — "Next"
```

### 10. Dark Mode

ページ固有の調整なし。CSS Variables による自動切り替え。

---

## Part B: Profile Detail — `/members/[id]`

### 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/members/[id]` |
| Page Title | `{member.name} \| VRChat October Cohort` |
| Next.js File | `app/(public)/members/[id]/page.tsx` |
| Component Type | RSC |

### 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/public/members/{id}` | ISR 60s | `next: { revalidate: 60, tags: ['members'] }` | 不要 |
| `GET /api/v1/auth/discord/me` | SSR no-store | `cache: 'no-store'` | `session_id`（自分のプロフィール判定 + 通報ボタン表示制御） |

```typescript
async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await fetchMember(id);
  if (!member) notFound();

  const me = await getMe(); // null if not logged in
  const isOwnProfile = me?.id === member.id;
  return <ProfileDetailView member={member} me={me} isOwnProfile={isOwnProfile} />;
}
```

### 3. SEO

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const member = await fetchMember(id);
  if (!member) return {};

  return {
    title: `${member.name} | VRChat October Cohort`,
    description: member.bio_summary?.slice(0, 160) ?? '',
    openGraph: {
      title: member.name,
      description: member.bio_summary?.slice(0, 160) ?? '',
      images: member.avatar_url ? [member.avatar_url] : ['/og-default.png'],
    },
  };
}
```

### 4. Component Hierarchy

```
<ProfileDetailPage> (RSC)
  ├── BackButton
  │    └── Button variant="ghost" size="sm" → /members
  │         "← Back to members"
  └── TwoColumnLayout (flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto mt-12 px-4)
       ├── LeftColumn (lg:w-1/3)
       │    └── ProfileCard (Card rounded-[2rem] p-8 text-center sticky top-24)
       │         ├── Avatar
       │         │    └── next/image (w-40 h-40 rounded-full border-4 border-background mx-auto)
       │         │    → avatar_url が null の場合: UserCircle アイコン (bg-muted)
       │         ├── Name (text-2xl font-bold mt-4)
       │         │    └── member.name
       │         ├── ShortBio (text-muted-foreground mt-2 text-sm)
       │         │    └── bio テキストの最初の段落（## の前まで）
       │         ├── SnsLinks (flex justify-center gap-4 mt-6)
       │         │    ├── X/Twitter: Button variant="outline" rounded-full size="icon"
       │         │    │    └── <a> target="_blank" rel="noopener noreferrer"
       │         │    │         Twitter/X アイコン (Lucide)
       │         │    └── VRC ID: Badge (rounded-full bg-muted text-muted-foreground)
       │         │         → VRC ID が設定されていない場合は非表示
       │         └── EditButton (own profile only)
       │              └── Button variant="outline" rounded-2xl w-full mt-6
       │                   "Edit Profile" → /settings/profile
       │
       └── RightColumn (lg:w-2/3)
            └── BioSection (Card rounded-[2rem] p-8)
                 ├── SectionTitle "About" (text-xl font-bold)
                 ├── BioContent
                 │    └── div.prose.prose-warm.max-w-none
                 │         └── dangerouslySetInnerHTML={{ __html: member.bio_html }}
                 └── ReportButton (logged in, not own profile)
                      └── Button variant="ghost" size="sm" text-muted-foreground mt-6
                           Flag icon + "Report"
                           → opens ReportDialog
```

### Private Profile 処理

- `/members` 一覧: プライベートプロフィールは **API がフィルタリングして返さない**
- `/members/[id]` 直接アクセス:
  - API が `is_public: false` のプロフィールに対して制限付きレスポンス（name のみ）を返す
  - UI: 名前のみ表示 + 「This profile is private」メッセージ
  - bio、SNS リンク、アバター以外の情報は非表示

```
<PrivateProfileView>
  └── Container (text-center py-24)
       ├── Lock icon (w-16 h-16 text-muted-foreground/60 mx-auto)
       ├── Name (text-2xl font-bold mt-4)
       ├── "This profile is private" (text-muted-foreground mt-2)
       └── BackButton → /members
```

### 5. All 5 States

| State | UI |
|---|---|
| **Success** | 2カラム: ProfileCard + BioSection |
| **Success (partial)** | Bio なし → BioSection に「No bio yet」。SNS なし → SnsLinks 非表示。アバターなし → デフォルトアイコン |
| **Empty** | 該当なし（member が null → `notFound()` で 404） |
| **Loading** | ISR でプリレンダリング。ナビゲーション中は `loading.tsx` Skeleton |
| **Error** | `error.tsx` → retry ボタン |
| **Stale** | ISR 60s で stale-while-revalidate |

#### loading.tsx (Profile Detail)

```
<ProfileDetailLoadingSkeleton>
  ├── BackButton (static)
  └── TwoColumnLayout
       ├── LeftColumn
       │    └── Card: Skeleton circle (w-40 h-40) + Skeleton lines × 3
       └── RightColumn
            └── Card: Skeleton h-4 × 12 lines
```

### 6. Responsive Layout

| Breakpoint | Layout | ProfileCard |
|---|---|---|
| **base** | 1カラム (`flex-col`) | `sticky` なし、上部に表示 |
| **lg+** | 2カラム (`flex-row`) | `lg:w-1/3`, `sticky top-24` |

- Avatar: 全ブレークポイントで `w-40 h-40`
- BioSection: base で `w-full`、lg+ で `lg:w-2/3`

### 7. Accessibility

#### Landmarks

- ProfileCard: `<aside aria-label="Profile summary">`
- BioSection: `<article aria-label="About {member.name}">`

#### Heading Hierarchy

```
h1: member.name (ProfileCard 内)
  h2: "About" (BioSection 内)
```

#### Keyboard Flow

1. BackButton
2. SNS リンク（Tab → Enter で外部リンク）
3. Edit Profile ボタン（own profile の場合）
4. Bio content
5. Report ボタン

#### ARIA

- Avatar: `alt="{member.name}"` on image
- SNS links: `aria-label="X/Twitter profile of {member.name}"`, `target="_blank"` に `rel="noopener noreferrer"`
- Edit button: テキストラベルで十分
- Report button: `aria-label="Report this profile"`
- Private profile: `role="status"` on message

### 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| Page enter | Mount | Fade in + slide up | `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.4 }}` |
| ProfileCard | Mount | Scale in | `initial={{ scale: 0.95, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}`, `transition={{ delay: 0.1 }}` |
| SNS link buttons | Hover | Scale | `whileHover={{ scale: 1.1 }}` |
| Edit Profile button | Hover | Scale bounce | `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}` |

### 9. i18n Keys

```
members.detail.backButton        — "← Back to members"
members.detail.about             — "About"
members.detail.editProfile       — "Edit Profile"
members.detail.report            — "Report"
members.detail.noBio             — "No bio yet"
members.detail.private.title     — "This profile is private"
members.detail.private.message   — "This member has set their profile to private."
members.detail.sns.twitter       — "X/Twitter"
members.detail.sns.vrcId         — "VRC ID"
```

### 10. Dark Mode

| Element | Light | Dark |
|---|---|---|
| Avatar border | `border-background` | 同じトークン |
| ProfileCard background | `bg-card` | 同じトークン |
| Private profile Lock icon | `text-muted-foreground/60` | 同じトークン |

ページ固有の追加調整なし。
