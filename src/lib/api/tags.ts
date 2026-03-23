import { apiClient } from "./client";
import type { Tag } from "./types";

export async function getTags(): Promise<Tag[]> {
  return apiClient("/api/v1/public/tags", {
    next: { revalidate: 300, tags: ["tags"] },
  });
}
