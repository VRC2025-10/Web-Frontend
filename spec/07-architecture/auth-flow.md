# Authentication & Authorization Flow

> Version: 1.0 | Last updated: 2026-03-20

This document defines the complete authentication and authorization architecture, including the Discord OAuth2 flow, middleware behavior, session management, role-based access control, and error handling.

---

## 1. Discord OAuth2 Flow

### 1.1 Flow Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Browser  │     │   Backend    │     │   Discord    │     │  Frontend │
│  (User)   │     │  (Rust/Axum) │     │    OAuth2    │     │ (Next.js) │
└─────┬─────┘     └──────┬───────┘     └──────┬───────┘     └─────┬─────┘
      │                  │                    │                   │
      │  1. Click        │                    │                   │
      │  "Login with     │                    │                   │
      │   Discord"       │                    │                   │
      │  (browser nav)   │                    │                   │
      ├─────────────────▶│                    │                   │
      │  GET /api/v1/auth/discord/login       │                   │
      │                  │                    │                   │
      │  2. Set oauth_state cookie            │                   │
      │     302 Redirect │                    │                   │
      │◀─────────────────┤                    │                   │
      │  Location: discord.com/oauth2/authorize                   │
      │                  │                    │                   │
      │  3. User authorizes app               │                   │
      ├──────────────────────────────────────▶│                   │
      │                  │                    │                   │
      │  4. Discord redirects with code+state │                   │
      │◀──────────────────────────────────────┤                   │
      │  GET /api/v1/auth/discord/callback?code=...&state=...     │
      ├─────────────────▶│                    │                   │
      │                  │                    │                   │
      │                  │  5. Exchange code   │                   │
      │                  │     for token       │                   │
      │                  ├───────────────────▶│                   │
      │                  │◀───────────────────┤                   │
      │                  │  access_token       │                   │
      │                  │                    │                   │
      │                  │  6. Fetch user profile + guild check   │
      │                  ├───────────────────▶│                   │
      │                  │◀───────────────────┤                   │
      │                  │                    │                   │
      │                  │  7. Create/update user in DB            │
      │                  │     Generate session_id                 │
      │                  │                    │                   │
      │  8. Set session_id cookie             │                   │
      │     302 Redirect │                    │                   │
      │◀─────────────────┤                    │                   │
      │  Location: FRONTEND_ORIGIN            │                   │
      │                  │                    │                   │
      │  9. Browser navigates to frontend     │                   │
      ├──────────────────────────────────────────────────────────▶│
      │                  │                    │                   │
      │                  │                    │     10. RSC calls  │
      │                  │◀───────────────────────────────────────┤
      │                  │  GET /api/v1/internal/auth/me           │
      │                  │  Cookie: session_id=...                 │
      │                  │                    │                   │
      │                  │  { id, role, ... } │                   │
      │                  ├───────────────────────────────────────▶│
      │                  │                    │                   │
      │  11. Render authenticated UI          │                   │
      │◀──────────────────────────────────────────────────────────┤
      │                  │                    │                   │
```

### 1.2 Key Design Decisions

| Decision | Rationale |
|---|---|
| **Browser navigation, NOT fetch** | The login endpoint triggers redirects (302). Using `fetch()` would not follow redirects across domains. `window.location.href` is required. |
| **Backend handles all OAuth logic** | Frontend never sees OAuth tokens, client secrets, or authorization codes. Simplifies frontend; security handled server-side. |
| **Guild membership check** | Only members of the specific Discord server can log in. Non-members receive an error. |
| **`session_id` in HttpOnly cookie** | Prevents XSS from accessing the session token. Cookie is automatically sent with every same-domain request. |

---

## 2. Login Initiation

### 2.1 Login Page (`/login`)

```typescript
// app/(public)/login/page.tsx
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string; error?: string }>;
}) {
  const { redirect_to, error } = await searchParams;

  return (
    <div>
      {error && <AuthErrorDisplay error={error} />}
      <LoginButton redirectTo={redirect_to} />
    </div>
  );
}
```

### 2.2 Login Button

```typescript
// components/features/auth/login-button.tsx
"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function LoginButton({ redirectTo }: { redirectTo?: string }) {
  const handleLogin = () => {
    // Store redirect target for post-login navigation
    if (redirectTo) {
      localStorage.setItem("redirect_after_login", redirectTo);
    }
    // Navigate to backend OAuth endpoint (NOT fetch)
    window.location.href = `${API_BASE}/api/v1/auth/discord/login`;
  };

  return (
    <Button onClick={handleLogin} size="lg">
      <DiscordIcon className="mr-2 h-5 w-5" />
      Login with Discord
    </Button>
  );
}
```

---

## 3. Post-Login Redirect

After successful OAuth callback, the backend redirects the browser to `FRONTEND_ORIGIN` (the homepage). The frontend then handles redirect-to navigation:

### 3.1 Redirect Strategy

```
Priority 1: ?redirect_to= query parameter (set by middleware before login)
    └── Stored in localStorage before OAuth redirect (browser navigates away)
Priority 2: localStorage "redirect_after_login" value
Priority 3: Stay on / (home page)
```

### 3.2 Implementation

The root layout or a client component on the home page checks for a stored redirect:

```typescript
// components/features/auth/post-login-redirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PostLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectPath = localStorage.getItem("redirect_after_login");
    if (redirectPath) {
      localStorage.removeItem("redirect_after_login");
      router.replace(redirectPath);
    }
  }, [router]);

  return null;
}
```

---

## 4. Session Validation

### 4.1 Auth Check Function

```typescript
// lib/api/auth.ts
import { cookies } from "next/headers";
import type { AuthMe } from "./types";

const API_BASE = process.env.INTERNAL_API_URL || "http://backend:8080";

export async function getMe(): Promise<AuthMe | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id");
  if (!sessionId) return null;

  try {
    const res = await fetch(`${API_BASE}/api/v1/internal/auth/me`, {
      headers: { Cookie: `session_id=${sessionId.value}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
```

### 4.2 Protected Page Pattern

```typescript
// app/settings/profile/page.tsx
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { getMyProfile } from "@/lib/api/profile";

export default async function ProfileEditorPage() {
  const user = await getMe();
  if (!user) redirect("/login?redirect_to=/settings/profile");

  const profile = await getMyProfile();
  return <ProfileForm user={user} profile={profile} />;
}
```

### 4.3 Admin Page Pattern (Role Check in RSC)

```typescript
// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();

  // Middleware already checks cookie presence
  // RSC verifies the session is valid AND user has admin/staff role
  if (!user || !["staff", "admin", "super_admin"].includes(user.role)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
```

---

## 5. Middleware (`middleware.ts`)

### 5.1 Implementation

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get("session_id");

  // /login — redirect authenticated users to home
  if (pathname === "/login" && sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // /settings/* — require authentication
  if (pathname.startsWith("/settings") && !sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin/* — require authentication (cookie presence only)
  if (pathname.startsWith("/admin") && !sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/settings/:path*", "/admin/:path*"],
};
```

### 5.2 Middleware Rules

| Pattern | Condition | Action | Validates Session? |
|---|---|---|---|
| `/settings/*` | No `session_id` cookie | Redirect to `/login?redirect_to={path}` | No (cookie presence only) |
| `/admin/*` | No `session_id` cookie | Redirect to `/login?redirect_to={path}` | No (cookie presence only) |
| `/login` | Has `session_id` cookie | Redirect to `/` | No (cookie presence only) |
| All other routes | — | Pass through | No |

> **Important**: Middleware only checks cookie **existence**, not validity. An expired or invalid session_id will pass middleware but fail the `getMe()` call in the RSC, which then redirects to login. This is by design — middleware runs on the Edge and cannot make full API calls for session validation.

### 5.3 Security Layers

```
Layer 1: Middleware (Edge)
  ├── Check: session_id cookie exists?
  ├── Speed: <1ms (no network call)
  └── Purpose: Fast redirect for unauthenticated users

Layer 2: RSC (Server)
  ├── Check: GET /api/v1/internal/auth/me (validates session)
  ├── Speed: ~10ms (Docker internal network)
  └── Purpose: Verify session validity + user role

Layer 3: Backend API (Rust/Axum)
  ├── Check: session_id → database lookup
  ├── Speed: ~5ms
  └── Purpose: Authoritative session validation
```

---

## 6. Logout

### 6.1 Server Action

```typescript
// actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id");

  if (sessionId) {
    await fetch(`${process.env.INTERNAL_API_URL}/api/v1/internal/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `session_id=${sessionId.value}`,
        Origin: process.env.FRONTEND_ORIGIN || "",
      },
    });
  }

  // Backend clears the cookie via Set-Cookie header
  // Redirect to home page
  redirect("/");
}
```

### 6.2 Logout Button (Client)

```typescript
// components/features/auth/user-menu.tsx
"use client";

import { logout } from "@/actions/auth";

export function UserMenu({ user }: { user: AuthMe }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar src={user.avatar_url} fallback={user.discord_username[0]} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => logout()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 7. Session Cookie Details

| Attribute | Value | Purpose |
|---|---|---|
| Name | `session_id` | Session identifier |
| Value | UUID | Unique session token |
| HttpOnly | `true` | Prevent JavaScript access (XSS protection) |
| SameSite | `Lax` | Sent on same-site requests and top-level navigations |
| Secure | `true` (production) | HTTPS only |
| Max-Age | `604800` (7 days) | Session expiry |
| Path | `/` | Available on all paths |

---

## 8. Session Expiry Handling

When a session expires, the backend returns `401 Unauthorized` from any authenticated endpoint.

### 8.1 RSC Context

```typescript
// lib/api/auth.ts
export async function getMe(): Promise<AuthMe | null> {
  // ...
  const res = await fetch(url, { ... });
  if (!res.ok) return null; // 401 → return null → page redirects
  // ...
}
```

Pages handle `null` by redirecting:

```typescript
const user = await getMe();
if (!user) redirect("/login?redirect_to=/settings/profile");
```

### 8.2 Client-Side Context

For client-side fetches that receive 401:

```typescript
// Client-side error handling
fetch("/api/v1/internal/something")
  .then((res) => {
    if (res.status === 401) {
      window.location.href = `/login?redirect_to=${window.location.pathname}`;
      return;
    }
    return res.json();
  });
```

---

## 9. CSRF Protection

CSRF protection is handled entirely by the backend:

| Method | Mechanism |
|---|---|
| `POST`, `PUT`, `PATCH`, `DELETE` | Backend validates `Origin` header matches `FRONTEND_ORIGIN` |
| Session cookie | `SameSite=Lax` prevents cross-site POST with cookies |
| OAuth state | `oauth_state` cookie prevents CSRF during OAuth flow |

The frontend does not implement any additional CSRF token logic. The same-domain architecture (frontend and API behind the same Nginx) combined with `SameSite` cookies and `Origin` header validation provides comprehensive CSRF protection.

---

## 10. Role-Based UI Rendering

### 10.1 User Roles

| Role | Access Level | Description |
|---|---|---|
| `member` | Basic | Standard community member |
| `staff` | Elevated | Community staff (gallery management, club management) |
| `admin` | High | Full admin access (user management, all CRUD) |
| `super_admin` | Full | System-level access (role management of admins) |

### 10.2 Conditional UI Elements

```typescript
// Header component — show admin link based on role
export function Header({ user }: { user: AuthMe | null }) {
  const isStaffOrAbove = user && ["staff", "admin", "super_admin"].includes(user.role);

  return (
    <nav>
      {/* Public nav items */}
      <NavLink href="/events">Events</NavLink>
      <NavLink href="/members">Members</NavLink>
      <NavLink href="/clubs">Clubs</NavLink>

      {/* Authenticated items */}
      {user && <NavLink href="/settings/profile">My Profile</NavLink>}

      {/* Staff+ items */}
      {isStaffOrAbove && <NavLink href="/admin">Admin</NavLink>}

      {/* Auth state */}
      {user ? <UserMenu user={user} /> : <LoginButton />}
    </nav>
  );
}
```

### 10.3 Role Check Matrix

| UI Element | Required Role | Location |
|---|---|---|
| Login button | Not authenticated | Header |
| "My Profile" link | Any authenticated | Header |
| "Admin" link | `staff` / `admin` / `super_admin` | Header |
| Edit profile button on own profile | Owner (matches `user.id`) | Member detail page |
| Report button | Any authenticated | Member/Event detail page |
| Admin sidebar: Users | `admin` / `super_admin` | Admin sidebar |
| Admin sidebar: Events | `admin` / `super_admin` | Admin sidebar |
| Admin sidebar: Galleries | `staff` / `admin` / `super_admin` | Admin sidebar |
| Admin sidebar: Clubs | `staff` / `admin` / `super_admin` | Admin sidebar |
| Admin sidebar: Reports | `admin` / `super_admin` | Admin sidebar |
| Admin sidebar: Tags | `admin` / `super_admin` | Admin sidebar |
| Role change control | `admin` / `super_admin` | Admin user management |

---

## 11. Auth Error Display

### 11.1 Error Codes on `/login`

The backend redirects to `/login?error={code}` on OAuth failure:

| Error Code | Display Message | Cause |
|---|---|---|
| `auth_failed` | "Authentication failed. Please try again." | General OAuth error |
| `csrf_failed` | "Security check failed. Please try again." | OAuth state mismatch |
| `not_guild_member` | "You must be a member of the Discord server to log in." | User not in required guild |
| `discord_error` | "Discord is currently unavailable. Please try later." | Discord API error |

### 11.2 Error Display Component

```typescript
// components/features/auth/auth-error-display.tsx
"use client";

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Authentication failed. Please try again.",
  csrf_failed: "Security check failed. Please try again.",
  not_guild_member: "You must be a member of the Discord server to log in.",
  discord_error: "Discord is currently unavailable. Please try later.",
};

export function AuthErrorDisplay({ error }: { error: string }) {
  const message = ERROR_MESSAGES[error] || "An unexpected error occurred.";

  return (
    <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
```

---

## 12. Authentication Flow Summary

```
Unauthenticated User                 Authenticated User
        │                                    │
        ▼                                    ▼
   Visit /admin                        Visit /admin
        │                                    │
        ▼                                    ▼
   Middleware:                          Middleware:
   No session_id → redirect            session_id exists → pass
        │                                    │
        ▼                                    ▼
   /login?redirect_to=/admin           RSC: getMe()
        │                                    │
        ▼                                    ├── null → redirect /
   Click "Login with Discord"               │
        │                                    ├── role not staff+ → redirect /
        ▼                                    │
   OAuth2 flow                              └── Valid admin → render page
        │
        ▼
   session_id cookie set
        │
        ▼
   Redirect to /
        │
        ▼
   PostLoginRedirect:
   localStorage "redirect_after_login" = /admin
        │
        ▼
   router.replace("/admin")
```
