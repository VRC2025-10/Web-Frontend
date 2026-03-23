import { apiClient } from "./client";
import {
  type PublicClubApi,
  type PublicClubDetailApi,
  normalizePublicClubCollection,
  normalizePublicClubDetail,
} from "./club-normalizers";
import type { PaginatedResponse, PublicClub, PublicClubDetail, PublicGalleryImage } from "./types";

export async function getClubs(): Promise<PublicClub[]> {
  const response = await apiClient<PaginatedResponse<PublicClubApi>>("/api/v1/public/clubs", {
    next: { revalidate: 60, tags: ["clubs"] },
  });

  return normalizePublicClubCollection(response.items);
}

export async function getClubById(id: string): Promise<PublicClubDetail> {
  const response = await apiClient<PublicClubDetailApi>(`/api/v1/public/clubs/${encodeURIComponent(id)}`, {
    next: { revalidate: 60, tags: ["clubs", `club-${id}`] },
  });

  return normalizePublicClubDetail(response);
}

export async function getClubGallery(
  clubId: string,
  params?: { page?: number; per_page?: number }
): Promise<PaginatedResponse<PublicGalleryImage>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));

  const query = searchParams.toString();
  return apiClient(
    `/api/v1/public/clubs/${encodeURIComponent(clubId)}/gallery${query ? `?${query}` : ""}`,
    {
      next: { revalidate: 60, tags: ["clubs", `club-${clubId}-gallery`] },
    }
  );
}
