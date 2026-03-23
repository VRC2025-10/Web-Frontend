# Login Page

> `/login` — Discord OAuth2 ログインページ

---

## 1. Route & Meta

| Key | Value |
|---|---|
| URL Path | `/login` |
| Page Title | Login \| VRChat October Cohort |
| Next.js File | `app/login/page.tsx` |
| Component Type | RSC（DiscordLoginButton は Client Component） |
| Layout | Minimal（Header / Footer なし） |

Middleware: `session_id` Cookie がある場合、`/` にリダイレクト。

---

## 2. Data Fetching

データフェッチなし（Static ページ）。

---

## 3. SEO

```typescript
export const metadata: Metadata = {
  title: 'Login | VRChat October Cohort',
  robots: { index: false, follow: false }, // noindex
};
```

---

## 4. Component Hierarchy

```
<LoginPage> (RSC)
  └── TwoColumnLayout (min-h-screen flex flex-col md:flex-row)
       ├── LeftColumn (hidden md:flex, md:w-1/2)
       │    └── IllustrationPanel
       │         className="flex flex-col items-center justify-center
       │                    bg-gradient-to-br from-primary/5 to-secondary/10 p-12"
       │         ├── LeafParticles
       │         │    └── 3〜5枚の浮遊する葉 SVG (framer-motion, 同 Home Hero)
       │         ├── Logo (w-40 mx-auto)
       │         │    └── next/image or SVG component
       │         └── p "Welcome to VRChat October Cohort"
       │              className="text-2xl font-bold text-foreground mt-8 text-center"
       │
       └── RightColumn (w-full md:w-1/2, flex items-center justify-center p-8)
            └── Card (rounded-[2rem] p-12 max-w-md w-full)
                 ├── h1 "Login"
                 │    className="text-3xl font-bold"
                 ├── p "Sign in with your Discord account"
                 │    className="text-muted-foreground mt-2"
                 │
                 ├── ErrorAlert (conditional — URL param ?error=*)
                 │    └── Alert variant="destructive" (rounded-xl mt-6)
                 │         ├── AlertCircle icon
                 │         └── AlertDescription (error message)
                 │
                 ├── DiscordLoginButton (Client — "use client", mt-8)
                 │    └── a href="/api/v1/auth/discord/login"
                 │         ※ fetch ではなくフルページナビゲーション
                 │         └── Button className="w-full rounded-2xl px-8 py-4 text-lg
                 │                              bg-[#5865F2] hover:bg-[#4752C4]
                 │                              text-white font-semibold"
                 │              ├── Discord SVG icon (inline, w-5 h-5 mr-3)
                 │              └── "Login with Discord"
                 │              [loading state] disabled + Loader2 (animate-spin)
                 │
                 └── p "Your account will be created automatically on first login"
                      className="text-sm text-muted-foreground mt-6 text-center"
```

### Discord Login Button 実装

```typescript
// components/auth/discord-login-button.tsx ("use client")
function DiscordLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  function handleClick() {
    setIsLoading(true);

    // Store redirect_to in localStorage for post-OAuth redirect
    const redirectTo = searchParams.get('redirect_to');
    if (redirectTo) {
      localStorage.setItem('post_login_redirect', redirectTo);
    }

    // Full page navigation to OAuth endpoint
    window.location.href = '/api/v1/auth/discord/login';
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full rounded-2xl px-8 py-4 text-lg bg-[#5865F2] hover:bg-[#4752C4] text-white"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
      ) : (
        <DiscordIcon className="w-5 h-5 mr-3" />
      )}
      Login with Discord
    </Button>
  );
}
```

### Error States (URL パラメータ)

| URL Param | Message (ja) | Message (en) |
|---|---|---|
| `?error=auth_failed` | 「ログインに失敗しました。もう一度お試しください。」 | "Login failed. Please try again." |
| `?error=not_member` | 「VRChat 10月同期会の Discord サーバーメンバーである必要があります。」 | "You need to be a member of the VRChat October Cohort Discord server." |
| `?error=csrf_failed` | 「セッションが期限切れです。もう一度お試しください。」 | "Session expired. Please try again." |

### Redirect ハンドリング

```
1. ユーザーが /settings/profile にアクセス（未認証）
2. Middleware が /login?redirect_to=/settings/profile にリダイレクト
3. Login ページで ?redirect_to を読み取り
4. Discord ボタンクリック時に localStorage.setItem('post_login_redirect', '/settings/profile')
5. OAuth フロー → コールバック → / にリダイレクト
6. Root layout / client component が localStorage.getItem('post_login_redirect') をチェック
7. 値があれば router.push(redirectTo) → localStorage.removeItem('post_login_redirect')
```

```typescript
// components/auth/post-login-redirect.tsx ("use client")
// Root layout に配置
function PostLoginRedirect() {
  const router = useRouter();
  const { data: session } = useSession(); // or check cookie

  useEffect(() => {
    const redirectTo = localStorage.getItem('post_login_redirect');
    if (redirectTo && session) {
      localStorage.removeItem('post_login_redirect');
      router.push(redirectTo);
    }
  }, [session]);

  return null;
}
```

---

## 5. All 5 States

| State | UI |
|---|---|
| **Success (default)** | 2カラム: IllustrationPanel + Login Card |
| **Success (with error)** | 同上 + ErrorAlert 表示（赤い Alert） |
| **Empty** | 該当なし |
| **Loading** | Discord ボタンクリック後: ボタン disabled + Loader2 spin（ページ遷移中） |
| **Error** | URL param による ErrorAlert（上記参照） |
| **Stale** | Static ページのためなし |

---

## 6. Responsive Layout

| Breakpoint | Layout | Left Column |
|---|---|---|
| **base** | 1カラム | Hidden（`hidden`） |
| **md+** | 2カラム (`flex-row`) | Visible (`md:flex`, `md:w-1/2`) |

- base: RightColumn のみ表示、中央揃え (`flex items-center justify-center min-h-screen`)
- md+: 左右均等分割
- Card: base `p-8`、md+ `p-12`
- Card max-width: `max-w-md`

---

## 7. Accessibility

### Landmarks

- Login Card: `<main role="main">`
- IllustrationPanel: decorative（`role="presentation"`）

### Heading Hierarchy

```
h1: "Login"
```

### Keyboard Flow

1. h1 "Login"
2. ErrorAlert（表示時、`role="alert"` でスクリーンリーダーに即座にアナウンス）
3. Discord Login ボタン（Enter でクリック）

### ARIA

- ErrorAlert: `role="alert"`, auto-announced
- Discord Login ボタン: テキストラベルで十分
- Loading state: `aria-busy="true"`, `aria-disabled="true"`
- IllustrationPanel: `aria-hidden="true"`（装飾要素）
- LeafParticles: `aria-hidden="true"`

### Focus Management

- ページロード時: ErrorAlert がある場合は Alert にフォーカス
- ErrorAlert がない場合: Discord Login ボタンにフォーカス

---

## 8. Interactions & Animation

| Element | Trigger | Animation | Framer Config |
|---|---|---|---|
| Card | Mount | Fade in + slide up | `initial={{ opacity: 0, y: 24 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.5, delay: 0.1 }}` |
| IllustrationPanel | Mount | Fade in | `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `transition={{ duration: 0.6 }}` |
| LeafParticles | Continuous | Float | 同 Home Hero LeafParticles |
| Discord button | Hover | Brightness + lift | `whileHover={{ y: -2, brightness: 1.1 }}`, `whileTap={{ scale: 0.98 }}`, `transition={{ type: "spring", stiffness: 400, damping: 15 }}` |
| ErrorAlert | Mount | Slide in | `initial={{ opacity: 0, y: -8 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.3 }}` |
| Loading spinner | Button click | Spin | CSS `animate-spin` (Tailwind) |

---

## 9. i18n Keys

```
login.meta.title                — "Login | VRChat October Cohort"
login.heading                   — "Login"
login.subtitle                  — "Sign in with your Discord account"
login.button                    — "Login with Discord"
login.button.loading            — "Redirecting..."
login.footnote                  — "Your account will be created automatically on first login"
login.welcome                   — "Welcome to VRChat October Cohort"

login.error.authFailed          — "Login failed. Please try again."
login.error.notMember           — "You need to be a member of the VRChat October Cohort Discord server."
login.error.csrfFailed          — "Session expired. Please try again."
```

---

## 10. Dark Mode

| Element | Light | Dark |
|---|---|---|
| IllustrationPanel gradient | `from-primary/5 to-secondary/10` | `from-primary/10 to-secondary/15`（暗い背景で視認性確保） |
| Card background | `bg-card` | 同じトークン |
| Discord button | `bg-[#5865F2]` | 同じ色（Discord ブランドカラーは変更しない） |
| ErrorAlert | `bg-destructive/10 text-destructive` | `dark:bg-destructive/20` |
| LeafParticles | `fill-primary/20` | `fill-primary/15` |

Discord ボタンの色はブランドガイドラインに従い、dark mode でも同一色を維持。
