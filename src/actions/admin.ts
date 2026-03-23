"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { rethrowIfNextControlFlow } from "@/lib/next-control-flow";
import {
  updateUserRole,
  updateUserStatus,
  updateGalleryImageStatus,
  deleteGalleryImage as deleteGalleryImageApi,
  uploadGalleryImage as uploadGalleryImageApi,
  uploadGalleryFiles as uploadGalleryFilesApi,
  createEvent as createEventApi,
  updateEvent as updateEventApi,
  deleteEvent as deleteEventApi,
  createTag as createTagApi,
  updateTag as updateTagApi,
  deleteTag as deleteTagApi,
  createClub as createClubApi,
  updateClub as updateClubApi,
  deleteClub as deleteClubApi,
  updateReportStatus,
} from "@/lib/api/admin";
import type {
  UserRole,
  UserStatus,
  GalleryImageStatus,
  GalleryTargetType,
  ReportStatus,
} from "@/lib/api/types";

// ─── Users ───────────────────────────────────────────────

export async function changeUserRoleAction(userId: string, newRole: UserRole) {
  try {
    await updateUserRole(userId, newRole);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to change role" };
  }
}

export async function changeUserStatusAction(userId: string, status: UserStatus) {
  try {
    await updateUserStatus(userId, status);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update user status" };
  }
}

// ─── Galleries ───────────────────────────────────────────

export async function updateGalleryStatusAction(
  imageId: string,
  status: GalleryImageStatus,
  options?: { targetType?: GalleryTargetType; clubId?: string | null }
) {
  try {
    await updateGalleryImageStatus(imageId, status);
    revalidatePath("/admin/galleries");
    if (options?.targetType === "club" && options.clubId) {
      revalidateTag(`club-${options.clubId}-gallery`, "max");
      revalidatePath(`/clubs/${options.clubId}`);
    }
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update status" };
  }
}

export async function deleteGalleryImageAction(
  imageId: string,
  options?: { targetType?: GalleryTargetType; clubId?: string | null }
) {
  try {
    await deleteGalleryImageApi(imageId);
    revalidatePath("/admin/galleries");
    if (options?.targetType === "club" && options.clubId) {
      revalidateTag(`club-${options.clubId}-gallery`, "max");
      revalidatePath(`/clubs/${options.clubId}`);
    }
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete image" };
  }
}

export async function uploadGalleryImageAction(data: {
  target_type: GalleryTargetType;
  club_id?: string;
  image_url: string;
  caption?: string;
}) {
  try {
    await uploadGalleryImageApi(data);
    revalidatePath("/admin/galleries");
    if (data.target_type === "club" && data.club_id) {
      revalidateTag(`club-${data.club_id}-gallery`, "max");
      revalidatePath(`/clubs/${data.club_id}`);
    }
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to upload image" };
  }
}

export async function uploadGalleryFilesAction(formData: FormData) {
  const targetType = String(formData.get("target_type") ?? "").trim() as GalleryTargetType;
  const clubIdValue = String(formData.get("club_id") ?? "").trim();
  const clubId = clubIdValue || undefined;

  try {
    const response = await uploadGalleryFilesApi(formData);
    revalidatePath("/admin/galleries");
    if (targetType === "club" && clubId) {
      revalidateTag(`club-${clubId}-gallery`, "max");
      revalidatePath(`/clubs/${clubId}`);
    }
    return { success: true, uploadedCount: response.uploaded_count };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to upload image files" };
  }
}

// ─── Events ──────────────────────────────────────────────

export async function createEventAction(data: {
  title: string;
  description_markdown: string;
  start_time: string;
  end_time?: string;
  location?: string;
  tags?: string[];
  event_status?: string;
}) {
  try {
    await createEventApi(data);
    revalidatePath("/admin/events");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to create event" };
  }
}

export async function updateEventAction(
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
) {
  try {
    await updateEventApi(id, data);
    revalidatePath("/admin/events");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update event" };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await deleteEventApi(id);
    revalidatePath("/admin/events");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete event" };
  }
}

// ─── Tags ────────────────────────────────────────────────

export async function createTagAction(data: { name: string; color: string }) {
  try {
    await createTagApi(data);
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to create tag" };
  }
}

export async function updateTagAction(
  id: string,
  data: { name?: string; color?: string }
) {
  try {
    await updateTagApi(id, data);
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update tag" };
  }
}

export async function deleteTagAction(id: string) {
  try {
    await deleteTagApi(id);
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete tag" };
  }
}

// ─── Clubs ───────────────────────────────────────────────

export async function createClubAction(data: {
  name: string;
  description: string;
  cover_image_url?: string;
}) {
  try {
    await createClubApi(data);
    revalidatePath("/admin/clubs");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to create club" };
  }
}

export async function updateClubAction(
  id: string,
  data: { name?: string; description?: string; cover_image_url?: string }
) {
  try {
    await updateClubApi(id, data);
    revalidatePath("/admin/clubs");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update club" };
  }
}

export async function deleteClubAction(id: string) {
  try {
    await deleteClubApi(id);
    revalidatePath("/admin/clubs");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete club" };
  }
}

// ─── Reports ─────────────────────────────────────────────

export async function resolveReportAction(reportId: string, status: ReportStatus) {
  try {
    await updateReportStatus(reportId, status);
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update report" };
  }
}
