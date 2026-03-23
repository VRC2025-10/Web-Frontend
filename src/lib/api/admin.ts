import { apiClient } from "./client";
import {
  type AdminUserApi,
  normalizeAdminUsersResponse,
} from "./admin-normalizers";
import type {
  PaginatedResponse,
  AdminUser,
  AdminReport,
  AdminStats,
  UserRole,
  UserStatus,
  GalleryImageStatus,
  GalleryTargetType,
  AdminGalleryImage,
  PublicClub,
  PublicEvent,
  Tag,
  ReportStatus,
} from "./types";

// ─── Stats ───────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  return apiClient("/api/v1/internal/admin/stats", {
    cache: "no-store",
    withCookies: true,
    timeout: 15_000,
  });
}

// ─── Users ───────────────────────────────────────────────

export async function getAdminUsers(params?: {
  page?: number;
  per_page?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}): Promise<PaginatedResponse<AdminUser>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.role) searchParams.set("role", params.role);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  const response = await apiClient<PaginatedResponse<AdminUserApi>>(
    `/api/v1/internal/admin/users${query ? `?${query}` : ""}`,
    { cache: "no-store", withCookies: true, timeout: 15_000 }
  );

  return normalizeAdminUsersResponse(response);
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<void> {
  return apiClient(`/api/v1/internal/admin/users/${encodeURIComponent(userId)}/role`, {
    method: "PUT",
    body: JSON.stringify({ new_role: newRole }),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<void> {
  return apiClient(`/api/v1/internal/admin/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    cache: "no-store",
    withCookies: true,
  });
}

// ─── Events ──────────────────────────────────────────────

export async function getAdminEvents(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<PublicEvent>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));

  const query = searchParams.toString();
  return apiClient(
    `/api/v1/internal/admin/events${query ? `?${query}` : ""}`,
    { cache: "no-store", withCookies: true, timeout: 15_000 }
  );
}

export async function createEvent(data: {
  title: string;
  description_markdown: string;
  start_time: string;
  end_time?: string;
  location?: string;
  tags?: string[];
  event_status?: string;
}): Promise<PublicEvent> {
  return apiClient("/api/v1/internal/admin/events", {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateEvent(
  id: string,
  data: {
    title?: string;
    description_markdown?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    tags?: string[];
    event_status?: string;
  }
): Promise<PublicEvent> {
  return apiClient(`/api/v1/internal/admin/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteEvent(id: string): Promise<void> {
  return apiClient(`/api/v1/internal/admin/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

// ─── Tags ────────────────────────────────────────────────

export async function getAdminTags(): Promise<Tag[]> {
  return apiClient("/api/v1/internal/admin/tags", {
    cache: "no-store",
    withCookies: true,
    timeout: 15_000,
  });
}

export async function createTag(data: {
  name: string;
  color: string;
}): Promise<Tag> {
  return apiClient("/api/v1/internal/admin/tags", {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateTag(
  id: string,
  data: { name?: string; color?: string }
): Promise<Tag> {
  return apiClient(`/api/v1/internal/admin/tags/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteTag(id: string): Promise<void> {
  return apiClient(`/api/v1/internal/admin/tags/${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

// ─── Reports ─────────────────────────────────────────────

export async function getAdminReports(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<AdminReport>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));

  const query = searchParams.toString();
  return apiClient(
    `/api/v1/internal/admin/reports${query ? `?${query}` : ""}`,
    { cache: "no-store", withCookies: true, timeout: 15_000 }
  );
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<void> {
  return apiClient(`/api/v1/internal/admin/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    cache: "no-store",
    withCookies: true,
  });
}

// ─── Galleries ───────────────────────────────────────────

export async function getAdminGalleries(params?: {
  page?: number;
  per_page?: number;
  target_type?: GalleryTargetType;
  club_id?: string;
}): Promise<PaginatedResponse<AdminGalleryImage>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.target_type) searchParams.set("target_type", params.target_type);
  if (params?.club_id) searchParams.set("club_id", params.club_id);

  const query = searchParams.toString();
  return apiClient(
    `/api/v1/internal/admin/galleries${query ? `?${query}` : ""}`,
    { cache: "no-store", withCookies: true, timeout: 15_000 }
  );
}

export async function updateGalleryImageStatus(
  imageId: string,
  status: GalleryImageStatus
): Promise<void> {
  return apiClient(`/api/v1/internal/admin/gallery/${encodeURIComponent(imageId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteGalleryImage(imageId: string): Promise<void> {
  return apiClient(`/api/v1/internal/admin/gallery/${encodeURIComponent(imageId)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

export async function uploadGalleryFiles(formData: FormData): Promise<{
  uploaded_count: number;
  items: AdminGalleryImage[];
}> {
  return apiClient("/api/v1/internal/admin/gallery/files", {
    method: "POST",
    body: formData,
    cache: "no-store",
    withCookies: true,
  });
}

// ─── Clubs ───────────────────────────────────────────────

export async function getAdminClubs(): Promise<PublicClub[]> {
  return apiClient("/api/v1/internal/admin/clubs", {
    cache: "no-store",
    withCookies: true,
    timeout: 15_000,
  });
}

export async function createClub(data: {
  name: string;
  description: string;
  cover_image_url?: string;
}): Promise<PublicClub> {
  return apiClient("/api/v1/internal/admin/clubs", {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateClub(
  id: string,
  data: { name?: string; description?: string; cover_image_url?: string }
): Promise<PublicClub> {
  return apiClient(`/api/v1/internal/admin/clubs/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteClub(id: string): Promise<void> {
  return apiClient(`/api/v1/internal/admin/clubs/${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

export async function uploadGalleryImage(
  data: {
    target_type: GalleryTargetType;
    club_id?: string;
    image_url: string;
    caption?: string;
  }
): Promise<AdminGalleryImage> {
  return apiClient(`/api/v1/internal/admin/gallery`, {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });
}
