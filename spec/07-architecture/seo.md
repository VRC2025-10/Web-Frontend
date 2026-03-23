# SEO Specification

> Version: 1.0 | Last updated: 2026-03-20

This document defines the per-page SEO strategy, including metadata, Open Graph, sitemap, robots.txt, structured data, and social sharing configuration.

---

## 1. Global Configuration

### 1.1 Site Title Template

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | VRChat 10月同期会",
    default: "VRChat 10月同期会",
  },
  description: "VRChat 10月同期コミュニティの公式ウェブサイト",
};
```

All pages use the template pattern: **`Page Title | VRChat 10月同期会`**

### 1.2 Favicon & App Manifest

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};
```

---

## 2. Per-Page Metadata Table

| Route | Title | Description | OG Type | OG Image | Twitter Card |
|---|---|---|---|---|---|
| `/` | `VRChat 10月同期会` (default) | VRChat 10月同期コミュニティの公式ウェブサイト | `website` | Static site OG image | `summary_large_image` |
| `/events` | `イベント一覧` | VRChat 10月同期会のイベント情報 | `website` | Static site OG image | `summary` |
| `/events/[id]` | `{event.title}` | `{event.description_markdown}` (truncated to 160 chars) | `article` | `{event.thumbnail_url}` or static fallback | `summary_large_image` |
| `/members` | `メンバー一覧` | VRChat 10月同期会のメンバー | `website` | Static site OG image | `summary` |
| `/members/[id]` | `{member.discord_username}のプロフィール` | `{member.bio_summary}` (truncated) | `profile` | Static site OG image | `summary` |
| `/clubs` | `部活動一覧` | VRChat 10月同期会の部活動 | `website` | Static site OG image | `summary` |
| `/clubs/[id]` | `{club.name}` | `{club.description}` (truncated) | `website` | `{club.cover_image_url}` or static fallback | `summary_large_image` |
| `/login` | `ログイン` | Discord でログイン | `website` | Static site OG image | `summary` |
| `/admin/*` | — | — (noindex) | — | — | — |
| `/settings/*` | — | — (noindex) | — | — | — |
| `404` | `ページが見つかりません` | — | — | — | — |

---

## 3. generateMetadata Implementation

### 3.1 Static Pages

```typescript
// app/(public)/events/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "イベント一覧",
  description: "VRChat 10月同期会のイベント情報",
  openGraph: {
    title: "イベント一覧 | VRChat 10月同期会",
    description: "VRChat 10月同期会のイベント情報",
    type: "website",
  },
};
```

### 3.2 Dynamic Pages

```typescript
// app/(public)/events/[id]/page.tsx
import type { Metadata } from "next";
import { getEventById } from "@/lib/api/events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  const description = event.description_markdown.slice(0, 160);
  const ogImage = event.thumbnail_url || "/og-default.jpg";

  return {
    title: event.title,
    description,
    openGraph: {
      title: `${event.title} | VRChat 10月同期会`,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: [ogImage],
    },
  };
}
```

### 3.3 Member Profile Page

```typescript
// app/(public)/members/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);

  return {
    title: `${member.discord_username}のプロフィール`,
    description: member.bio_summary || `${member.discord_username}のプロフィールページ`,
    openGraph: {
      title: `${member.discord_username} | VRChat 10月同期会`,
      description: member.bio_summary || "",
      type: "profile",
    },
    twitter: {
      card: "summary",
    },
  };
}
```

---

## 4. Sitemap Generation

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/members`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/clubs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic event routes
  const eventsRes = await fetch(
    `${process.env.INTERNAL_API_URL}/api/v1/public/events?status=published&per_page=100`
  );
  const eventsData = await eventsRes.json();
  const eventRoutes: MetadataRoute.Sitemap = eventsData.items.map(
    (event: { id: string; updated_at: string }) => ({
      url: `${BASE_URL}/events/${event.id}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // Dynamic member routes
  const membersRes = await fetch(
    `${process.env.INTERNAL_API_URL}/api/v1/public/members?per_page=100`
  );
  const membersData = await membersRes.json();
  const memberRoutes: MetadataRoute.Sitemap = membersData.items.map(
    (member: { user_id: string; updated_at: string }) => ({
      url: `${BASE_URL}/members/${member.user_id}`,
      lastModified: new Date(member.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })
  );

  // Dynamic club routes
  const clubsRes = await fetch(
    `${process.env.INTERNAL_API_URL}/api/v1/public/clubs`
  );
  const clubsData = await clubsRes.json();
  const clubRoutes: MetadataRoute.Sitemap = clubsData.map(
    (club: { id: string; updated_at: string }) => ({
      url: `${BASE_URL}/clubs/${club.id}`,
      lastModified: new Date(club.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })
  );

  return [...staticRoutes, ...eventRoutes, ...memberRoutes, ...clubRoutes];
}
```

---

## 5. Robots.txt

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/settings", "/settings/*"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

**Generated output:**

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /settings
Disallow: /settings/*

Sitemap: https://example.com/sitemap.xml
```

---

## 6. Structured Data (JSON-LD)

### 6.1 Organization (Home Page)

```typescript
// app/(public)/page.tsx
export default async function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VRChat 10月同期会",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description: "VRChat 10月同期コミュニティの公式ウェブサイト",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

### 6.2 Event (Event Detail Page)

```typescript
// app/(public)/events/[id]/page.tsx
export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = await getEventById(id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description_markdown.slice(0, 300),
    startDate: event.start_time,
    endDate: event.end_time || undefined,
    location: {
      "@type": "VirtualLocation",
      name: event.location || "VRChat",
    },
    organizer: {
      "@type": "Person",
      name: event.host_name,
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetail event={event} />
    </>
  );
}
```

---

## 7. Canonical URLs

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  alternates: {
    canonical: "./",
  },
};
```

Each page generates a canonical URL based on `metadataBase`:
- `/events` → `https://example.com/events`
- `/events/abc-123` → `https://example.com/events/abc-123`

---

## 8. Open Graph Configuration

### 8.1 Default OG Image

A static default OG image is used when no dynamic image is available:

```
public/
├── og-default.jpg         # 1200×630, site branding + "Autumn Soft" design
├── apple-touch-icon.png   # 180×180
├── favicon.ico            # 32×32
└── logo.png               # Site logo for structured data
```

### 8.2 OG Type Mapping

| Page Type | `og:type` | Rationale |
|---|---|---|
| Home | `website` | Top-level site page |
| Event list | `website` | Collection page |
| Event detail | `article` | Individual content page with date/author |
| Member list | `website` | Collection page |
| Member detail | `profile` | Individual person page |
| Club list | `website` | Collection page |
| Club detail | `website` | Organization/group page |
| Login | `website` | Utility page |

---

## 9. Twitter Card Configuration

| Page Type | Card Type | Rationale |
|---|---|---|
| Home | `summary_large_image` | Prominent site branding |
| Events list | `summary` | No large image needed |
| Event detail | `summary_large_image` | Show event thumbnail |
| Members list | `summary` | No large image needed |
| Member detail | `summary` | Privacy — no large image |
| Club list | `summary` | No large image needed |
| Club detail | `summary_large_image` | Show club cover image |
| Login | `summary` | Utility page |

---

## 10. Language Meta

```html
<html lang="ja">
```

- Primary language is Japanese
- The `lang` attribute is set dynamically based on the `NEXT_LOCALE` cookie via next-intl
- Search engine crawlers (no cookie) always receive `lang="ja"`

---

## 11. Admin & Settings Pages

Admin and settings pages are excluded from search engines:

```typescript
// app/admin/layout.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// app/settings/profile/page.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

---

## 12. SEO Checklist

| Item | Status | Implementation |
|---|---|---|
| Title template | Required | `%s \| VRChat 10月同期会` in root layout |
| Meta description | Required | Per-page in `metadata` or `generateMetadata` |
| OG title | Required | Matches page title with site name |
| OG description | Required | Matches meta description |
| OG image | Required | Dynamic for events/clubs, static fallback |
| OG type | Required | Per-page mapping (see §8.2) |
| Twitter card | Required | `summary` or `summary_large_image` per page |
| Canonical URL | Required | Auto-generated via `metadataBase` |
| Sitemap | Required | Dynamic `app/sitemap.ts` |
| Robots.txt | Required | `app/robots.ts` — disallow admin/settings |
| JSON-LD | Required | Organization (home), Event (event detail) |
| `lang` attribute | Required | `<html lang="ja">` (dynamic via next-intl) |
| Favicon | Required | `favicon.ico` + `apple-touch-icon.png` |
| noindex on admin | Required | `robots: { index: false }` on admin/settings layouts |
