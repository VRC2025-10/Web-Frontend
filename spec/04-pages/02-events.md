# Events Pages

> `/events` — イベント一覧 / `/events/[id]` — イベント詳細

---

## Part A: Event List — `/events`

### 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/events` |
| Page Title | Events \| VRChat October Cohort |
| Next.js File | `app/(public)/events/page.tsx` |
| Component Type | RSC (Filters は Client Component) |

### 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/public/events?status={status}&tags={ids}&sort={sort}&page={page}&per_page=12` | SSR | `cache: 'no-store'`（URL query に依存するため） | 不要 |

URL search params が fetch パラメータを駆動する:

```typescript
// app/(public)/events/page.tsx
type SearchParams = {
  status?: 'upcoming' | 'past';
  tags?: string;       // comma-separated IDs: "1,2,3"
  sort?: 'date_asc' | 'date_desc' | 'title';
  page?: string;
};

async function EventsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.tags) query.set('tags', params.tags);
  if (params.sort) query.set('sort', params.sort);
  query.set('page', params.page ?? '1');
  query.set('per_page', '12');

  const res = await fetch(`${API_BASE}/api/v1/public/events?${query}`, {
    cache: 'no-store',
  });
  const data = await res.json();
  // ...
}
```

### 3. SEO

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('events');
  return {
    title: t('meta.title'),           // "Events | VRChat October Cohort"
    description: t('meta.description'), // "VRChat 10月同期会のイベント一覧"
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
<EventsPage> (RSC)
  ├── SectionHeader
  │    └── title="Events"
  ├── EventFilters (Client — "use client")
  │    ├── Tabs (rounded-full style)
  │    │    ├── "Upcoming" — ?status=upcoming (default)
  │    │    └── "Past" — ?status=past
  │    │    → URL更新: router.push with updated searchParams
  │    ├── TagChips (flex flex-wrap gap-2)
  │    │    └── Toggle chips × N (rounded-full, bg-secondary/15 when active)
  │    │    → URL更新: ?tags=1,2,3 (comma-separated)
  │    └── SortSelect (shadcn Select, rounded-xl)
  │         ├── "Date (newest)" — ?sort=date_desc (default)
  │         ├── "Date (oldest)" — ?sort=date_asc
  │         └── "Title" — ?sort=title
  │         → URL更新: ?sort=date_desc
  ├── EventList (motion.div, staggerChildren)
  │    └── EventCard × N
  │         └── → 03-components/data-display/event-card.md
  ├── EmptyState (if 0 results)
  │    └── icon=CalendarX, message="No events found"
  └── Pagination
       └── → 03-components/shared/pagination.md
       → URL更新: ?page=N
```

### Filter UX

- **すべてのフィルタは URL search params で管理**（コンポーネントの State ではない）
- メリット: フィルタ結果が共有可能、ブラウザの戻る/進むが動作する
- フィルタ変更時は `page` を `1` にリセット
- `useRouter().push()` で URL 更新（`scroll: false` でスクロール位置を維持）
- Tags データは RSC で `GET /api/v1/public/tags` をフェッチして EventFilters に渡す

### 5. All 5 States

| State | UI |
|---|---|
| **Success** | フィルタ + イベントカードグリッド + ページネーション |
| **Success (partial)** | 一部のフィルタで結果が少ない場合、グリッドが1〜2列に縮小 |
| **Empty** | EmptyState: CalendarX アイコン + 「No events found」 + フィルタリセットリンク |
| **Loading** | SSR のため HTML はサーバーで生成。ナビゲーション中は Next.js の `loading.tsx` で Skeleton 表示 |
| **Error** | `error.tsx` → 「Failed to load events」+ retry ボタン |
| **Stale** | SSR のためキャッシュなし。毎回最新データ |

#### loading.tsx (Event List)

```
<EventsLoadingSkeleton>
  ├── SectionHeader (static)
  ├── Filters area: Skeleton (h-10 w-full rounded-xl)
  ├── Grid: Skeleton EventCard × 6 (aspect-[4/3] rounded-2xl)
  └── Pagination: Skeleton (h-10 w-64 mx-auto rounded-xl)
```

### 6. Responsive Layout

| Breakpoint | Event Grid | Filters |
|---|---|---|
| **base** | `grid-cols-1` | Tabs: 横スクロール, Tags: 折り返し, Sort: full-width |
| **sm** | `grid-cols-1` | 同上 |
| **md** | `grid-cols-2` | Tabs + Tags inline, Sort 右寄せ |
| **lg** | `grid-cols-3` | 全フィルタ1行に収まる |
| **xl** | `grid-cols-3` | 同上 |

コンテナ: `max-w-6xl mx-auto px-4 md:px-8 py-12`

### 7. Accessibility

#### Landmarks

- `<section aria-labelledby="events-heading">`

#### Heading Hierarchy

```
h1: "Events"
```

#### Keyboard Flow

1. SectionHeader
2. Tabs（Tab / Arrow keys で切り替え）
3. TagChips（各 Toggle ボタンに Tab フォーカス）
4. SortSelect（Enter で開く、Arrow keys で選択）
5. EventCard × N（Tab → Enter で詳細へ）
6. Pagination（Tab → Enter でページ切り替え）

#### ARIA

- Tabs: `role="tablist"`, 各タブ `role="tab"`, `aria-selected`
- TagChips: `aria-pressed` (toggle button)
- SortSelect: shadcn の Select コンポーネントが ARIA を自動付与
- Pagination: `nav` + `aria-label="Pagination"`

### 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| EventCard list | Viewport enter | Stagger fade-in up | Parent: `staggerChildren: 0.05`. Child: `initial={{ opacity: 0, y: 16 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}` |
| EventCard | Hover | Lift + shadow | `whileHover={{ y: -4 }}`, `transition={{ type: "spring", stiffness: 300, damping: 20 }}` |
| Tab switch | Click | URL更新 → SSR re-render（Next.js ナビゲーション） |
| Filter change | Click | URL更新 → ページ遷移（`loading.tsx` Skeleton を一瞬表示） |

### 9. i18n Keys

```
events.meta.title             — "Events | VRChat October Cohort"
events.meta.description       — "VRChat 10月同期会のイベント一覧"
events.heading                — "Events"
events.filter.upcoming        — "Upcoming"
events.filter.past            — "Past"
events.filter.sort.dateDesc   — "Date (newest)"
events.filter.sort.dateAsc    — "Date (oldest)"
events.filter.sort.title      — "Title"
events.empty                  — "No events found"
events.empty.resetFilters     — "Reset filters"
events.pagination.prev        — "Previous"
events.pagination.next        — "Next"
```

### 10. Dark Mode

ページ固有の調整なし。CSS Variables による自動切り替え。

---

## Part B: Event Detail — `/events/[id]`

### 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/events/[id]` |
| Page Title | `{event.title} \| VRChat October Cohort` |
| Next.js File | `app/(public)/events/[id]/page.tsx` |
| Component Type | RSC |

### 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/public/events/{id}` | ISR 60s | `next: { revalidate: 60, tags: ['events'] }` | 不要 |
| `GET /api/v1/auth/discord/me` | SSR no-store | `cache: 'no-store'` | `session_id` (ログイン判定用) |

```typescript
// app/(public)/events/[id]/page.tsx
async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await fetchEvent(id); // ISR 60s
  if (!event) notFound();

  const me = await getMe(); // no-store, optional (null if not logged in)
  return <EventDetailView event={event} me={me} />;
}
```

Auth チェック: RSC で `/auth/me` を呼び出し、ユーザーがログイン中かどうかを判定（Report ボタンの表示制御）。

### 3. SEO

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) return {};

  return {
    title: `${event.title} | VRChat October Cohort`,
    description: event.description_plain?.slice(0, 160) ?? '',
    openGraph: {
      title: event.title,
      description: event.description_plain?.slice(0, 160) ?? '',
      images: event.thumbnail_url ? [event.thumbnail_url] : ['/og-default.png'],
    },
  };
}
```

### 4. Component Hierarchy

```
<EventDetailPage> (RSC)
  ├── BackButton
  │    └── Button variant="ghost" size="sm" → /events
  │         "← Back to events"
  └── TwoColumnLayout (grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8 px-4)
       ├── MainColumn (lg:col-span-2)
       │    ├── h1 (text-3xl md:text-4xl font-bold tracking-tight)
       │    │    └── event.title
       │    ├── DateBadge (inline-flex items-center gap-2 mt-4)
       │    │    ├── Calendar icon (w-4 h-4 text-muted-foreground)
       │    │    └── span (bg-secondary/15 text-secondary-foreground rounded-lg px-3 py-1.5 text-sm)
       │    │         └── formatted date: "2025年10月15日 21:00 〜 23:00"
       │    ├── Thumbnail (mt-6)
       │    │    └── next/image (aspect-video rounded-2xl object-cover w-full)
       │    │    → event.thumbnail_url が null の場合は非表示
       │    ├── TagChips (flex flex-wrap gap-1.5 mt-4)
       │    │    └── Badge × N (rounded-full bg-muted text-muted-foreground text-xs px-2.5 py-0.5)
       │    └── Description (mt-8)
       │         └── div.prose.prose-warm.max-w-none
       │              └── dangerouslySetInnerHTML={{ __html: event.description_html }}
       │              ※ バックエンドで sanitize 済みの HTML を使用
       │
       └── SidebarColumn (lg:col-span-1)
            └── Card (rounded-2xl p-6 sticky top-24)
                 ├── JoinSection
                 │    ├── [upcoming] event.start_time > now:
                 │    │    └── Button disabled rounded-2xl w-full
                 │    │         "Please wait for the event"
                 │    ├── [ongoing] event.start_time <= now <= event.end_time:
                 │    │    ├── Button (Primary) rounded-2xl w-full → VRChat instance link
                 │    │    │    "Join in VRChat"
                 │    │    └── Button (Secondary) rounded-2xl w-full mt-3 → Discord link
                 │    │         "Join Discord Voice"
                 │    └── [past] event.end_time < now:
                 │         └── p (text-muted-foreground text-center py-4)
                 │              "This event has ended"
                 │
                 ├── Separator (my-4)
                 │
                 ├── InstanceInfo (if event.location)
                 │    ├── MapPin icon (w-4 h-4 text-muted-foreground)
                 │    └── span (text-sm) event.location
                 │
                 ├── Separator (my-4, if logged in and not own event)
                 │
                 └── ReportButton (logged-in only, not for own events)
                      └── Button variant="ghost" size="sm" text-muted-foreground
                           Flag icon + "Report"
                           → opens ReportDialog (→ 03-components/overlay/report-dialog.md)
```

### Event Status 判定ロジック

```typescript
function getEventStatus(event: Event): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = event.end_time ? new Date(event.end_time) : null;

  if (now < start) return 'upcoming';
  if (end && now > end) return 'past';
  // No end_time: consider ongoing for 24h after start
  if (!end && now.getTime() - start.getTime() > 24 * 60 * 60 * 1000) return 'past';
  return 'ongoing';
}
```

### 5. All 5 States

| State | UI |
|---|---|
| **Success** | 2カラムレイアウト: メイン（タイトル + 日付 + 画像 + タグ + 説明）+ サイドバー（参加ボタン + 場所 + 通報） |
| **Success (partial)** | サムネイルなし → サムネイル領域非表示。場所なし → InstanceInfo 非表示。タグなし → TagChips 非表示 |
| **Empty** | 該当なし（event が null の場合は `notFound()` で 404） |
| **Loading** | ISR のため、初回ビルド後はキャッシュから即座配信。ナビゲーション中は `loading.tsx` |
| **Error** | `error.tsx` キャッチ → retry ボタン |
| **Stale** | ISR 60s revalidation で stale-while-revalidate |

#### loading.tsx (Event Detail)

```
<EventDetailLoadingSkeleton>
  ├── BackButton (static)
  └── TwoColumnLayout
       ├── MainColumn
       │    ├── Skeleton h-10 w-3/4 (title)
       │    ├── Skeleton h-6 w-48 mt-4 (date)
       │    ├── Skeleton aspect-video rounded-2xl mt-6 (thumbnail)
       │    └── Skeleton h-4 × 8 lines mt-8 (description)
       └── SidebarColumn
            └── Skeleton Card h-48 rounded-2xl
```

#### Not Found

`notFound()` を呼び出し → グローバル `not-found.tsx`（→ 08-error-pages.md）。

### 6. Responsive Layout

| Breakpoint | Layout | Sidebar |
|---|---|---|
| **base** | 1カラム | カード下部に表示（sticky なし） |
| **lg+** | `grid-cols-3` | 右カラム `col-span-1`, `sticky top-24` |

- Title: `text-3xl` (base), `text-4xl` (md+)
- Thumbnail: 常に `w-full aspect-video`
- Sidebar Card: base では `sticky` なし、lg+ では `sticky top-24`

### 7. Accessibility

#### Landmarks

- `<article>` for event content
- Sidebar: `<aside aria-label="Event actions">`

#### Heading Hierarchy

```
h1: event.title
```

#### Keyboard Flow

1. BackButton
2. Event content (read flow)
3. VRChat Join / Discord Join button
4. Report button

#### ARIA

- BackButton: `aria-label="Back to events list"`
- JoinSection buttons: 明確なテキストラベル
- Disabled button: `aria-disabled="true"`, reason text visible
- ReportButton: `aria-label="Report this event"`
- Description HTML: `role="document"` (markdown content)

### 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| Page enter | Mount | Fade in | `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `transition={{ duration: 0.3 }}` |
| Sidebar Card | Scroll | Sticky on lg+ | CSS `sticky top-24` (no Framer) |
| Join buttons | Hover | Scale | `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}` |
| Report Dialog | Open | Scale + fade | → 03-components/overlay/report-dialog.md |

### 9. i18n Keys

```
events.detail.backButton          — "← Back to events"
events.detail.join.upcoming       — "Please wait for the event"
events.detail.join.vrchat         — "Join in VRChat"
events.detail.join.discord        — "Join Discord Voice"
events.detail.join.ended          — "This event has ended"
events.detail.location            — "Location"
events.detail.report              — "Report"
events.detail.notFound            — "Event not found"
```

### 10. Dark Mode

| Element | Light | Dark |
|---|---|---|
| DateBadge background | `bg-secondary/15` | 同じトークン（secondary が dark で調整済み） |
| Tag chips | `bg-muted` | 同じトークン |
| Sidebar Card | `bg-card` | 同じトークン |
| Description prose | `prose-warm` variant | `dark:prose-invert` + warm tones |

ページ固有の追加調整なし。
