import { apiClient } from "./client";
import type { MyProfile } from "./types";
import type { ProfileFormValues } from "@/lib/validations/profile";

interface MyProfileApi {
  nickname?: string | null;
  vrc_id?: string | null;
  x_id?: string | null;
  bio_markdown?: string | null;
  bio_html?: string | null;
  avatar_url?: string | null;
  is_public: boolean;
  updated_at: string;
}

function normalizeMyProfile(profile: MyProfileApi): MyProfile {
  return {
    vrc_id: profile.vrc_id ?? null,
    x_id: profile.x_id ?? null,
    bio_markdown: profile.bio_markdown ?? "",
    bio_html: profile.bio_html ?? "",
    is_public: profile.is_public,
    updated_at: profile.updated_at,
  };
}

export async function getMyProfile(): Promise<MyProfile> {
  const profile = await apiClient<MyProfileApi>("/api/v1/internal/me/profile", {
    cache: "no-store",
    withCookies: true,
  });

  return normalizeMyProfile(profile);
}

export async function updateMyProfile(data: ProfileFormValues): Promise<MyProfile> {
  const profile = await apiClient<MyProfileApi>("/api/v1/internal/me/profile", {
    method: "PUT",
    body: JSON.stringify(data),
    cache: "no-store",
    withCookies: true,
  });

  return normalizeMyProfile(profile);
}
