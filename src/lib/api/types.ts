/** Generic paginated API response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  total_pages: number;
}

/** Standard API error response body */
export interface ApiErrorResponse {
  code: string;
  message?: string;
  details?: Record<string, string[]>;
}

/** Tag attached to events */
export interface Tag {
  id: string;
  name: string;
  color: string;
}

/** Member in public listing — summary view */
export interface PublicMember {
  user_id: string;
  discord_username: string;
  avatar_url: string | null;
  vrc_id: string | null;
  x_id: string | null;
  bio_summary: string | null;
  updated_at: string;
}

/** Full public profile of a member */
export interface PublicMemberDetail {
  user_id: string;
  discord_username: string;
  avatar_url: string | null;
  vrc_id: string | null;
  x_id: string | null;
  bio_markdown: string;
  bio_html: string;
  updated_at: string;
}

/** Authenticated user's own profile (editable) */
export interface MyProfile {
  vrc_id: string | null;
  x_id: string | null;
  bio_markdown: string;
  bio_html: string;
  is_public: boolean;
  updated_at: string;
}

/** Current authenticated user info */
export interface AuthMe {
  id: string;
  discord_id: string;
  discord_username: string;
  avatar_url: string | null;
  role: UserRole;
  profile: {
    vrc_id: string | null;
    x_id: string | null;
    is_public: boolean;
  } | null;
}

/** Possible error codes returned on /login?error= */
export type LoginErrorCode =
  | "auth_failed"
  | "csrf_failed"
  | "not_guild_member"
  | "discord_error"
  | "suspended";

/** Event in public listing */
export interface PublicEvent {
  id: string;
  title: string;
  description_markdown: string;
  host_name: string;
  host_user_id: string | null;
  event_status: EventStatus;
  start_time: string;
  end_time: string | null;
  location: string | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

/** Full event detail (public) */
export interface PublicEventDetail extends PublicEvent {}

/** Event with extended info for authenticated users */
export interface InternalEvent extends PublicEvent {
  extended_info: {
    sync_status: string;
  };
}

/** Club in public listing */
export interface PublicClub {
  id: string;
  name: string;
  description: string;
  description_html: string;
  cover_image_url: string | null;
  owner: UserBrief | null;
  member_count: number;
  created_at: string;
}

/** Full club detail (public) */
export interface PublicClubDetail extends PublicClub {
  members: Array<{
    user_id: string;
    discord_display_name: string;
    role: string;
    joined_at: string;
  }>;
}

export interface UserBrief {
  user_id: string;
  discord_display_name: string;
}

/** Gallery image target */
export type GalleryTargetType = "community" | "club";

/** Gallery image in a public club gallery */
export interface PublicGalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  uploaded_by: UserBrief;
  created_at: string;
}

export interface AdminGalleryClub {
  id: string;
  name: string;
}

/** Gallery image record in admin management */
export interface AdminGalleryImage {
  id: string;
  target_type: GalleryTargetType;
  club_id: string | null;
  club: AdminGalleryClub | null;
  uploaded_by: UserBrief;
  image_url: string;
  caption: string | null;
  status: GalleryImageStatus;
  created_at: string;
}

/** User record for admin management */
export interface AdminUser {
  id: string;
  discord_id: string;
  discord_username: string;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

/** Report record for admin review */
export interface AdminReport {
  id: string;
  reporter_id: string;
  reporter_username: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
}

/** Dashboard statistics for admin page */
export interface AdminStats {
  total_users: number;
  total_events: number;
  total_clubs: number;
  pending_reports: number;
}

/** User role hierarchy: member < staff < admin < super_admin */
export type UserRole = "member" | "staff" | "admin" | "super_admin";

/** Event publication status */
export type EventStatus = "draft" | "published" | "cancelled" | "archived";

/** Report moderation status */
export type ReportStatus = "pending" | "resolved" | "dismissed";

/** Gallery image moderation status */
export type GalleryImageStatus = "pending" | "approved" | "rejected";

/** Report target entity type */
export type ReportTargetType = "profile" | "event";

/** User account status */
export type UserStatus = "active" | "suspended";
