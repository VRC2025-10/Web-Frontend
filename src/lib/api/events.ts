import { apiClient } from "./client";
import type { PaginatedResponse, PublicEvent, PublicEventDetail } from "./types";

export async function getEvents(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  tags?: string;
  sort?: string;
}): Promise<PaginatedResponse<PublicEvent>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.tags) searchParams.set("tags", params.tags);
  if (params?.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  return apiClient(`/api/v1/public/events${query ? `?${query}` : ""}`, {
    next: { revalidate: 60, tags: ["events"] },
  });
}

export async function getEventById(id: string): Promise<PublicEventDetail> {
  return apiClient(`/api/v1/public/events/${encodeURIComponent(id)}`, {
    next: { revalidate: 60, tags: ["events", `event-${id}`] },
  });
}
