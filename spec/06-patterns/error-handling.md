# Error Handling Pattern

> Version: 1.0 | Last updated: 2026-03-20

This document defines the error handling strategy, error categorization, UI patterns, and user messaging for the VRC community website.

---

## Table of Contents

- [Error Boundary Hierarchy](#error-boundary-hierarchy)
- [API Error Categorization](#api-error-categorization)
- [Retry Pattern](#retry-pattern)
- [Error Display Patterns](#error-display-patterns)
- [404 Handling](#404-handling)
- [Authentication Errors](#authentication-errors)
- [Rate Limit Errors](#rate-limit-errors)
- [Network Offline Detection](#network-offline-detection)
- [Stale Data Handling](#stale-data-handling)
- [Error Logging](#error-logging)
- [User-Friendly Error Messages](#user-friendly-error-messages)
- [Error Component Inventory](#error-component-inventory)

---

## Error Boundary Hierarchy

Next.js App Router provides built-in error handling through `error.tsx` files:

```
app/
├── error.tsx                  # Global error boundary (catches all unhandled)
├── not-found.tsx              # Global 404
├── layout.tsx                 # Root layout (not caught by error.tsx)
├── global-error.tsx           # Root layout error boundary
├── events/
│   ├── error.tsx              # Events section errors
│   ├── [id]/
│   │   └── error.tsx          # Single event errors
├── admin/
│   ├── error.tsx              # Admin section errors
│   └── events/
│       └── error.tsx          # Admin events errors
└── login/
    └── error.tsx              # Login errors
```

### Error Boundary Levels

| Level | File | Catches | Behavior |
|---|---|---|---|
| **Global** | `app/error.tsx` | Any unhandled runtime error | Full-page error with reset + home link |
| **Root layout** | `app/global-error.tsx` | Errors in root layout itself | Minimal HTML error page |
| **Route segment** | `app/{route}/error.tsx` | Errors within that route segment | Section error with retry, rest of layout preserved |
| **Component** | React Error Boundary wrapper | Errors in specific UI sections | Inline error card with retry |

### Global Error Component

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md">
          An unexpected error occurred. Please try again, or return to the home page.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go to home</Link>
        </Button>
      </div>
    </div>
  );
}
```

### Global Error (Root Layout)

```tsx
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">A critical error occurred.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

---

## API Error Categorization

All API errors are categorized into three groups for consistent handling:

| Category | HTTP Status | Cause | Handling |
|---|---|---|---|
| **Network error** | No response | Connectivity issues, DNS failure, timeout | Retry with backoff, show offline banner if persistent |
| **Client error (4xx)** | 400–499 | Bad request, unauthorized, forbidden, not found | Display specific error message, no automatic retry |
| **Server error (5xx)** | 500–599 | Server failure, service unavailable | Retry with backoff, show generic error |

### Specific Status Code Handling

| Status | Meaning | UI Response |
|---|---|---|
| `400` | Bad Request | Form-level error: show validation message |
| `401` | Unauthorized | `unauthorized()` → `app/unauthorized.tsx` |
| `403` | Forbidden | `forbidden()` → `app/forbidden.tsx` |
| `404` | Not Found | Trigger `notFound()` → `not-found.tsx` |
| `409` | Conflict | "This resource was modified by someone else. Please refresh." |
| `422` | Unprocessable Entity | Map field errors to form fields |
| `429` | Too Many Requests | Redirect to `/too-many-requests` with optional `retryAfter` |
| `500` | Internal Server Error | Generic error with retry button |
| `502/503/504` | Service Unavailable | Redirect to `/service-unavailable` |

### API Error Utility

```tsx
// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError() { return this.status === 0; }
  get isClientError() { return this.status >= 400 && this.status < 500; }
  get isServerError() { return this.status >= 500; }
  get isRetryable() { return this.isNetworkError || this.isServerError || this.status === 429; }
}

// Usage in fetch wrapper
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Network connection failed');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      body.code ?? 'UNKNOWN',
      body.message ?? 'An error occurred',
      body.fieldErrors,
    );
  }

  return response.json();
}
```

---

## Retry Pattern

### Exponential Backoff (Automatic)

For transient errors (network errors, 5xx), apply automatic retry with exponential backoff:

```tsx
// src/lib/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {},
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      if (error instanceof ApiError && !error.isRetryable) throw error;

      const delay = baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}
```

| Attempt | Delay | Total Wait |
|---|---|---|
| 1st retry | 1 second | 1s |
| 2nd retry | 2 seconds | 3s |
| 3rd retry | 4 seconds | 7s |
| Give up | — | Show error to user |

### Manual Retry (User-Triggered)

After automatic retries are exhausted, show a manual retry button:

```tsx
<Button onClick={retry} variant="outline" size="sm">
  <RotateCw className="mr-2 h-4 w-4" />
  Retry
</Button>
```

### What NOT to Retry

- `400` Bad Request — user input error
- `401` Unauthorized — redirect to login
- `403` Forbidden — permission issue
- `404` Not Found — resource doesn't exist
- `409` Conflict — requires user decision
- `422` Unprocessable — validation error

---

## Error Display Patterns

### 1. Page-Level Error

Full page replacement when the entire page fails to load:

```tsx
// Used in error.tsx files
<div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
  <AlertTriangle className="h-16 w-16 text-destructive" />
  <div className="text-center space-y-2">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground max-w-md">{description}</p>
  </div>
  <div className="flex gap-3">
    <Button onClick={reset}>Try again</Button>
    <Button variant="outline" asChild>
      <Link href="/">Go to home</Link>
    </Button>
  </div>
</div>
```

### 2. Section-Level Error

Inline error within a page section (e.g., events section on home page fails but rest of page works):

```tsx
<div className="flex flex-col items-center justify-center py-12 gap-4 rounded-xl border border-destructive/20 bg-destructive/5">
  <AlertCircle className="h-10 w-10 text-destructive" />
  <div className="text-center space-y-1">
    <p className="font-medium">Failed to load events</p>
    <p className="text-sm text-muted-foreground">Please try again.</p>
  </div>
  <Button onClick={retry} variant="outline" size="sm">
    <RotateCw className="mr-2 h-4 w-4" />
    Retry
  </Button>
</div>
```

### 3. Form-Level Error

Alert banner at the top of the form + inline field errors:

```tsx
{/* Form-level error (e.g., server error, general failure) */}
<Alert variant="destructive" className="mb-6">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Submission failed</AlertTitle>
  <AlertDescription>
    An error occurred while saving. Please check your input and try again.
  </AlertDescription>
</Alert>

{/* Field-level errors — see Forms Pattern */}
```

### 4. Toast Error

For non-blocking errors that don't prevent the user from continuing:

```tsx
import { toast } from 'sonner';

// Non-blocking error
toast.error('Failed to update notification preferences', {
  description: 'Your other changes were saved.',
  action: {
    label: 'Retry',
    onClick: () => retryNotificationUpdate(),
  },
});
```

| Toast Usage | Example |
|---|---|
| Background save failure | "Failed to save draft" |
| Copy to clipboard failure | "Could not copy to clipboard" |
| Image upload failure | "Upload failed. Please try again." |
| Non-critical API failure | "Could not load recommendations" |

### Error Display Decision Tree

```
Error occurs
  ├── Is it a form submission error?
  │   ├── Field-specific? → Inline field error
  │   └── General? → Alert at top of form
  ├── Does it prevent the page from loading?
  │   ├── Entire page? → error.tsx (page-level)
  │   └── Just a section? → Section-level error card
  ├── Is it non-blocking?
  │   └── Yes → Toast notification
  └── Is it a 404?
      └── Yes → not-found.tsx
```

---

## 404 Handling

### Server Component (RSC) 404

```tsx
// In a Server Component (e.g., event detail page)
import { notFound } from 'next/navigation';

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
  if (!event) {
    notFound(); // Triggers not-found.tsx
  }
  return <EventDetail event={event} />;
}
```

### Global Not Found Page

```tsx
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <SearchX className="h-16 w-16 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go to home</Link>
      </Button>
    </div>
  );
}
```

### Route-Specific Not Found

```tsx
// app/events/[id]/not-found.tsx
export default function EventNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <CalendarX className="h-16 w-16 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <p className="text-muted-foreground">This event may have been deleted or doesn't exist.</p>
      </div>
      <Button asChild>
        <Link href="/events">Browse events</Link>
      </Button>
    </div>
  );
}
```

---

## Authentication Errors

### 401 Unauthorized — Redirect to Login

```tsx
// In API fetch wrapper or middleware
if (error.status === 401) {
  const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
  router.push(`/login?returnUrl=${returnUrl}`);
}

// Or in Next.js middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = checkAuth(request);
  if (!isAuthenticated && isProtectedRoute(request.nextUrl.pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}
```

### Session Expiry

- When a session expires during use, the next API call returns 401.
- Show a toast: "Your session has expired. Please log in again."
- Redirect to `/login?returnUrl={current_page}`.
- After login, redirect back to the original page.

### 403 Forbidden

- Admin pages: redirect to home with toast "You don't have permission to access this page."
- Non-admin trying admin actions: inline error message.
- Do NOT expose why the resource is forbidden (security).

---

## Rate Limit Errors

### 429 Too Many Requests

```tsx
function RateLimitMessage({ retryAfter }: { retryAfter: number }) {
  const [remaining, setRemaining] = useState(retryAfter);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  if (remaining === 0) {
    return <Button onClick={retry}>Try again</Button>;
  }

  return (
    <Alert>
      <Clock className="h-4 w-4" />
      <AlertTitle>Too many requests</AlertTitle>
      <AlertDescription>
        Please wait {remaining} seconds before trying again.
      </AlertDescription>
    </Alert>
  );
}
```

### Rate Limit Handling

| Source | `Retry-After` Header | UI |
|---|---|---|
| API response | Parse header value (seconds) | Countdown + retry button |
| No header | Default to 30 seconds | Countdown + retry button |
| Login attempts | 60 seconds after 5 failures | Countdown on login form |

---

## Network Offline Detection

### Offline Banner

```tsx
'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function handleOnline() { setIsOffline(false); }
    function handleOffline() { setIsOffline(true); }

    // Set initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-3 text-center text-sm"
    >
      <WifiOff className="inline-block mr-2 h-4 w-4" />
      You are offline. Some features may not be available.
    </div>
  );
}
```

### Offline Behavior

| Feature | Offline Behavior |
|---|---|
| Page viewing (cached) | Works (Next.js static cache) |
| API-dependent pages | Show error state or stale data |
| Form submission | Disable submit, show offline message |
| Search/filter | Show cached results or error |
| File upload | Disable, show offline message |

---

## Stale Data Handling

When data may be outdated (e.g., another user made changes):

### Pattern

```tsx
<div className="flex items-center gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-2 text-sm">
  <RefreshCw className="h-4 w-4 text-warning" />
  <span className="text-muted-foreground">This data may be outdated.</span>
  <Button variant="ghost" size="sm" onClick={refresh}>
    Refresh
  </Button>
</div>
```

### When to Show Stale Indicator

| Scenario | Stale Indicator |
|---|---|
| Data fetched > 5 minutes ago (client) | Show indicator above data |
| WebSocket reconnection | Refresh data automatically, show briefly |
| Optimistic update failed | Revert + show error toast |
| Conflict on save (409) | Show "modified by someone else" dialog |

---

## Error Logging

### Development

```tsx
// Console logging in development
if (process.env.NODE_ENV === 'development') {
  console.error('[API Error]', {
    status: error.status,
    code: error.code,
    message: error.message,
    url: error.url,
    stack: error.stack,
  });
}
```

### Production

```tsx
// Future: Sentry integration
// src/lib/error-reporting.ts
export function reportError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error, context);
    return;
  }

  // TODO: Sentry integration
  // Sentry.captureException(error, { extra: context });
}
```

### Error Digest

Next.js error boundaries provide a `digest` property for server errors:
- The `digest` is a hash that correlates client-side error reports with server-side logs.
- Show the digest to users only for support purposes: "Error ID: {digest}".

```tsx
{error.digest && (
  <p className="text-xs text-muted-foreground mt-4">
    Error ID: {error.digest}
  </p>
)}
```

---

## User-Friendly Error Messages

All user-facing error messages are written in **Japanese (standard keigo)** for the production site. The application uses i18n keys; below are the default messages:

| Error Code | Japanese Message | English (Reference) |
|---|---|---|
| `NETWORK_ERROR` | 接続に失敗しました。インターネット接続をご確認ください。 | Connection failed. Please check your internet connection. |
| `SERVER_ERROR` | サーバーエラーが発生しました。しばらくしてからもう一度お試しください。 | A server error occurred. Please try again later. |
| `NOT_FOUND` | お探しのページが見つかりません。 | The page you're looking for was not found. |
| `UNAUTHORIZED` | セッションが期限切れです。再度ログインしてください。 | Your session has expired. Please log in again. |
| `FORBIDDEN` | このページへのアクセス権限がありません。 | You don't have permission to access this page. |
| `RATE_LIMITED` | リクエストが多すぎます。{seconds}秒後にもう一度お試しください。 | Too many requests. Please try again in {seconds} seconds. |
| `VALIDATION_ERROR` | 入力内容をご確認ください。 | Please check your input. |
| `CONFLICT` | この情報は他のユーザーによって更新されています。ページを更新してください。 | This resource was updated by another user. Please refresh. |
| `OFFLINE` | オフラインです。一部の機能が利用できない場合があります。 | You are offline. Some features may not be available. |
| `UPLOAD_FAILED` | アップロードに失敗しました。もう一度お試しください。 | Upload failed. Please try again. |
| `GENERIC` | エラーが発生しました。もう一度お試しください。 | An error occurred. Please try again. |

### Message Guidelines

- Use polite/formal Japanese (です/ます form).
- Always provide an actionable next step (retry, return home, check input).
- Never expose technical details (stack traces, SQL errors, file paths) to users.
- Include the error digest ID for support reference on 500-level errors.

---

## Error Component Inventory

| Component | Type | Used For | Location |
|---|---|---|---|
| `PageError` | Full-page | error.tsx boundaries | `src/components/error/page-error.tsx` |
| `SectionError` | Inline card | Failed data sections within a page | `src/components/error/section-error.tsx` |
| `FormError` | Alert banner | Form submission failures | Inline in form components |
| `NotFoundPage` | Full-page | 404 pages | `app/not-found.tsx`, `app/*/not-found.tsx` |
| `OfflineBanner` | Fixed banner | Network offline detection | `src/components/error/offline-banner.tsx` |
| `RateLimitMessage` | Alert | 429 responses | `src/components/error/rate-limit-message.tsx` |
| `StaleDataIndicator` | Inline banner | Outdated data warning | `src/components/error/stale-data-indicator.tsx` |
| Toast (error) | Toast notification | Non-blocking errors | Via `sonner` toast library |

---

## Cross-References

- [Accessibility Pattern](./accessibility.md) — error announcement, aria-live
- [Forms Pattern](./forms.md) — form validation and error display
- [Empty States Pattern](./empty-states.md) — empty vs error distinction
- [Error Pages Spec](../04-pages/08-error-pages.md) — page designs for error states
- [Feedback Components](../03-components/feedback/) — Alert, Toast component specs
