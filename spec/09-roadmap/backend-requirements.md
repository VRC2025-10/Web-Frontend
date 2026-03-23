# Backend API Requirements

> **Version:** 1.0
> **Last Updated:** 2026-03-20

## Overview

This document lists backend API endpoints that the frontend requires but do not yet exist. Each endpoint includes the HTTP method, path, required role, request/response schema, priority, and the frontend page(s) that depend on it.

Development can proceed in parallel using Mock Service Worker (MSW) with the schemas defined below.

---

## Priority Definitions

| Priority     | Definition                                                   |
| ------------ | ------------------------------------------------------------ |
| **Must-have**| Required for core functionality; blocks the frontend phase.  |
| **Should-have**| Important for complete experience; can launch without but should follow quickly. |
| **Nice-to-have**| Enhances UX but not critical; can be deferred post-launch. |

---

## API-01: Admin Event Create

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `POST`                                                   |
| Path            | `/api/v1/internal/admin/events`                          |
| Required Role   | `admin`                                                  |
| Priority        | **Must-have**                                            |
| Frontend Page   | Admin Event Management                                   |
| Phase           | Phase 4                                                  |

### Request Schema

```json
{
  "title": "string (required, max 200)",
  "description": "string (required, Markdown, max 10000)",
  "start_date": "string (required, ISO 8601 datetime)",
  "end_date": "string (required, ISO 8601 datetime)",
  "image_url": "string (optional, URL to MinIO object)",
  "tag_ids": ["string (UUID, optional)"],
  "status": "string (enum: draft | published)",
  "location": "string (optional, max 200)"
}
```

### Response Schema

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string",
  "description_html": "string (sanitized HTML)",
  "start_date": "string (ISO 8601)",
  "end_date": "string (ISO 8601)",
  "image_url": "string | null",
  "tags": [{ "id": "string", "name": "string", "color": "string" }],
  "status": "string",
  "location": "string | null",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

---

## API-02: Admin Event Update

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `PUT`                                                    |
| Path            | `/api/v1/internal/admin/events/{id}`                     |
| Required Role   | `admin`                                                  |
| Priority        | **Must-have**                                            |
| Frontend Page   | Admin Event Management                                   |
| Phase           | Phase 4                                                  |

### Request Schema

Same as API-01 (all fields optional for partial update).

### Response Schema

Same as API-01 response.

---

## API-03: Admin Event Delete

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `DELETE`                                                 |
| Path            | `/api/v1/internal/admin/events/{id}`                     |
| Required Role   | `admin`                                                  |
| Priority        | **Must-have**                                            |
| Frontend Page   | Admin Event Management                                   |
| Phase           | Phase 4                                                  |

### Request Schema

None (ID in path).

### Response Schema

```json
{
  "success": true
}
```

---

## API-04: Admin Stats Dashboard

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `GET`                                                    |
| Path            | `/api/v1/internal/admin/stats`                           |
| Required Role   | `admin`                                                  |
| Priority        | **Must-have**                                            |
| Frontend Page   | Admin Dashboard                                          |
| Phase           | Phase 4                                                  |

### Request Schema

None.

### Response Schema

```json
{
  "total_users": "number",
  "total_events": "number",
  "total_reports_pending": "number",
  "total_clubs": "number",
  "total_gallery_images": "number",
  "recent_users": [
    {
      "id": "string (UUID)",
      "display_name": "string",
      "avatar_url": "string | null",
      "joined_at": "string (ISO 8601)"
    }
  ],
  "recent_events": [
    {
      "id": "string (UUID)",
      "title": "string",
      "start_date": "string (ISO 8601)",
      "status": "string"
    }
  ],
  "recent_reports": [
    {
      "id": "string (UUID)",
      "reason": "string",
      "status": "string",
      "created_at": "string (ISO 8601)"
    }
  ]
}
```

---

## API-05: Report Status Update

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `PATCH`                                                  |
| Path            | `/api/v1/internal/admin/reports/{id}/status`             |
| Required Role   | `admin`                                                  |
| Priority        | **Must-have**                                            |
| Frontend Page   | Admin Report Management                                  |
| Phase           | Phase 4                                                  |

### Request Schema

```json
{
  "status": "string (enum: pending | reviewed | resolved | dismissed)",
  "admin_note": "string (optional, max 1000)"
}
```

### Response Schema

```json
{
  "id": "string (UUID)",
  "reporter_id": "string (UUID)",
  "target_type": "string (enum: user | event | gallery_image)",
  "target_id": "string (UUID)",
  "reason": "string",
  "description": "string",
  "status": "string",
  "admin_note": "string | null",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

---

## API-06: Admin Tag Create

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `POST`                                                   |
| Path            | `/api/v1/internal/admin/tags`                            |
| Required Role   | `admin`                                                  |
| Priority        | **Should-have**                                          |
| Frontend Page   | Admin Tag Management                                     |
| Phase           | Phase 4                                                  |

### Request Schema

```json
{
  "name": "string (required, max 50)",
  "color": "string (required, hex color, e.g. #FF8C42)"
}
```

### Response Schema

```json
{
  "id": "string (UUID)",
  "name": "string",
  "color": "string",
  "created_at": "string (ISO 8601)"
}
```

---

## API-07: Admin Tag Update

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `PUT`                                                    |
| Path            | `/api/v1/internal/admin/tags/{id}`                       |
| Required Role   | `admin`                                                  |
| Priority        | **Should-have**                                          |
| Frontend Page   | Admin Tag Management                                     |
| Phase           | Phase 4                                                  |

### Request Schema

Same as API-06 (all fields optional for partial update).

### Response Schema

Same as API-06 response.

---

## API-08: Admin Tag Delete

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `DELETE`                                                 |
| Path            | `/api/v1/internal/admin/tags/{id}`                       |
| Required Role   | `admin`                                                  |
| Priority        | **Should-have**                                          |
| Frontend Page   | Admin Tag Management                                     |
| Phase           | Phase 4                                                  |

### Request Schema

None (ID in path).

### Response Schema

```json
{
  "success": true
}
```

---

## API-09: Admin Club Update

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `PUT`                                                    |
| Path            | `/api/v1/internal/admin/clubs/{id}`                      |
| Required Role   | `admin`                                                  |
| Priority        | **Should-have**                                          |
| Frontend Page   | Admin Club Management                                    |
| Phase           | Phase 4                                                  |

### Request Schema

```json
{
  "name": "string (optional, max 100)",
  "description": "string (optional, Markdown, max 5000)",
  "image_url": "string (optional, URL to MinIO object)",
  "status": "string (optional, enum: active | inactive)"
}
```

### Response Schema

```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "description_html": "string (sanitized HTML)",
  "image_url": "string | null",
  "member_count": "number",
  "status": "string",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

---

## API-10: Admin Club Delete

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `DELETE`                                                 |
| Path            | `/api/v1/internal/admin/clubs/{id}`                      |
| Required Role   | `admin`                                                  |
| Priority        | **Should-have**                                          |
| Frontend Page   | Admin Club Management                                    |
| Phase           | Phase 4                                                  |

### Request Schema

None (ID in path).

### Response Schema

```json
{
  "success": true
}
```

---

## API-11: Admin Gallery Image Delete

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `DELETE`                                                 |
| Path            | `/api/v1/internal/admin/gallery/{image_id}`              |
| Required Role   | `admin`                                                  |
| Priority        | **Must-have**                                            |
| Frontend Page   | Admin Gallery Management                                 |
| Phase           | Phase 4                                                  |

### Request Schema

None (ID in path).

### Response Schema

```json
{
  "success": true
}
```

### Notes

- Must also delete the corresponding object from MinIO storage.
- Should remove the image from any event or member that references it.

---

## API-12: Admin User Suspension

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `PATCH`                                                  |
| Path            | `/api/v1/internal/admin/users/{id}/status`               |
| Required Role   | `admin`                                                  |
| Priority        | **Must-have**                                            |
| Frontend Page   | Admin User Management                                    |
| Phase           | Phase 4                                                  |

### Request Schema

```json
{
  "status": "string (enum: active | suspended | banned)",
  "reason": "string (optional, max 500)"
}
```

### Response Schema

```json
{
  "id": "string (UUID)",
  "display_name": "string",
  "status": "string",
  "reason": "string | null",
  "updated_at": "string (ISO 8601)"
}
```

### Notes

- Suspending or banning a user should also invalidate their active sessions.
- The user should see a suspension notice on their next login attempt.

---

## API-13: Member Full-Text Search

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Method          | `GET`                                                    |
| Path            | `/api/v1/public/members/search`                          |
| Required Role   | None (public)                                            |
| Priority        | **Should-have**                                          |
| Frontend Page   | Members List                                             |
| Phase           | Phase 2                                                  |

### Request Schema (Query Parameters)

```
q: string (required, search query, min 2 chars)
page: number (optional, default 1)
per_page: number (optional, default 20, max 100)
```

### Response Schema

```json
{
  "items": [
    {
      "id": "string (UUID)",
      "display_name": "string",
      "avatar_url": "string | null",
      "role": "string",
      "joined_at": "string (ISO 8601)"
    }
  ],
  "total": "number",
  "page": "number",
  "per_page": "number",
  "total_pages": "number"
}
```

### Notes

- Should support partial matching and Japanese text search.
- Results sorted by relevance, then by join date (newest first).
- Consider PostgreSQL `pg_trgm` or full-text search for implementation.

---

## Endpoint Summary

| ID     | Method   | Path                                          | Role    | Priority      | Phase |
| ------ | -------- | --------------------------------------------- | ------- | ------------- | ----- |
| API-01 | `POST`   | `/api/v1/internal/admin/events`               | admin   | Must-have     | 4     |
| API-02 | `PUT`    | `/api/v1/internal/admin/events/{id}`          | admin   | Must-have     | 4     |
| API-03 | `DELETE` | `/api/v1/internal/admin/events/{id}`          | admin   | Must-have     | 4     |
| API-04 | `GET`    | `/api/v1/internal/admin/stats`                | admin   | Must-have     | 4     |
| API-05 | `PATCH`  | `/api/v1/internal/admin/reports/{id}/status`  | admin   | Must-have     | 4     |
| API-06 | `POST`   | `/api/v1/internal/admin/tags`                 | admin   | Should-have   | 4     |
| API-07 | `PUT`    | `/api/v1/internal/admin/tags/{id}`            | admin   | Should-have   | 4     |
| API-08 | `DELETE` | `/api/v1/internal/admin/tags/{id}`            | admin   | Should-have   | 4     |
| API-09 | `PUT`    | `/api/v1/internal/admin/clubs/{id}`           | admin   | Should-have   | 4     |
| API-10 | `DELETE` | `/api/v1/internal/admin/clubs/{id}`           | admin   | Should-have   | 4     |
| API-11 | `DELETE` | `/api/v1/internal/admin/gallery/{image_id}`   | admin   | Must-have     | 4     |
| API-12 | `PATCH`  | `/api/v1/internal/admin/users/{id}/status`    | admin   | Must-have     | 4     |
| API-13 | `GET`    | `/api/v1/public/members/search`               | public  | Should-have   | 2     |

---

## Frontend Page → API Dependency Map

| Frontend Page              | Required APIs                        | Phase |
| -------------------------- | ------------------------------------ | ----- |
| Members List (search)      | API-13                               | 2     |
| Admin Dashboard            | API-04                               | 4     |
| Admin Event Management     | API-01, API-02, API-03               | 4     |
| Admin Report Management    | API-05                               | 4     |
| Admin Tag Management       | API-06, API-07, API-08               | 4     |
| Admin Club Management      | API-09, API-10                       | 4     |
| Admin Gallery Management   | API-11                               | 4     |
| Admin User Management      | API-12                               | 4     |

---

## Development Strategy

1. **Define Zod schemas** for all request/response types in the frontend codebase immediately.
2. **Create MSW handlers** for all endpoints using factory functions to generate mock data.
3. **Develop frontend** against MSW mocks — full functionality with fake data.
4. **Integrate incrementally** as backend endpoints become available — swap MSW handlers for real API calls.
5. **Run integration tests** against the real backend once endpoints are deployed to a staging environment.

### MSW Handler Example

```typescript
// tests/mocks/handlers/admin-events.ts
import { http, HttpResponse } from "msw";
import { createMockEvent } from "../../factories/event";

export const adminEventHandlers = [
  // API-01: Create event
  http.post("/api/v1/internal/admin/events", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createMockEvent(body), { status: 201 });
  }),

  // API-02: Update event
  http.put("/api/v1/internal/admin/events/:id", async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json(createMockEvent({ id: params.id, ...body }));
  }),

  // API-03: Delete event
  http.delete("/api/v1/internal/admin/events/:id", () => {
    return HttpResponse.json({ success: true });
  }),
];
```
