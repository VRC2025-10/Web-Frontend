import type { PaginatedResponse, PublicMember, PublicMemberDetail } from "./types";

interface PublicMemberProfileApi {
  nickname?: string | null;
  vrc_id?: string | null;
  x_id?: string | null;
  bio_markdown?: string | null;
  bio_html?: string | null;
  avatar_url?: string | null;
  updated_at?: string;
}

export interface PublicMemberApi {
  user_id: string;
  discord_display_name?: string | null;
  discord_avatar_hash?: string | null;
  joined_at?: string;
  profile?: PublicMemberProfileApi | null;
}

interface ClubMembershipApi {
  id: string;
  name: string;
  role: string;
}

export interface PublicMemberDetailApi extends PublicMemberApi {
  clubs?: ClubMembershipApi[];
}

function buildDiscordAvatarUrl(
  discordId: string,
  avatarHash: string | null | undefined
): string | null {
  if (!avatarHash) {
    return null;
  }

  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function summarizeBio(html: string | null | undefined): string | null {
  const text = stripHtml(html);
  if (!text) {
    return null;
  }

  return text.length > 120 ? `${text.slice(0, 117).trimEnd()}...` : text;
}

function resolvePublicMemberName(member: PublicMemberApi): string {
  const displayName = member.discord_display_name?.trim();
  return displayName && displayName.length > 0 ? displayName : "Unknown member";
}

function resolvePublicMemberAvatar(member: PublicMemberApi): string | null {
  return (
    member.profile?.avatar_url ??
    buildDiscordAvatarUrl(member.user_id, member.discord_avatar_hash)
  );
}

export function normalizePublicMember(member: PublicMemberApi): PublicMember {
  return {
    user_id: member.user_id,
    discord_username: resolvePublicMemberName(member),
    avatar_url: resolvePublicMemberAvatar(member),
    vrc_id: member.profile?.vrc_id ?? null,
    x_id: member.profile?.x_id ?? null,
    bio_summary: summarizeBio(member.profile?.bio_html),
    updated_at: member.profile?.updated_at ?? member.joined_at ?? new Date(0).toISOString(),
  };
}

export function normalizePublicMemberDetail(
  member: PublicMemberDetailApi
): PublicMemberDetail {
  return {
    user_id: member.user_id,
    discord_username: resolvePublicMemberName(member),
    avatar_url: resolvePublicMemberAvatar(member),
    vrc_id: member.profile?.vrc_id ?? null,
    x_id: member.profile?.x_id ?? null,
    bio_markdown: member.profile?.bio_markdown ?? "",
    bio_html: member.profile?.bio_html ?? "",
    updated_at: member.profile?.updated_at ?? member.joined_at ?? new Date(0).toISOString(),
  };
}

export function normalizePublicMemberCollection(
  members: PublicMemberApi[]
): PublicMember[] {
  return members.map(normalizePublicMember);
}

export function normalizePublicMembersResponse(
  response: PaginatedResponse<PublicMemberApi>
): PaginatedResponse<PublicMember> {
  return {
    ...response,
    items: normalizePublicMemberCollection(response.items),
  };
}