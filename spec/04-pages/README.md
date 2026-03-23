# Pages — ページ仕様

> **Autumn Soft テーマ** — 温かいアイボリーベース、コーラル/マスタードアクセント、rounded-2xl、ソフトブラウンシャドウ

このセクションでは、VRChat 10月同期会コミュニティサイトのすべてのページ仕様を定義します。

---

## Route Table

| Path | Page Name | File | Access | Data Fetch | Layout |
|---|---|---|---|---|---|
| `/` | Home | `app/page.tsx` | Public | ISR 60s | Public |
| `/events` | Event List | `app/events/page.tsx` | Public | SSR (URL query) | Public |
| `/events/[id]` | Event Detail | `app/events/[id]/page.tsx` | Public | ISR 60s | Public |
| `/members` | Member List | `app/members/page.tsx` | Public | ISR 60s + Client search | Public |
| `/members/[id]` | Profile Detail | `app/members/[id]/page.tsx` | Public | ISR 60s | Public |
| `/clubs` | Club List | `app/clubs/page.tsx` | Public | ISR 60s | Public |
| `/clubs/[id]` | Club Detail + Gallery | `app/clubs/[id]/page.tsx` | Public | ISR 60s | Public |
| `/settings/profile` | Profile Editor | `app/settings/profile/page.tsx` | Member+ | SSR no-store | Public |
| `/login` | Login | `app/login/page.tsx` | Public (redirect if auth) | Static | Minimal |
| `/admin` | Dashboard | `app/admin/page.tsx` | Staff+ | SSR no-store | Admin |
| `/admin/users` | User Management | `app/admin/users/page.tsx` | Admin+ | SSR no-store | Admin |
| `/admin/galleries` | Gallery Management | `app/admin/galleries/page.tsx` | Staff+ | SSR no-store | Admin |
| `/admin/events` | Event Management | `app/admin/events/page.tsx` | Admin+ | SSR no-store | Admin |
| `/admin/tags` | Tag Management | `app/admin/tags/page.tsx` | Admin+ | SSR no-store | Admin |
| `/admin/reports` | Report Management | `app/admin/reports/page.tsx` | Admin+ | SSR no-store | Admin |
| `/admin/clubs` | Club Management | `app/admin/clubs/page.tsx` | Admin+ | SSR no-store | Admin |

---

## Layout Stack

### Root Layout — `app/layout.tsx`

```
<html lang={locale}>
  <body className={fontClasses}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
        <Toaster position="bottom-right" richColors />
      </NextIntlClientProvider>
    </ThemeProvider>
  </body>
</html>
```

責務:
- `next-themes` の `ThemeProvider`（`attribute="class"`, `defaultTheme="system"`）
- `NextIntlClientProvider`（ロケール・翻訳メッセージ注入）
- `Toaster`（Sonner, `position="bottom-right"`, `richColors`）
- フォント読み込み（`Zen Kaku Gothic New` + `Nunito`）
- グローバル CSS（Tailwind v4 `@import`）

### Public Layout — `app/(public)/layout.tsx`

```
<div className="flex min-h-screen flex-col">
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</div>
```

責務:
- `Header`（ナビゲーション、ロゴ、ユーザーメニュー）
- `Footer`（コピーライト、リンク）
- `<main>` は `flex-1` でフッターを下部に固定

適用ページ: `/`, `/events`, `/events/[id]`, `/members`, `/members/[id]`, `/clubs`, `/clubs/[id]`, `/settings/profile`

### Admin Layout — `app/admin/layout.tsx`

```
<div className="flex min-h-screen">
  <AdminSidebar />
  <main className="flex-1 overflow-auto p-6">{children}</main>
</div>
```

責務:
- `AdminSidebar`（固定サイドナビゲーション、各管理ページへのリンク）
- Header / Footer なし
- サイドバーはモバイルでシートに折りたたみ

適用ページ: `/admin`, `/admin/users`, `/admin/galleries`, `/admin/events`, `/admin/tags`, `/admin/reports`, `/admin/clubs`

### Minimal Layout

Header / Footer なし。ページ自体がフルスクリーンレイアウトを構成。

適用ページ: `/login`, `not-found.tsx`, `error.tsx`

---

## Middleware — `middleware.ts`

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get('session_id');

  // /login — redirect authenticated users to home
  if (pathname === '/login' && sessionId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // /settings/* — require authentication
  if (pathname.startsWith('/settings') && !sessionId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin/* — require authentication
  if (pathname.startsWith('/admin') && !sessionId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/settings/:path*', '/admin/:path*'],
};
```

### Middleware ルール

| Pattern | Condition | Action |
|---|---|---|
| `/settings/*` | `session_id` Cookie なし | `/login?redirect_to={path}` へリダイレクト |
| `/admin/*` | `session_id` Cookie なし | `/login?redirect_to={path}` へリダイレクト |
| `/admin/*` | Role が staff/admin でない | `/` へリダイレクト |
| `/login` | `session_id` Cookie あり | `/` へリダイレクト |

> **重要**: Middleware は Cookie の**存在のみ**をチェックし、有効性は検証しない。ロールの検証は RSC 内で `/api/v1/auth/discord/me` API コールを通じて行う。

### Role Verification in RSC

```typescript
// lib/auth.ts
async function getMe(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id');
  if (!sessionId) return null;

  const res = await fetch(`${API_BASE}/api/v1/auth/discord/me`, {
    headers: { Cookie: `session_id=${sessionId.value}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

// Admin page RSC
async function requireAdmin() {
  const user = await getMe();
  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    redirect('/');
  }
  return user;
}
```

---

## Data Fetching Strategy

| Strategy | Usage | Config |
|---|---|---|
| **ISR 60s** | Public pages (home, events detail, members, clubs) | `next: { revalidate: 60, tags: ['entity'] }` |
| **SSR (URL query)** | Event list (filters in URL) | `cache: 'no-store'` or dynamic `searchParams` |
| **SSR no-store** | Admin pages, profile editor | `cache: 'no-store'` + Cookie forwarding |
| **Client fetch** | Member search, interactive filters | `useSWR` or `useQuery` with debounce |
| **Static** | Login page | No data fetching |

### Cookie Forwarding

Internal API (`/api/v1/internal/*`) と Auth API (`/api/v1/auth/*`) は `session_id` Cookie が必要。RSC からこれらを呼ぶ際は `cookies()` を使って手動で Cookie をフォワードする:

```typescript
const cookieStore = await cookies();
const res = await fetch(url, {
  headers: { Cookie: cookieStore.toString() },
  cache: 'no-store', // cookie-dependent = no cache
});
```

---

## File Index

| File | Page |
|---|---|
| [01-home.md](./01-home.md) | Home (`/`) |
| [02-events.md](./02-events.md) | Event List (`/events`) + Event Detail (`/events/[id]`) |
| [03-members.md](./03-members.md) | Member List (`/members`) + Profile Detail (`/members/[id]`) |
| [04-profile-editor.md](./04-profile-editor.md) | Profile Editor (`/settings/profile`) |
| [05-clubs-gallery.md](./05-clubs-gallery.md) | Club List (`/clubs`) + Club Detail + Gallery (`/clubs/[id]`) |
| [06-admin.md](./06-admin.md) | Admin Pages (`/admin/*`) |
| [07-login.md](./07-login.md) | Login (`/login`) |
| [08-error-pages.md](./08-error-pages.md) | 404, 500, Forbidden |
