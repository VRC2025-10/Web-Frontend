import type { AdminUser, PaginatedResponse, UserRole, UserStatus } from "./types";

export interface AdminUserApi {
  id: string;
  discord_id: string;
  discord_display_name?: string | null;
  discord_avatar_hash?: string | null;
  role: UserRole;
  status: UserStatus;
  joined_at?: string;
  updated_at: string;
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

function resolveAdminUserName(user: AdminUserApi): string {
  const displayName = user.discord_display_name?.trim();
  return displayName && displayName.length > 0 ? displayName : "Unknown user";
}

export function normalizeAdminUser(user: AdminUserApi): AdminUser {
  return {
    id: user.id,
    discord_id: user.discord_id,
    discord_username: resolveAdminUserName(user),
    avatar_url: buildDiscordAvatarUrl(user.discord_id, user.discord_avatar_hash),
    role: user.role,
    status: user.status,
    created_at: user.joined_at ?? user.updated_at,
    updated_at: user.updated_at,
  };
}

export function normalizeAdminUsersResponse(
  response: PaginatedResponse<AdminUserApi>
): PaginatedResponse<AdminUser> {
  return {
    ...response,
    items: response.items.map(normalizeAdminUser),
  };
}