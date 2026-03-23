import { apiClient } from "./client";
import {
  type PublicMemberApi,
  type PublicMemberDetailApi,
  normalizePublicMemberDetail,
  normalizePublicMembersResponse,
} from "./member-normalizers";
import type { PaginatedResponse, PublicMember, PublicMemberDetail } from "./types";

export async function getMembers(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<PublicMember>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));

  const query = searchParams.toString();
  const response = await apiClient<PaginatedResponse<PublicMemberApi>>(
    `/api/v1/public/members${query ? `?${query}` : ""}`,
    {
      next: { revalidate: 60, tags: ["members"] },
    }
  );

  return normalizePublicMembersResponse(response);
}

export async function getMemberById(id: string): Promise<PublicMemberDetail> {
  const response = await apiClient<PublicMemberDetailApi>(
    `/api/v1/public/members/${encodeURIComponent(id)}`,
    {
      next: { revalidate: 60, tags: ["members", `member-${id}`] },
    }
  );

  return normalizePublicMemberDetail(response);
}
