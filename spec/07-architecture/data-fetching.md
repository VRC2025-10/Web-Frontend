# Data Fetching Strategy

> Version: 1.0 | Last updated: 2026-03-20

This document defines the complete data fetching architecture, including RSC fetch patterns, caching strategies, cookie forwarding, Server Actions, client-side fetching, and error handling.

---

## 1. Fetch Strategy Overview

All data flows from the Rust/Axum REST API. The frontend never directly connects to the database. Fetch strategies are chosen based on data freshness requirements and authentication needs.

```
┌──────────────────────────────────────────────────────────────────┐
│                        Data Fetching Layers                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RSC (Server Components)                                         │
│  ├── ISR fetch      → Public data, revalidated on interval       │
│  ├── SSR fetch      → Auth-dependent data, no cache              │
│  └── Static         → No data fetching needed                    │
│                                                                  │
│  Server Actions                                                  │
│  ├── Form mutations → Profile update, report submission          │
│  └── Admin actions  → Role change, gallery approval              │
│                                                                  │
│  Client-side fetch                                               │
│  └── Debounced search → Member search (public API direct)        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Per-Route Fetch Table

| Route | Endpoint | Strategy | Cookie Required | Revalidation | Tags |
|---|---|---|---|---|---|
| `/` (Home) | `GET /api/v1/public/events?status=published&per_page=6` | ISR 60s | No | `revalidateTag("events")` | `["events"]` |
| `/` (Home) | `GET /api/v1/public/members?per_page=8` | ISR 60s | No | `revalidateTag("members")` | `["members"]` |
| `/` (Home) | `GET /api/v1/public/clubs` | ISR 60s | No | `revalidateTag("clubs")` | `["clubs"]` |
| `/events` | `GET /api/v1/public/events?status=&page=&per_page=` | SSR | No | — (dynamic searchParams) | — |
| `/events/[id]` | `GET /api/v1/public/events/:id` | ISR 60s | No | `revalidateTag("event-{id}")` | `["events", "event-{id}"]` |
| `/members` | `GET /api/v1/public/members` | ISR 60s | No | `revalidateTag("members")` | `["members"]` |
| `/members` (search) | `GET /api/v1/public/members?search=` | Client fetch | No | — (client debounce) | — |
| `/members/[id]` | `GET /api/v1/public/members/:id` | ISR 60s | No | `revalidateTag("member-{id}")` | `["members", "member-{id}"]` |
| `/clubs` | `GET /api/v1/public/clubs` | ISR 60s | No | `revalidateTag("clubs")` | `["clubs"]` |
| `/clubs/[id]` | `GET /api/v1/public/clubs/:id` | ISR 60s | No | `revalidateTag("club-{id}")` | `["clubs", "club-{id}"]` |
| `/clubs/[id]` | `GET /api/v1/public/clubs/:id/gallery` | ISR 60s | No | `revalidateTag("club-{id}-gallery")` | `["clubs", "club-{id}-gallery"]` |
| `/settings/profile` | `GET /api/v1/internal/me/profile` | SSR no-store | Yes | — | — |
| `/settings/profile` | `GET /api/v1/internal/auth/me` | SSR no-store | Yes | — | — |
| `/login` | — | Static | No | — | — |
| `/admin` | `GET /api/v1/internal/auth/me` | SSR no-store | Yes | — | — |
| `/admin/users` | `GET /api/v1/internal/admin/users` | SSR no-store | Yes | — | — |
| `/admin/events` | `GET /api/v1/internal/events` | SSR no-store | Yes | — | — |
| `/admin/galleries` | `GET /api/v1/internal/admin/clubs/:id/gallery` | SSR no-store | Yes | — | — |
| `/admin/reports` | Admin reports endpoint | SSR no-store | Yes | — | — |
| `/admin/tags` | Admin tags endpoint | SSR no-store | Yes | — | — |
| `/admin/clubs` | `GET /api/v1/public/clubs` + admin enrichment | SSR no-store | Yes | — | — |

---

## 3. RSC Fetch Patterns

### 3.1 ISR (Incremental Static Regeneration)

Used for public data that changes infrequently. Pages are statically generated and revalidated at a defined interval.

```typescript
// lib/api/events.ts
import { apiClient } from "./client";
import type { PaginatedResponse, PublicEvent } from "./types";

export async function getEvents(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<PublicEvent>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.status) searchParams.set("status", params.status);

  return apiClient(`/api/v1/public/events?${searchParams}`, {
    next: { revalidate: 60, tags: ["events"] },
  });
}

export async function getEventById(id: string): Promise<PublicEventDetail> {
  return apiClient(`/api/v1/public/events/${id}`, {
    next: { revalidate: 60, tags: ["events", `event-${id}`] },
  });
}
```

**Usage in page:**

```typescript
// app/(public)/events/[id]/page.tsx
export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  return <EventDetail event={event} />;
}
```

### 3.2 SSR (Server-Side Rendering, no-store)

Used for authenticated pages and search with URL query params. Every request hits the API.

```typescript
// lib/api/admin.ts
import { apiClient } from "./client";

export async function getAdminUsers(params?: {
  page?: number;
  per_page?: number;
  role?: string;
  status?: string;
}): Promise<PaginatedResponse<AdminUser>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.role) searchParams.set("role", params.role);
  if (params?.status) searchParams.set("status", params.status);

  return apiClient(`/api/v1/internal/admin/users?${searchParams}`, {
    cache: "no-store",
    withCookies: true, // triggers cookie forwarding
  });
}
```

### 3.3 Static

No data fetching. The page is fully static.

```typescript
// app/(public)/login/page.tsx — no fetch calls, renders statically
export default function LoginPage() {
  return <LoginContent />;
}
```

---

## 4. Base Fetch Client (`lib/api/client.ts`)

### 4.1 Cookie Forwarding

Internal API endpoints require the `session_id` cookie. In RSC, cookies are accessed through `next/headers` and manually forwarded.

```typescript
// lib/api/client.ts
import { cookies } from "next/headers";

const INTERNAL_API_BASE = process.env.INTERNAL_API_URL || "http://backend:8080";
const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface FetchOptions extends Omit<RequestInit, "headers"> {
  withCookies?: boolean;
  timeout?: number;
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { withCookies = false, timeout = 10_000, ...fetchOptions } = options;

  // Determine base URL: server-side always uses internal Docker URL
  const baseUrl = INTERNAL_API_BASE;
  const url = `${baseUrl}${path}`;

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Forward cookies for authenticated requests (SSR)
  if (withCookies) {
    const cookieStore = await cookies();
    headers["Cookie"] = cookieStore.toString();
  }

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 404) {
        const { notFound } = await import("next/navigation");
        notFound();
      }
      const errorBody = await res.json().catch(() => ({}));
      throw new ApiError(res.status, errorBody.code || "UNKNOWN", errorBody.message);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${code}`);
    this.name = "ApiError";
  }
}
```

### 4.2 Backend URL Resolution

| Context | Base URL | Reason |
|---|---|---|
| Server-side (RSC, Server Actions) | `http://backend:8080` | Docker internal network, no DNS lookup, fastest path |
| Client-side (browser) | Same domain (relative `/api/v1/...`) | Nginx proxies to backend, cookie sent automatically |

```
# Docker internal network
Next.js (:3000)  ──fetch──▶  backend (:8080)   ← server-side
Browser          ──fetch──▶  Nginx (:443)      ← client-side
                               ├── / → Next.js
                               └── /api/v1/* → backend
```

### 4.3 Timeout Configuration

| Request Type | Timeout | Rationale |
|---|---|---|
| Public data fetches | 10s | Standard timeout for API calls |
| Auth checks (`/auth/me`) | 5s | Should be fast, fail quickly |
| Admin data fetches | 15s | Larger datasets possible |
| Image upload (Server Action) | 60s | File transfer time |

---

## 5. Concurrent Data Fetching

Pages that need multiple independent data sources use `Promise.all` to fetch in parallel:

```typescript
// app/(public)/page.tsx (Home)
export default async function HomePage() {
  const [events, members, clubs] = await Promise.all([
    getEvents({ status: "published", per_page: 6 }),
    getMembers({ per_page: 8 }),
    getClubs(),
  ]);

  return (
    <>
      <HeroSection />
      <EventsSection events={events.items} />
      <MembersSection members={members.items} />
      <ClubsSection clubs={clubs} />
    </>
  );
}
```

---

## 6. On-Demand Revalidation

### 6.1 revalidateTag

Used in Server Actions after mutations to invalidate specific cached data:

```typescript
// actions/profile.ts
"use server";

import { revalidateTag } from "next/cache";

export async function updateProfile(formData: FormData) {
  // ... API call to update profile ...

  // Invalidate the member's public profile cache
  revalidateTag("members");
  revalidateTag(`member-${userId}`);
}
```

### 6.2 revalidatePath

Used when the entire page needs re-rendering:

```typescript
// actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";

export async function updateGalleryStatus(imageId: string, status: string) {
  // ... API call ...

  revalidatePath("/admin/galleries");
  revalidateTag("clubs"); // Public club pages too
}
```

### 6.3 Revalidation Strategy Table

| Mutation | Revalidation Target | Method |
|---|---|---|
| Profile update | `members`, `member-{id}` | `revalidateTag` |
| Gallery image approval | `club-{id}-gallery`, `clubs` | `revalidateTag` |
| Event sync (system) | `events` | `revalidateTag` |
| Role change | N/A (admin pages use `no-store`) | — |
| Report submission | N/A (admin pages use `no-store`) | — |

---

## 7. Server Actions

### 7.1 Form Mutations

```typescript
// actions/profile.ts
"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ProfileFormSchema } from "@/lib/validations/profile";
import { apiClient } from "@/lib/api/client";

export async function updateProfile(formData: FormData) {
  const raw = {
    vrc_id: formData.get("vrc_id") as string | null,
    x_id: formData.get("x_id") as string | null,
    bio_markdown: formData.get("bio_markdown") as string,
    is_public: formData.get("is_public") === "true",
  };

  // Validate with Zod
  const result = ProfileFormSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await apiClient("/api/v1/internal/me/profile", {
      method: "PUT",
      body: JSON.stringify(result.data),
      withCookies: true,
    });

    revalidateTag("members");
    return { success: true };
  } catch (error) {
    return { success: false, errors: { _form: ["Failed to update profile."] } };
  }
}
```

### 7.2 Image Upload (Gallery)

Gallery image uploads use Server Actions with `FormData`:

```typescript
// actions/admin.ts
"use server";

import { cookies } from "next/headers";

export async function uploadGalleryImage(clubId: string, formData: FormData) {
  const cookieStore = await cookies();
  const file = formData.get("image") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "No file provided" };
  }

  // Step 1: Upload file to MinIO via backend (or get presigned URL)
  const uploadFormData = new FormData();
  uploadFormData.append("image", file);

  const res = await fetch(
    `${process.env.INTERNAL_API_URL}/api/v1/internal/admin/clubs/${clubId}/gallery/upload`,
    {
      method: "POST",
      headers: { Cookie: cookieStore.toString() },
      body: uploadFormData,
    }
  );

  if (!res.ok) {
    return { success: false, error: "Upload failed" };
  }

  return { success: true, data: await res.json() };
}
```

---

## 8. Client-Side Fetch

Used only for interactive features that require immediate feedback without a full page reload.

### 8.1 Member Search (Debounced)

```typescript
// components/features/members/member-search.tsx
"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { PublicMember } from "@/lib/api/types";

export function MemberSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    // Client-side fetch goes through Nginx → backend (same domain, no CORS)
    fetch(`/api/v1/public/members?search=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setResults(data.items))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  // ... render search input and results
}
```

**Key rules for client-side fetch:**
- Use relative URLs (Nginx proxies to backend)
- Always implement `AbortController` for cleanup
- Debounce user input (300ms minimum)
- Show loading state during fetch
- Handle errors gracefully (no unhandled rejections)

---

## 9. Error Handling

### 9.1 RSC Error Handling

```typescript
// app/(public)/events/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const event = await getEventById(id);
    return <EventDetail event={event} />;
  } catch (error) {
    // ApiError with 404 triggers notFound() automatically in client.ts
    // Other errors bubble up to error.tsx boundary
    throw error;
  }
}
```

### 9.2 Error Boundary Hierarchy

```
app/error.tsx           ← Catches unhandled errors globally
app/(public)/error.tsx  ← Catches errors in public pages (optional, more specific)
app/admin/error.tsx     ← Catches errors in admin pages (optional)
```

### 9.3 Error Responses and Actions

| HTTP Status | Scenario | Frontend Action |
|---|---|---|
| 401 | Session expired | Redirect to `/login?redirect_to={current_path}` |
| 403 | Insufficient permissions | Redirect to `/` or show forbidden message |
| 404 | Resource not found | `notFound()` → `not-found.tsx` |
| 429 | Rate limited | Show "too many requests" toast |
| 500 | Server error | Error boundary → `error.tsx` with retry button |

### 9.4 Auth Error Handling in `apiClient`

```typescript
// Enhance apiClient for auth errors
if (res.status === 401) {
  // In Server Action context, redirect to login
  const { redirect } = await import("next/navigation");
  redirect("/login");
}
```

---

## 10. Caching Strategy Summary

### 10.1 Route Segment Cache

| Route Type | Dynamic | Behavior |
|---|---|---|
| ISR pages | `false` (static with revalidation) | Cached for `revalidate` seconds, rebuilt on next request |
| SSR pages (URL params) | `true` (via `searchParams`) | Fresh fetch on every request |
| SSR pages (cookies) | `true` (via `cookies()`) | Fresh fetch on every request |
| Static pages | `false` | Built once at build time |

### 10.2 Fetch Cache

| Pattern | `cache` | `next.revalidate` | Effect |
|---|---|---|---|
| Public data | `force-cache` (default) | `60` | Cached response, revalidated every 60s |
| Auth data | `"no-store"` | — | Never cached, fresh on every request |
| Admin data | `"no-store"` | — | Never cached |

### 10.3 ISR Timing Table

| Data | Revalidation Interval | Rationale |
|---|---|---|
| Events (list) | 60s | Events don't change frequently, acceptable staleness |
| Event detail | 60s | Same as list |
| Members (list) | 60s | New members / profile updates are not time-critical |
| Member detail | 60s | Same as list |
| Clubs (list) | 60s | Clubs rarely change |
| Club detail | 60s | Same as list |
| Club gallery | 60s | Gallery images added/approved infrequently |

### 10.4 Cache Invalidation Flow

```
User Action
    │
    ▼
Server Action
    │
    ├── API call to backend (with cookie)
    │
    ├── revalidateTag("affected-data")
    │     │
    │     ▼
    │   Next.js purges matching fetch cache entries
    │     │
    │     ▼
    │   Next page request triggers fresh fetch
    │
    └── Return result to client
```

---

## 11. Data Fetching Rules

| # | Rule |
|---|---|
| 1 | **Always fetch through `lib/api/` functions** — never call `fetch()` directly in pages or components |
| 2 | **Use `Promise.all` for independent fetches** — maximize parallelism in RSC |
| 3 | **Never cache cookie-dependent requests** — always use `cache: "no-store"` |
| 4 | **Tag all ISR fetches** — enable targeted cache invalidation |
| 5 | **Handle errors at the page level** — let error boundaries catch unexpected failures |
| 6 | **Client-side fetch uses relative URLs** — Nginx handles proxying |
| 7 | **Server-side fetch uses Docker URL** — `http://backend:8080` for internal network efficiency |
| 8 | **All fetches have timeouts** — prevent hanging requests from blocking rendering |
| 9 | **Validate Server Action input with Zod** — never trust client data |
| 10 | **Debounce client-side search** — minimum 300ms to reduce API load |
