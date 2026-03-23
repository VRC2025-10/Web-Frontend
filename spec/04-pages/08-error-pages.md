# Error Pages

> 401 Unauthorized / 403 Forbidden / 404 Not Found / 429 Too Many Requests / 500 Runtime Error / 503 Service Unavailable

共通事項:
- Header / Footer **なし**（Minimal Layout）
- シンプルな中央揃えレイアウト
- テーマカラーは維持（Autumn Soft トーン）

---

## 1. 404 Not Found — `app/not-found.tsx`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | (任意の未定義パス) |
| Page Title | Page not found \| VRChat October Cohort |
| Next.js File | `app/not-found.tsx` |
| Component Type | RSC |
| Layout | Minimal |

### Data Fetching

なし。

### SEO

```typescript
export const metadata: Metadata = {
  title: 'Page not found | VRChat October Cohort',
  robots: { index: false, follow: false },
};
```

### Component Hierarchy

```
<NotFoundPage> (RSC)
  └── Container
       className="min-h-screen flex flex-col items-center justify-center text-center px-4"
       ├── LeafIllustration
       │    └── Custom SVG (w-48 h-48)
       │         散った秋の葉っぱのイラスト（ミュートカラー: primary/30, secondary/20）
       │         → static SVG, no animation
       ├── "404"
       │    className="text-6xl font-bold text-primary/60 mt-8"
       ├── h1 "Page not found"
       │    className="text-xl text-muted-foreground mt-4"
       └── Button variant="outline" → "/" ("Return to Home")
            className="rounded-2xl mt-8 px-8 py-3"
```

### Triggered by

- `notFound()` in event detail (`/events/[id]`)
- `notFound()` in member profile (`/members/[id]`)
- `notFound()` in club detail (`/clubs/[id]`)
- 未定義ルートへのアクセス

### All 5 States

| State | UI |
|---|---|
| **Success** | 404 イラスト + メッセージ + ホームボタン |

（エラーページのため、他の状態は該当なし）

### Responsive Layout

| Breakpoint | Layout |
|---|---|
| **全ブレークポイント** | 中央揃え、`min-h-screen`, `flex-col items-center justify-center` |

- "404" text: 全ブレークポイントで `text-6xl`
- Illustration: 全ブレークポイントで `w-48 h-48`
- Container: `px-4` で左右パディング

### Accessibility

- `h1`: "Page not found"
- Button: 明確なテキストラベル「Return to Home」
- SVG illustration: `aria-hidden="true"`（装飾）

### Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| Container | Mount | Fade in | `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `transition={{ duration: 0.4 }}` |
| Illustration | Mount | Gentle float | `animate={{ y: [-4, 4] }}`, `transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}` |
| Button | Hover | Scale | `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}` |

### i18n Keys

```
error.notFound.code            — "404"
error.notFound.title           — "Page not found"
error.notFound.action          — "Return to Home"
```

### Dark Mode

| Element | Light | Dark |
|---|---|---|
| "404" text | `text-primary/60` | `text-primary/40` |
| Illustration colors | `primary/30, secondary/20` | `primary/20, secondary/15` |
| Background | `bg-background` | 同じトークン |

---

## 2. 500 / Runtime Error — `app/error.tsx`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | (任意のページでランタイムエラー発生時) |
| Page Title | Error \| VRChat October Cohort |
| Next.js File | `app/error.tsx` |
| Component Type | **Client Component**（`"use client"` — Next.js 必須） |
| Layout | エラーが発生したレイアウト内で表示 |

### Data Fetching

なし。

### SEO

エラーページはクライアントコンポーネントのため `generateMetadata` は使用不可。`<title>` は親 layout の metadata が適用される。

### Component Hierarchy

```
<ErrorPage> ("use client", props: { error: Error & { digest?: string }, reset: () => void })
  └── Container
       className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
       ├── AlertTriangle icon
       │    className="w-16 h-16 text-destructive/60"
       ├── h1 "An error occurred"
       │    className="text-2xl font-bold mt-6"
       ├── p "Please try again later"
       │    className="text-muted-foreground mt-2 max-w-md"
       ├── Button "Try again" onClick={reset}
       │    className="rounded-2xl mt-8 px-8 py-3"
       │    → reset() は Next.js が提供する関数。エラー境界をリセットし、
       │      セグメントの再レンダリングを試みる。
       └── Link "Return to Home" → "/"
            className="mt-4 text-sm text-muted-foreground hover:text-foreground
                       underline underline-offset-4"
```

### Implementation

```typescript
'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    // Log error to reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="w-16 h-16 text-destructive/60" />
      <h1 className="text-2xl font-bold mt-6">{t('runtime.title')}</h1>
      <p className="text-muted-foreground mt-2 max-w-md">{t('runtime.description')}</p>
      <Button onClick={reset} className="rounded-2xl mt-8 px-8 py-3">
        {t('runtime.retry')}
      </Button>
      <Link
        href="/"
        className="mt-4 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
      >
        {t('runtime.home')}
      </Link>
    </div>
  );
}
```

### All 5 States

| State | UI |
|---|---|
| **Error (default)** | AlertTriangle + メッセージ + retry + home リンク |
| **Retry success** | `reset()` 呼び出しでページが正常に再レンダリング |
| **Retry failure** | 再度同じエラーページが表示される |

### Responsive Layout

| Breakpoint | Layout |
|---|---|
| **全ブレークポイント** | 中央揃え、`min-h-[60vh]`, `flex-col items-center justify-center` |

- `min-h-[60vh]`（`100vh` ではない — レイアウト内に表示されるため）

### Accessibility

- `h1`: "An error occurred"
- retry Button: 明確なテキストラベル
- Home Link: `underline` で視覚的にリンクと分かる
- AlertTriangle: decorative（アイコンの意味はテキストで伝達済み）→ `aria-hidden="true"`

### Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| Container | Mount | Fade in | `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `transition={{ duration: 0.3 }}` |
| AlertTriangle | Mount | Gentle pulse | `animate={{ scale: [1, 1.05, 1] }}`, `transition={{ duration: 2, repeat: Infinity }}` |
| Retry Button | Hover | Scale | `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}` |

### i18n Keys

```
error.runtime.title            — "An error occurred"
error.runtime.description      — "Please try again later"
error.runtime.retry            — "Try again"
error.runtime.home             — "Return to Home"
```

### Dark Mode

| Element | Light | Dark |
|---|---|---|
| AlertTriangle | `text-destructive/60` | `text-destructive/50` |
| Background | レイアウト依存 | 同上 |

---

## 3. 401 Unauthorized — `app/unauthorized.tsx`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | 認証が必要なページで `unauthorized()` 呼び出し時 |
| HTTP Status | `401` |
| Next.js File | `app/unauthorized.tsx` |
| Requirement | `next.config.ts` で `experimental.authInterrupts = true` |
| Layout | Minimal |

### Triggered by

- 保護ページでセッションが失効している
- `apiClient()` が `401` を受け取り `unauthorized()` を投げる
- Middleware 通過後のレースコンディションで認証が無効化された

### UI

- Code pill: `401`
- Icon: `LockKeyhole`
- Title: "Please log in to continue"
- Description: 認証が必要であることを明確に伝える
- Primary action: `/login`
- Secondary action: `/`

---

## 4. 403 Forbidden — `app/forbidden.tsx`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | 権限不足ページで `forbidden()` 呼び出し時 |
| HTTP Status | `403` |
| Next.js File | `app/forbidden.tsx` |
| Requirement | `next.config.ts` で `experimental.authInterrupts = true` |
| Layout | Minimal |

### Triggered by

- `/admin/*` で staff 以上の権限がない
- Server Action / Route Handler 側のロールチェック失敗

### UI

- Code pill: `403`
- Icon: `ShieldAlert`
- Title: "You do not have access"
- Description: 権限不足であることだけを伝える。内部リソース名は出さない
- Primary action: `/`
- Secondary action: `/login`

---

## 5. 429 Too Many Requests — `app/too-many-requests/page.tsx`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/too-many-requests` |
| HTTP Status | ページ自体は `200`。上流 API の `429` を表現する補助ルート |
| Layout | Minimal |

### Triggered by

- `apiClient()` が `429` を受け取ったとき `redirect('/too-many-requests')`
- `Retry-After` ヘッダーがある場合は search params に秒数を付与

### UI

- Code pill: `429`
- Icon: `Hourglass`
- 説明文: 短時間にリクエストが集中したことを伝える
- Primary action: Refresh / retry
- Secondary action: `/`

---

## 6. 503 Service Unavailable — `app/service-unavailable/page.tsx`

### Route & Meta

| Key | Value |
|---|---|
| URL Path | `/service-unavailable` |
| HTTP Status | ページ自体は `200`。上流 API の `503` / 接続失敗を表現する補助ルート |
| Layout | Minimal |

### Triggered by

- `apiClient()` が `503` を受け取ったとき
- fetch timeout / network failure をサービス一時停止として扱うとき

### UI

- Code pill: `503`
- Icon: `ServerCrash`
- Title: "Service temporarily unavailable"
- Description: 後で再試行するよう明示
- Primary action: Refresh / retry
- Secondary action: `/`

## Common: SEO

すべてのエラーページ: `robots: { index: false, follow: false }` — 検索エンジンにインデックスさせない。

## Common: Dark Mode

すべてのエラーページはテーマカラーを維持。Autumn Soft のウォームブラウントーンはエラー状態でも適用。

| Principle | Implementation |
|---|---|
| 温かみのあるエラー表現 | 真っ赤ではなく `destructive/60` (muted red) を使用 |
| テーマの一貫性 | `bg-background`, `text-foreground` トークンを使用 |
| 威圧的でない | `rounded-2xl`, ソフトなアニメーション、穏やかなイラスト |

## Common: Accessibility

| Page | h1 | Action |
|---|---|---|
| 401 | "Please log in to continue" | "Log in" Button |
| 403 | "You do not have access" | "Back to Home" Button |
| 404 | "Page not found" | "Return to Home" Button |
| 429 | "Too many requests" | "Try again" Button |
| 500 | "An error occurred" | "Try again" Button + "Return to Home" Link |
| 503 | "Service temporarily unavailable" | "Try again" Button |

- **Focus on load**: エラーページ表示時、`h1` または最初のアクション要素にフォーカスを移動
- **Screen reader**: エラーメッセージは `h1` + `p` で構造化され、スクリーンリーダーで自然に読める
- **Color contrast**: `destructive` トークンは WCAG AA コントラスト比を維持
