# API TypeScript Type Definitions

> Version: 1.0 | Last updated: 2026-03-20

This document defines all TypeScript types mapping to backend API responses, Zod validation schemas for forms, and API client function signatures.

---

## 1. Common Types

### 1.1 Paginated Response

```typescript
// lib/api/types.ts

/** Generic paginated API response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  total_pages: number;
}
```

### 1.2 API Error

```typescript
/** Standard API error response body */
export interface ApiErrorResponse {
  code: string;
  message?: string;
  details?: Record<string, string[]>;
}
```

### 1.3 Tag

```typescript
/** Tag attached to events */
export interface Tag {
  id: string;
  name: string;
  color: string;
}
```

---

## 2. Member Types

### 2.1 PublicMember (List Item)

Returned by `GET /api/v1/public/members`.

```typescript
/** Member in public listing — summary view */
export interface PublicMember {
  user_id: string;
  discord_username: string;
  avatar_url: string | null;
  vrc_id: string | null;
  x_id: string | null;
  bio_summary: string | null;
  updated_at: string; // ISO 8601
}
```

### 2.2 PublicMemberDetail

Returned by `GET /api/v1/public/members/:user_id`.

```typescript
/** Full public profile of a member */
export interface PublicMemberDetail {
  user_id: string;
  discord_username: string;
  avatar_url: string | null;
  vrc_id: string | null;
  x_id: string | null;
  bio_markdown: string;
  bio_html: string;
  updated_at: string; // ISO 8601
}
```

### 2.3 MyProfile

Returned by `GET /api/v1/internal/me/profile`.

```typescript
/** Authenticated user's own profile (editable) */
export interface MyProfile {
  user_id: string;
  vrc_id: string | null;
  x_id: string | null;
  bio_markdown: string;
  bio_html: string;
  is_public: boolean;
  updated_at: string; // ISO 8601
}
```

---

## 3. Auth Types

### 3.1 AuthMe

Returned by `GET /api/v1/internal/auth/me`.

```typescript
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
  } | null; // null if profile not yet created
}
```

### 3.2 Login Error Codes

```typescript
/** Possible error codes returned on /login?error= */
export type LoginErrorCode =
  | "auth_failed"
  | "csrf_failed"
  | "not_guild_member"
  | "discord_error";
```

---

## 4. Event Types

### 4.1 PublicEvent (List Item)

Returned in `GET /api/v1/public/events` → `items[]`.

```typescript
/** Event in public listing */
export interface PublicEvent {
  id: string;
  title: string;
  description_markdown: string;
  host_name: string;
  host_user_id: string | null;
  event_status: EventStatus;
  start_time: string; // ISO 8601
  end_time: string | null; // ISO 8601
  location: string | null;
  tags: Tag[];
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### 4.2 PublicEventDetail

Returned by `GET /api/v1/public/events/:event_id`. Same shape as `PublicEvent` for public API.

```typescript
/** Full event detail (public) */
export interface PublicEventDetail extends PublicEvent {
  // Public API returns same fields as list items.
  // Extended fields may be added in future.
}
```

### 4.3 InternalEvent

Returned by `GET /api/v1/internal/events` → `items[]`.

```typescript
/** Event with extended info for authenticated users */
export interface InternalEvent extends PublicEvent {
  extended_info: {
    sync_status: string;
  };
}
```

---

## 5. Club Types

### 5.1 PublicClub (List Item)

Returned by `GET /api/v1/public/clubs`.

```typescript
/** Club in public listing */
export interface PublicClub {
  id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### 5.2 PublicClubDetail

Returned by `GET /api/v1/public/clubs/:id`.

```typescript
/** Full club detail (public) */
export interface PublicClubDetail extends PublicClub {
  // Same shape as list item for now.
  // May include additional fields like member count in future.
}
```

### 5.3 GalleryImage

Returned in `GET /api/v1/public/clubs/:id/gallery` → `items[]`.

```typescript
/** Gallery image in a club */
export interface GalleryImage {
  id: string;
  club_id: string;
  uploaded_by: string;
  image_url: string;
  status: GalleryImageStatus;
  created_at: string; // ISO 8601
}
```

---

## 6. Admin Types

### 6.1 AdminUser

Returned in `GET /api/v1/internal/admin/users` → `items[]`.

```typescript
/** User record for admin management */
export interface AdminUser {
  id: string;
  discord_id: string;
  discord_username: string;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### 6.2 AdminReport

Returned by admin reports endpoint.

```typescript
/** Report record for admin review */
export interface AdminReport {
  id: string;
  reporter_id: string;
  reporter_username: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string; // ISO 8601
}
```

### 6.3 AdminStats

Dashboard summary statistics.

```typescript
/** Dashboard statistics for admin page */
export interface AdminStats {
  total_users: number;
  total_events: number;
  total_clubs: number;
  pending_reports: number;
}
```

---

## 7. Enum Types

```typescript
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

/** VRChat instance type (for future use in event detail) */
export type InstanceType =
  | "public"
  | "friends_plus"
  | "friends"
  | "invite_plus"
  | "invite"
  | "group";
```

---

## 8. Zod Validation Schemas

### 8.1 Profile Form Schema

```typescript
// lib/validations/profile.ts
import { z } from "zod";

export const ProfileFormSchema = z.object({
  vrc_id: z
    .string()
    .max(100, "VRChat ID must be 100 characters or less")
    .nullable()
    .optional()
    .transform((val) => val || null),
  x_id: z
    .string()
    .max(16, "X ID must be 16 characters or less")
    .regex(/^@?[a-zA-Z0-9_]{0,15}$/, "Invalid X (Twitter) ID format")
    .nullable()
    .optional()
    .transform((val) => val || null),
  bio_markdown: z
    .string()
    .min(1, "Bio is required")
    .max(5000, "Bio must be 5000 characters or less"),
  is_public: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
```

### 8.2 Report Form Schema

```typescript
// lib/validations/report.ts
import { z } from "zod";

export const ReportFormSchema = z.object({
  target_type: z.enum(["profile", "event"], {
    required_error: "Target type is required",
  }),
  target_id: z.string().uuid("Invalid target ID"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(1000, "Reason must be 1000 characters or less"),
});

export type ReportFormValues = z.infer<typeof ReportFormSchema>;
```

### 8.3 Admin: User Role Change Schema

```typescript
// lib/validations/admin.ts
import { z } from "zod";

export const UserRoleChangeSchema = z.object({
  new_role: z.enum(["member", "staff", "admin", "super_admin"], {
    required_error: "Role is required",
  }),
});

export type UserRoleChangeValues = z.infer<typeof UserRoleChangeSchema>;
```

### 8.4 Admin: Gallery Status Update Schema

```typescript
// lib/validations/admin.ts

export const GalleryStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"], {
    required_error: "Status is required",
  }),
});

export type GalleryStatusValues = z.infer<typeof GalleryStatusSchema>;
```

---

## 9. API Client Function Signatures

### 9.1 Public API (`lib/api/`)

```typescript
// lib/api/events.ts
export async function getEvents(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<PublicEvent>>;

export async function getEventById(id: string): Promise<PublicEventDetail>;

// lib/api/members.ts
export async function getMembers(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<PublicMember>>;

export async function getMemberById(id: string): Promise<PublicMemberDetail>;

// lib/api/clubs.ts
export async function getClubs(): Promise<PublicClub[]>;

export async function getClubById(id: string): Promise<PublicClubDetail>;

export async function getClubGallery(
  clubId: string,
  params?: { page?: number; per_page?: number }
): Promise<PaginatedResponse<GalleryImage>>;
```

### 9.2 Auth & Profile API

```typescript
// lib/api/auth.ts
export async function getMe(): Promise<AuthMe | null>;

// lib/api/profile.ts
export async function getMyProfile(): Promise<MyProfile>;

export async function updateMyProfile(
  data: ProfileFormValues
): Promise<MyProfile>;
```

### 9.3 Admin API

```typescript
// lib/api/admin.ts
export async function getAdminUsers(params?: {
  page?: number;
  per_page?: number;
  role?: UserRole;
  status?: UserStatus;
}): Promise<PaginatedResponse<AdminUser>>;

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<void>;

export async function getAdminReports(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<AdminReport>>;

export async function updateGalleryImageStatus(
  imageId: string,
  status: GalleryImageStatus
): Promise<void>;

export async function createClub(data: {
  name: string;
  description: string;
  cover_image_url?: string;
}): Promise<PublicClub>;

export async function uploadGalleryImage(
  clubId: string,
  imageUrl: string
): Promise<GalleryImage>;
```

---

## 10. Date Handling

### 10.1 ISO String Convention

All date/time values from the API are ISO 8601 strings in UTC:

```typescript
// API returns: "2026-03-15T19:00:00Z"
// Stored in TypeScript as: string (not Date object)
```

### 10.2 Conversion to Date Objects

Convert only when needed for display or calculation:

```typescript
import { parseISO, format } from "date-fns";
import { ja } from "date-fns/locale/ja";

const dateStr = event.start_time; // "2026-03-15T19:00:00Z"
const date = parseISO(dateStr);    // Date object

// Format for display
format(date, "yyyy年M月d日 HH:mm", { locale: ja });
// → "2026年3月15日 19:00"
```

### 10.3 Rules

| Rule | Description |
|---|---|
| Store as `string` | Type definitions use `string` for date fields, not `Date` |
| Parse on demand | Convert to `Date` only when formatting for display |
| Use `parseISO()` | Always use date-fns `parseISO()` for conversion (handles UTC correctly) |
| Display with locale | Pass `locale` to `format()` for language-appropriate formatting |
| No timezone assumption | All API times are UTC; display conversion handled by date-fns |

---

## 11. Type Export Organization

All types are centralized in `lib/api/types.ts`:

```typescript
// lib/api/types.ts

// === Common ===
export interface PaginatedResponse<T> { ... }
export interface ApiErrorResponse { ... }
export interface Tag { ... }

// === Enums ===
export type UserRole = ...;
export type EventStatus = ...;
export type ReportStatus = ...;
export type GalleryImageStatus = ...;
export type ReportTargetType = ...;
export type UserStatus = ...;
export type InstanceType = ...;
export type LoginErrorCode = ...;

// === Members ===
export interface PublicMember { ... }
export interface PublicMemberDetail { ... }
export interface MyProfile { ... }

// === Auth ===
export interface AuthMe { ... }

// === Events ===
export interface PublicEvent { ... }
export interface PublicEventDetail { ... }
export interface InternalEvent { ... }

// === Clubs ===
export interface PublicClub { ... }
export interface PublicClubDetail { ... }
export interface GalleryImage { ... }

// === Admin ===
export interface AdminUser { ... }
export interface AdminReport { ... }
export interface AdminStats { ... }
```

Zod schemas are in separate files under `lib/validations/` and are **not** co-located with types, because schemas carry runtime code while types are compile-time only.
