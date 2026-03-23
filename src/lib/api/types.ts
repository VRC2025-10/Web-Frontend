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

/** Tag */
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
  admin_access: boolean;
  admin_permissions: AdminPermissionSet;
  schedule_access: boolean;
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

export interface AdminPermissionSet {
  view_dashboard: boolean;
  manage_users: boolean;
  manage_roles: boolean;
  manage_events: boolean;
  manage_tags: boolean;
  manage_reports: boolean;
  manage_galleries: boolean;
  manage_clubs: boolean;
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

export interface AdminManagedRole {
  id: string;
  discord_role_id: string;
  display_name: string;
  description: string;
  can_view_dashboard: boolean;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_manage_events: boolean;
  can_manage_tags: boolean;
  can_manage_reports: boolean;
  can_manage_galleries: boolean;
  can_manage_clubs: boolean;
  updated_at: string;
}

export interface AdminSystemRolePolicy {
  role: UserRole;
  can_view_dashboard: boolean;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_manage_events: boolean;
  can_manage_tags: boolean;
  can_manage_reports: boolean;
  can_manage_galleries: boolean;
  can_manage_clubs: boolean;
  updated_at: string;
}

export interface AdminRolePayload {
  discord_role_id: string;
  display_name: string;
  description: string;
  can_view_dashboard: boolean;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_manage_events: boolean;
  can_manage_tags: boolean;
  can_manage_reports: boolean;
  can_manage_galleries: boolean;
  can_manage_clubs: boolean;
}

export interface AdminSystemRolePolicyPayload {
  can_view_dashboard: boolean;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_manage_events: boolean;
  can_manage_tags: boolean;
  can_manage_reports: boolean;
  can_manage_galleries: boolean;
  can_manage_clubs: boolean;
}

/** User role hierarchy: member < staff < admin < super_admin */
export type UserRole = "member" | "staff" | "admin" | "super_admin";

/** Report moderation status */
export type ReportStatus = "pending" | "resolved" | "dismissed";

/** Gallery image moderation status */
export type GalleryImageStatus = "pending" | "approved" | "rejected";

/** Report target entity type */
export type ReportTargetType = "profile";

/** User account status */
export type UserStatus = "active" | "suspended";

export interface SchedulePermissionSet {
  manage_roles: boolean;
  manage_events: boolean;
  manage_templates: boolean;
  manage_notifications: boolean;
  view_restricted_events: boolean;
}

export interface ScheduleViewer {
  id: string;
  discord_id: string;
  discord_display_name: string;
  avatar_url: string | null;
  role: UserRole;
  discord_role_ids: string[];
  permissions: SchedulePermissionSet;
  schedule_access: boolean;
}

export interface ScheduleManagedRole {
  id: string;
  discord_role_id: string;
  display_name: string;
  description: string;
  can_manage_roles: boolean;
  can_manage_events: boolean;
  can_manage_templates: boolean;
  can_manage_notifications: boolean;
  can_view_restricted_events: boolean;
}

export interface ScheduleRolePayload {
  discord_role_id: string;
  display_name: string;
  description: string;
  can_manage_roles: boolean;
  can_manage_events: boolean;
  can_manage_templates: boolean;
  can_manage_notifications: boolean;
  can_view_restricted_events: boolean;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  is_default: boolean;
}

export interface ScheduleTemplatePayload {
  name: string;
  title: string;
  description: string;
  is_default: boolean;
}

export type ScheduleVisibilityMode = "public" | "restricted";

export interface ScheduleTimelineEvent {
  id: string | null;
  display_mode: "full" | "masked";
  title: string | null;
  description: string | null;
  start_at: string;
  end_at: string;
  visibility_mode: ScheduleVisibilityMode;
  auto_notify_enabled: boolean | null;
  visible_role_ids: string[];
  created_by_viewer: boolean;
  editable: boolean;
}

export interface ScheduleTimelineDay {
  date: string;
  events: ScheduleTimelineEvent[];
}

export interface ScheduleTimeline {
  from: string;
  days: number;
  timezone: string;
  timeline: ScheduleTimelineDay[];
}

export interface ScheduleEventPayload {
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  visibility_mode: ScheduleVisibilityMode;
  auto_notify_enabled: boolean;
  visible_role_ids: string[];
}

export type ScheduleNotificationScheduleType = "before_event" | "daily_at";

export interface ScheduleNotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  schedule_type: ScheduleNotificationScheduleType;
  offset_minutes: number | null;
  time_of_day: string | null;
  window_start_minutes: number | null;
  window_end_minutes: number | null;
  body_template: string;
  list_item_template: string | null;
}

export interface ScheduleNotificationRulePayload {
  name: string;
  enabled: boolean;
  schedule_type: ScheduleNotificationScheduleType;
  offset_minutes?: number;
  time_of_day?: string;
  window_start_minutes?: number;
  window_end_minutes?: number;
  body_template: string;
  list_item_template?: string;
}

export interface ScheduleNotificationPlaceholders {
  before_event: string[];
  daily_body: string[];
  daily_item: string[];
}

export interface ScheduleNotificationState {
  webhook_url: string;
  rules: ScheduleNotificationRule[];
  placeholders: ScheduleNotificationPlaceholders;
}

export interface ScheduleBootstrapResponse {
  viewer: ScheduleViewer;
  timeline: ScheduleTimeline;
  managed_roles: ScheduleManagedRole[];
  templates: ScheduleTemplate[];
  notifications: ScheduleNotificationState | null;
}
