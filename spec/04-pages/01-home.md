# Home Page

> `/` — VRChat 10月同期会のランディングページ

---

## 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/` |
| Page Title | VRChat October Cohort |
| Next.js File | `app/(public)/page.tsx` |
| Component Type | RSC (Hero Slider / Member Carousel は Client Component) |

---

## 2. Data Fetching

| API Endpoint | Method | Cache | Cookie |
|---|---|---|---|
| `GET /api/v1/public/events?per_page=6&status=published` | ISR 60s | `next: { revalidate: 60, tags: ['events'] }` | 不要 |
| `GET /api/v1/public/members?per_page=10` | ISR 60s | `next: { revalidate: 60, tags: ['members'] }` | 不要 |

```typescript
// app/(public)/page.tsx
async function HomePage() {
  const [eventsRes, membersRes] = await Promise.all([
    fetch(`${API_BASE}/api/v1/public/events?per_page=6&status=published`, {
      next: { revalidate: 60, tags: ['events'] },
    }),
    fetch(`${API_BASE}/api/v1/public/members?per_page=10`, {
      next: { revalidate: 60, tags: ['members'] },
    }),
  ]);

  const events = await eventsRes.json();
  const members = await membersRes.json();

  return <HomePageView events={events.data} members={members.data} />;
}
```

---

## 3. SEO

```typescript
// app/(public)/page.tsx
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return {
    title: 'VRChat October Cohort',
    description: t('meta.description'), // "VRChat 10月同期会のコミュニティサイト"
    openGraph: {
      title: 'VRChat October Cohort',
      description: t('meta.description'),
      images: ['/og-default.png'],
    },
  };
}
```

---

## 4. Component Hierarchy

```
<HomePage> (RSC)
  ├── <HeroSlider> (Client — "use client")
  │    ├── Carousel (embla-carousel / shadcn Carousel, auto-play 5s, fade transition)
  │    │    └── CarouselItem × N — イベントサムネイル画像
  │    │         └── next/image (fill, priority, object-cover)
  │    ├── Overlay (absolute inset-0)
  │    │    └── gradient: bg-gradient-to-t from-background/80 via-background/40 to-transparent
  │    ├── HeroContent (absolute bottom-0 left-0 right-0 p-8 md:p-16)
  │    │    ├── h1 "VRChat October Cohort"
  │    │    │    className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight"
  │    │    ├── p (subtitle)
  │    │    │    className="text-lg text-muted-foreground mt-4 max-w-xl"
  │    │    └── CTAButtons (flex gap-4 mt-8, flex-col sm:flex-row)
  │    │         ├── Button (Primary): "Browse Clubs" → /clubs
  │    │         │    className="bg-primary text-primary-foreground rounded-2xl px-8 py-4 text-lg"
  │    │         └── Button (Outline): "Meet Members" → /members
  │    │              className="variant='outline' rounded-2xl px-8 py-4 text-lg"
  │    └── LeafParticles (absolute, pointer-events-none)
  │         └── 3〜5枚の浮遊する葉 SVG (framer-motion animate)
  │
  ├── <EventSection> (RSC)
  │    ├── SectionHeader
  │    │    ├── title="Upcoming Events"
  │    │    └── action="View all →" href="/events"
  │    ├── EventList (grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6)
  │    │    └── EventCard × 3 (max 3 cards displayed)
  │    │         └── → 03-components/data-display/event-card.md
  │    └── EmptyState (if 0 events)
  │         └── icon=CalendarX, message="No upcoming events"
  │
  └── <MemberSection> (RSC)
       ├── SectionHeader
       │    ├── title="Recent Members"
       │    └── action="View all →" href="/members"
       └── MemberCarousel (Client — embla-carousel, horizontal scroll)
            └── MemberAvatar × 10
                 ├── Avatar (w-16 h-16 rounded-full)
                 ├── Tooltip (member name on hover)
                 └── Link → /members/{id}
```

### Hero Slider 詳細

- **コンテナ**: `min-h-[70vh] relative overflow-hidden`
- **自動再生**: 5秒間隔、フェードトランジション（`duration: 500ms`）
- **サムネイルなし時**: 単一のグラデーション背景（`bg-gradient-to-br from-primary/10 via-secondary/5 to-background`）+ LeafParticles のみ表示
- **LeafParticles**: 3〜5枚の秋の葉 SVG が `framer-motion` で浮遊アニメーション。`y: [-20, 20]`, `rotate: [-10, 10]`, `duration: 6-10s`, `repeat: Infinity`

---

## 5. All 5 States

### Success (通常)

Hero スライダーがイベントサムネイルでループ再生。EventSection にイベントカード3枚。MemberSection にメンバーアバター10件のカルーセル。

### Success (部分)

- **イベントのみ空**: EventSection に `EmptyState`（CalendarX アイコン + 「No upcoming events」）を表示。Hero はグラデーションフォールバック。
- **メンバーのみ空**: MemberSection に `EmptyState`（Users アイコン + 「No members yet」）を表示。
- **両方空**: 両セクション非表示、Hero のみ表示（グラデーション + CTA ボタン）。

### Loading

ISR でプリレンダリングされるため、ユーザーには**ローディング状態は見えない**（即座に HTML が配信される）。初回ビルド時のみ Next.js がビルド時にレンダリングする。

### Error

`error.tsx` がキャッチ → 「Failed to load data」メッセージ + retry ボタン。

### Stale

ISR 60s 経過後、次のリクエストでバックグラウンド再生成。ユーザーには前回のキャッシュが即座に表示される（stale-while-revalidate パターン）。

---

## 6. Responsive Layout

| Breakpoint | Hero Text | CTA Buttons | Event Grid | Member Carousel |
|---|---|---|---|---|
| **base** (< 640px) | `text-4xl` | `flex-col` (縦並び) | `grid-cols-1` | 水平スクロール |
| **sm** (640px+) | `text-4xl` | `flex-row` (横並び) | `grid-cols-1` | 水平スクロール |
| **md** (768px+) | `text-5xl` | `flex-row` | `grid-cols-2` | 水平スクロール |
| **lg** (1024px+) | `text-7xl` | `flex-row` | `grid-cols-3` | 水平スクロール |
| **xl** (1280px+) | `text-7xl` | `flex-row` | `grid-cols-3` | 水平スクロール |

- Hero は全ブレークポイントで `min-h-[70vh]`
- EventSection / MemberSection: `max-w-6xl mx-auto px-4 md:px-8 py-16`
- CTA ボタン: base で `w-full`、sm+ で `w-auto`

---

## 7. Accessibility

### Landmarks

- `<main>`: ページ全体（Public Layout で設定）
- Hero: `<section aria-label="Hero">`
- EventSection: `<section aria-labelledby="events-heading">`
- MemberSection: `<section aria-labelledby="members-heading">`

### Heading Hierarchy

```
h1: "VRChat October Cohort" (Hero内)
  h2: "Upcoming Events" (EventSection)
  h2: "Recent Members" (MemberSection)
```

### Keyboard Flow

1. Skip to content リンク → `<main>`
2. Header ナビゲーション
3. Hero CTA ボタン（Tab でフォーカス可能）
4. EventSection → 各 EventCard（Enter で詳細ページへ）
5. MemberSection → 各 MemberAvatar（Enter でプロフィールへ）
6. Footer

### ARIA

- Carousel: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Event highlights"`
- 各カルーセルアイテム: `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide {n} of {total}"`
- CTA ボタン: 明確なテキストラベル（追加の `aria-label` 不要）
- MemberAvatar: `aria-label="{member name}"` on Link

---

## 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| Hero fade-in | Page load | Fade in + slide up | `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.6, delay: 0.2 }}` |
| LeafParticles | Continuous | Float + gentle rotate | `animate={{ y: [-20, 20], rotate: [-10, 10] }}`, `transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}` |
| Carousel slides | Auto (5s) | Fade transition | `duration: 500, ease: "easeInOut"` (embla-carousel fade plugin) |
| CTA buttons | Hover / Tap | Scale bounce | `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}`, `transition={{ type: "spring", stiffness: 400, damping: 10 }}` |
| EventCard list | Viewport enter | Stagger fade-in up | Parent: `staggerChildren: 0.05`. Child: `initial={{ opacity: 0, y: 16 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}` |
| MemberAvatar | Hover | Scale + shadow | `whileHover={{ scale: 1.1 }}`, `transition={{ type: "spring", stiffness: 300 }}` |

---

## 9. i18n Keys

```
home.meta.description        — "VRChat 10月同期会のコミュニティサイト"
home.hero.title              — "VRChat October Cohort"
home.hero.subtitle           — "VRChatの10月同期メンバーが集うコミュニティ"
home.hero.cta.clubs          — "Browse Clubs"
home.hero.cta.members        — "Meet Members"
home.events.title            — "Upcoming Events"
home.events.viewAll          — "View all →"
home.events.empty            — "No upcoming events"
home.members.title           — "Recent Members"
home.members.viewAll         — "View all →"
home.members.empty           — "No members yet"
```

---

## 10. Dark Mode

| Element | Light | Dark |
|---|---|---|
| Hero overlay gradient | `from-background/80` | 同じトークン（`background` が dark で切り替わる） |
| LeafParticles | `fill-primary/30` | `fill-primary/20`（暗い背景でやや抑える） |
| Section background | `bg-background` | 同じトークン |
| SectionHeader text | `text-foreground` | 同じトークン |

Dark mode は CSS Variables（`oklch` ベース）で自動切り替えされるため、ページ固有の調整は **LeafParticles の opacity のみ**。
