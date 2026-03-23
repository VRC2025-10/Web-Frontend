import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const INTERNAL_API_BASE = process.env.INTERNAL_API_URL || "http://backend:8080";

function safeLastModified(value?: string): Date {
  const date = value ? new Date(value) : new Date(0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  let eventRoutes: MetadataRoute.Sitemap = [];
  let memberRoutes: MetadataRoute.Sitemap = [];
  let clubRoutes: MetadataRoute.Sitemap = [];

  try {
    const eventsRes = await fetch(
      `${INTERNAL_API_BASE}/api/v1/public/events?status=published&per_page=100`,
      { next: { revalidate: 3600 } }
    );
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      eventRoutes = (eventsData.items ?? []).map(
        (event: { id: string; updated_at: string }) => ({
          url: `${BASE_URL}/events/${event.id}`,
          lastModified: safeLastModified(event.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })
      );
    }
  } catch {
    // Sitemap generation should not fail if the API is unavailable
  }

  try {
    const membersRes = await fetch(
      `${INTERNAL_API_BASE}/api/v1/public/members?per_page=100`,
      { next: { revalidate: 3600 } }
    );
    if (membersRes.ok) {
      const membersData = await membersRes.json();
      memberRoutes = (membersData.items ?? []).map(
        (member: { user_id: string; updated_at: string }) => ({
          url: `${BASE_URL}/members/${member.user_id}`,
          lastModified: safeLastModified(member.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        })
      );
    }
  } catch {
    // Continue without member routes
  }

  try {
    const clubsRes = await fetch(
      `${INTERNAL_API_BASE}/api/v1/public/clubs`,
      { next: { revalidate: 3600 } }
    );
    if (clubsRes.ok) {
      const clubsData = await clubsRes.json();
      clubRoutes = (clubsData ?? []).map(
        (club: { id: string; updated_at: string }) => ({
          url: `${BASE_URL}/clubs/${club.id}`,
          lastModified: safeLastModified(club.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })
      );
    }
  } catch {
    // Continue without club routes
  }

  return [...staticRoutes, ...eventRoutes, ...memberRoutes, ...clubRoutes];
}
