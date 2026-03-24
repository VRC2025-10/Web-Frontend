import { apiClient } from "./client";
import type { Tag } from "./types";

export interface PublicEventDetail {
  id: string;
  title: string;
  description_markdown: string;
  host_user_id: string | null;
  host_name: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export async function getEventById(id: string): Promise<PublicEventDetail> {
  return apiClient<PublicEventDetail>(`/api/v1/public/events/${encodeURIComponent(id)}`, {
    next: { revalidate: 60, tags: ["events", `event-${id}`] },
  });
}