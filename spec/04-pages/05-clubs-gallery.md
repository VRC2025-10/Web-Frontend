# Clubs & Gallery Pages

> `/clubs` — クラブ一覧 / `/clubs/[id]` — クラブ詳細 + ギャラリー

---

## Part A: Club List — `/clubs`

### 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/clubs` |
| Page Title | Clubs \| VRChat October Cohort |
| Next.js File | `app/(public)/clubs/page.tsx` |
| Component Type | RSC |

### 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/public/clubs` | ISR 60s | `next: { revalidate: 60, tags: ['clubs'] }` | 不要 |

```typescript
async function ClubsPage() {
  const res = await fetch(`${API_BASE}/api/v1/public/clubs`, {
    next: { revalidate: 60, tags: ['clubs'] },
  });
  const clubs = await res.json();
  return <ClubsPageView clubs={clubs.data} />;
}
```

### 3. SEO

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('clubs');
  return {
    title: t('meta.title'),            // "Clubs | VRChat October Cohort"
    description: t('meta.description'), // "VRChat 10月同期会のクラブ一覧"
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
<ClubsPage> (RSC)
  ├── SectionHeader
  │    ├── title="Clubs"
  │    └── description="Explore club activities"
  ├── ClubGrid (motion.div, staggerChildren)
  │    └── ClubCard × N
  │         └── → 03-components/data-display/club-card.md
  │         grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
  └── EmptyState (if 0 clubs)
       └── icon=Building2, message="No clubs yet"
```

### 5. All 5 States

| State | UI |
|---|---|
| **Success** | SectionHeader + ClubCard グリッド |
| **Success (partial)** | クラブが1〜2件 → グリッドが少数列に縮小 |
| **Empty** | EmptyState: Building2 アイコン + 「No clubs yet」 |
| **Loading** | ISR プリレンダリング。ナビゲーション中は `loading.tsx` Skeleton |
| **Error** | `error.tsx` → retry ボタン |
| **Stale** | ISR 60s で stale-while-revalidate |

#### loading.tsx

```
<ClubsLoadingSkeleton>
  ├── SectionHeader (static)
  └── Grid: Skeleton ClubCard × 6 (aspect-[3/2] rounded-2xl)
```

### 6. Responsive Layout

| Breakpoint | Grid Columns |
|---|---|
| **base** | `grid-cols-1` |
| **md** | `grid-cols-2` |
| **lg** | `grid-cols-3` |

コンテナ: `max-w-6xl mx-auto px-4 md:px-8 py-12`

### 7. Accessibility

#### Landmarks

- `<section aria-labelledby="clubs-heading">`

#### Heading Hierarchy

```
h1: "Clubs"
```

#### Keyboard Flow

1. SectionHeader
2. ClubCard × N（Tab → Enter で詳細へ）

#### ARIA

- Grid: `role="list"`, 各 ClubCard: `role="listitem"`
- ClubCard: Link wrapping → フォーカス可能

### 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| ClubCard list | Viewport enter | Stagger fade-in up | Parent: `staggerChildren: 0.06`. Child: `initial={{ opacity: 0, y: 16 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}` |
| ClubCard | Hover | Lift + shadow | `whileHover={{ y: -4 }}`, cover image: `whileHover={{ scale: 1.05 }}` (overflow-hidden) |

### 9. i18n Keys

```
clubs.meta.title              — "Clubs | VRChat October Cohort"
clubs.meta.description        — "VRChat 10月同期会のクラブ一覧"
clubs.heading                 — "Clubs"
clubs.description              — "Explore club activities"
clubs.empty                   — "No clubs yet"
```

### 10. Dark Mode

ページ固有の調整なし。

---

## Part B: Club Detail + Gallery — `/clubs/[id]`

### 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/clubs/[id]` |
| Page Title | `{club.name} \| VRChat October Cohort` |
| Next.js File | `app/(public)/clubs/[id]/page.tsx` |
| Component Type | RSC（Lightbox は Client Component） |

### 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/public/clubs/{id}` | ISR 60s | `next: { revalidate: 60, tags: ['clubs'] }` | 不要 |
| `GET /api/v1/public/clubs/{id}/gallery?per_page=40&page={page}` | ISR 60s | `next: { revalidate: 60, tags: ['galleries'] }` | 不要 |
| `GET /api/v1/auth/discord/me` | SSR no-store | `cache: 'no-store'` | `session_id`（管理者判定用） |

```typescript
async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [club, gallery, me] = await Promise.all([
    fetchClub(id),
    fetchClubGallery(id),
    getMe(),
  ]);

  if (!club) notFound();

  const canUpload = me && ['admin', 'super_admin', 'staff'].includes(me.role);
  return <ClubDetailView club={club} gallery={gallery} canUpload={canUpload} />;
}
```

### 3. SEO

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const club = await fetchClub(id);
  if (!club) return {};

  return {
    title: `${club.name} | VRChat October Cohort`,
    description: club.description?.slice(0, 160) ?? '',
    openGraph: {
      title: club.name,
      description: club.description?.slice(0, 160) ?? '',
      images: club.cover_image_url ? [club.cover_image_url] : ['/og-default.png'],
    },
  };
}
```

### 4. Component Hierarchy

```
<ClubDetailPage> (RSC)
  ├── ClubHeader (relative)
  │    ├── CoverImage
  │    │    └── next/image (h-48 md:h-64 w-full object-cover rounded-b-2xl)
  │    │    → cover_image_url が null: グラデーションフォールバック
  │    │         bg-gradient-to-br from-primary/10 via-secondary/5 to-muted
  │    └── Overlay (absolute inset-0 bg-gradient-to-t from-background/80 to-transparent)
  │         └── div (absolute bottom-0 left-0 p-6 md:p-8)
  │              ├── h1 (text-3xl md:text-4xl font-bold)
  │              │    └── club.name
  │              └── p (text-muted-foreground mt-2 max-w-2xl)
  │                   └── club.description (short excerpt)
  │
  ├── ClubInfo (max-w-5xl mx-auto px-4 md:px-8 py-8)
  │    └── Description (prose prose-warm max-w-none)
  │         └── club.description (full text)
  │
  └── GallerySection (max-w-6xl mx-auto px-4 md:px-8 py-8)
       ├── SectionHeader
       │    ├── title="Gallery"
       │    └── [canUpload] AddPhotosButton
       │         └── Button variant="outline" rounded-2xl (dashed border)
       │              ImagePlus icon + "Add photos" → /admin/galleries?club={id}
       ├── GalleryGrid (Client — Masonry layout)
       │    └── GalleryImage × N
       │         ├── Container (relative rounded-xl overflow-hidden group cursor-pointer)
       │         ├── next/image (object-cover w-full)
       │         ├── HoverOverlay (absolute inset-0)
       │         │    └── div (bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200)
       │         │         └── ZoomIn icon (w-8 h-8 text-white, centered)
       │         └── onClick → opens Lightbox at this image index
       ├── EmptyState (if 0 images)
       │    └── icon=ImageOff, message="No photos yet"
       └── Pagination (if > 40 images)
            └── → 03-components/shared/pagination.md
```

### Masonry Layout 実装

```css
/* CSS Grid Masonry (progressive enhancement) */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  /* CSS Masonry if supported */
  @supports (grid-template-rows: masonry) {
    grid-template-rows: masonry;
  }
}

@media (min-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1024px) {
  .gallery-grid { grid-template-columns: repeat(4, 1fr); }
}
```

- **Masonry サポートあり**: `grid-template-rows: masonry` で自然な段違いレイアウト
- **フォールバック**: 固定アスペクト比（`aspect-square` or `aspect-[3/4]`）のグリッド

### Lightbox

→ 詳細: `03-components/overlay/lightbox.md`

- 画像クリックで全画面 Lightbox オープン
- 左右矢印キーでナビゲーション
- Escape / オーバーレイクリックで閉じる
- ピンチズーム対応（モバイル）

### Admin Upload ヒント

- `canUpload` が true（admin/staff/club leader）の場合:
  - GallerySection ヘッダーに「+ Add photos」ボタンを表示
  - ボーダー: `border-dashed border-primary/50`
  - クリック → `/admin/galleries?club={club.id}` に遷移

### 5. All 5 States

| State | UI |
|---|---|
| **Success** | ClubHeader + ClubInfo + GalleryGrid (images) |
| **Success (partial)** | カバー画像なし → グラデーションフォールバック。ギャラリー0件 → EmptyState。Description なし → ClubInfo 非表示 |
| **Empty** | 該当なし（club が null → `notFound()` で 404） |
| **Loading** | ISR プリレンダリング。ナビゲーション中は `loading.tsx` Skeleton |
| **Error** | `error.tsx` → retry ボタン |
| **Stale** | ISR 60s で stale-while-revalidate |

#### loading.tsx

```
<ClubDetailLoadingSkeleton>
  ├── Skeleton (h-48 md:h-64 w-full rounded-b-2xl) — cover
  ├── Container
  │    └── Skeleton h-4 × 4 lines — description
  └── GallerySection
       ├── Skeleton h-8 w-32 — section title
       └── Grid: Skeleton × 12 (aspect-square rounded-xl)
```

### 6. Responsive Layout

| Breakpoint | Cover Height | Gallery Grid |
|---|---|---|
| **base** | `h-48` | `grid-cols-2` |
| **md** | `h-64` | `grid-cols-3` |
| **lg** | `h-64` | `grid-cols-4` |

- ClubInfo: `max-w-5xl mx-auto`
- GallerySection: `max-w-6xl mx-auto`
- Lightbox: 全画面、全ブレークポイントで同じ

### 7. Accessibility

#### Landmarks

- ClubHeader: `<header>` or `<section aria-label="Club header">`
- GallerySection: `<section aria-labelledby="gallery-heading">`

#### Heading Hierarchy

```
h1: club.name (ClubHeader 内)
  h2: "Gallery" (GallerySection 内)
```

#### Keyboard Flow

1. ClubHeader content
2. ClubInfo description
3. Add photos button (if visible)
4. GalleryImage × N（Tab → Enter で Lightbox オープン）
5. Pagination

#### ARIA

- GalleryImage: `role="button"`, `aria-label="View photo {index}"`, `tabIndex={0}`
- Lightbox: `role="dialog"`, `aria-modal="true"`, `aria-label="Photo viewer"`
- Lightbox navigation: `aria-label="Previous photo"`, `aria-label="Next photo"`
- EmptyState: `role="status"`

### 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| ClubHeader | Mount | Fade in | `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `transition={{ duration: 0.4 }}` |
| GalleryImage list | Viewport enter | Stagger fade-in | Parent: `staggerChildren: 0.03`. Child: `initial={{ opacity: 0, scale: 0.95 }}`, `whileInView={{ opacity: 1, scale: 1 }}`, `viewport={{ once: true }}` |
| GalleryImage hover | Hover | Overlay appear | CSS: `opacity-0 group-hover:opacity-100 transition-opacity duration-200` |
| Lightbox open | Click | Scale + fade from thumbnail | `initial={{ opacity: 0, scale: 0.9 }}`, `animate={{ opacity: 1, scale: 1 }}`, `transition={{ type: "spring", stiffness: 300, damping: 25 }}` |
| Lightbox close | Click/Esc | Fade out | `exit={{ opacity: 0, scale: 0.9 }}`, `transition={{ duration: 0.2 }}` |
| Lightbox slide | Arrow keys | Slide left/right | `AnimatePresence`, `initial={{ x: direction * 100, opacity: 0 }}`, `animate={{ x: 0, opacity: 1 }}` |

### 9. i18n Keys

```
clubs.detail.gallery             — "Gallery"
clubs.detail.addPhotos           — "Add photos"
clubs.detail.gallery.empty       — "No photos yet"
clubs.detail.lightbox.prev       — "Previous photo"
clubs.detail.lightbox.next       — "Next photo"
clubs.detail.lightbox.close      — "Close"
clubs.detail.lightbox.counter    — "{current} / {total}"
clubs.detail.notFound            — "Club not found"
```

### 10. Dark Mode

| Element | Light | Dark |
|---|---|---|
| Cover overlay gradient | `from-background/80` | 同じトークン |
| Gallery hover overlay | `bg-black/40` | `bg-black/60`（暗い背景ではより強いオーバーレイ） |
| Lightbox backdrop | `bg-black/90` | `bg-black/95` |
| ZoomIn icon | `text-white` | `text-white` |

Lightbox の backdrop は dark mode でもほぼ同じ（元々暗い）ため、最小限の調整。
