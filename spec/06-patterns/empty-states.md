# Empty States Pattern

> Version: 1.0 | Last updated: 2026-03-20

This document catalogs all empty state designs across the VRC community website, ensuring consistent visual treatment and helpful messaging when no data is available.

---

## Table of Contents

- [Design System](#design-system)
- [Layout](#layout)
- [Design Rules](#design-rules)
- [Empty State Catalog](#empty-state-catalog)
- [First-Run vs No-Data Distinction](#first-run-vs-no-data-distinction)
- [Implementation](#implementation)
- [i18n Keys](#i18n-keys)

---

## Design System

All empty states follow a consistent visual pattern:

| Element | Specification |
|---|---|
| **Icon** | Lucide icon, `w-16 h-16 text-muted-foreground` |
| **Primary message** | `text-lg font-medium text-muted-foreground` |
| **Secondary message** | `text-sm text-muted-foreground` (optional, additional context) |
| **CTA button** | Standard `Button` component (optional, when actionable) |
| **Decoration** | None — no autumn leaf decoration in empty states (clarity priority) |

### Visual Hierarchy

```
┌─────────────────────────────────┐
│                                 │
│          [ Icon w-16 h-16 ]     │
│                                 │
│       Primary message text      │
│     (optional secondary text)   │
│                                 │
│         [ CTA Button ]          │
│                                 │
└─────────────────────────────────┘
```

---

## Layout

All empty states use a centered flex column layout:

```tsx
<div className="flex flex-col items-center justify-center py-16 gap-4">
  <IconComponent className="h-16 w-16 text-muted-foreground" />
  <div className="text-center space-y-1">
    <p className="text-lg font-medium text-muted-foreground">{primaryMessage}</p>
    {secondaryMessage && (
      <p className="text-sm text-muted-foreground">{secondaryMessage}</p>
    )}
  </div>
  {cta && (
    <Button variant="outline" onClick={cta.action}>
      {cta.label}
    </Button>
  )}
</div>
```

### Layout Rules

| Property | Value | Purpose |
|---|---|---|
| `flex flex-col` | Vertical stack | Centered column layout |
| `items-center justify-center` | Centered both axes | Visual centering |
| `py-16` | 64px vertical padding | Adequate breathing room |
| `gap-4` | 16px between elements | Consistent spacing |
| `text-center` | Centered text | Clean appearance |

---

## Design Rules

1. **No autumn leaf decoration** — Empty states prioritize clarity and simplicity. Decorative elements distract from the message.
2. **Always use a Lucide icon** — Provides visual context for the empty state type.
3. **Message is descriptive, not apologetic** — State what's empty, not "Sorry, nothing here."
4. **CTA only when actionable** — Only include a button when the user can do something about the empty state.
5. **Consistent sizing** — All empty state icons are `h-16 w-16`, all primary messages are `text-lg`.
6. **Respect container** — Empty states fill the space where content would normally appear; they don't break out of their container.

---

## Empty State Catalog

### Home Page

| Section | Icon | Primary Message | Secondary Message | CTA |
|---|---|---|---|---|
| Upcoming events | `CalendarX` | No upcoming events | Check back soon for new events. | — |
| Members | `Users` | No members yet | — | — |

### Events Pages

| Context | Icon | Primary Message | Secondary Message | CTA |
|---|---|---|---|---|
| Events list (upcoming tab) | `CalendarX` | No upcoming events scheduled | New events will appear here when they're created. | — |
| Events list (past tab) | `CalendarCheck` | No past events found | Past events will be archived here. | — |
| Events filtered (no match) | `Filter` | No events match your filters | Try adjusting your filter criteria. | Clear filters |
| Event gallery (no images) | `ImageOff` | No photos for this event | — | — |

### Members Pages

| Context | Icon | Primary Message | Secondary Message | CTA |
|---|---|---|---|---|
| Members list (empty) | `UserX` | No members found | — | — |
| Members search (no match) | `SearchX` | No members match your search | Try a different search term. | Clear search |
| Members filtered (no match) | `Filter` | No members match your filters | Try adjusting your filter criteria. | Clear filters |

### Clubs Pages

| Context | Icon | Primary Message | Secondary Message | CTA |
|---|---|---|---|---|
| Clubs list (empty) | `Building2` | No clubs created yet | Clubs will appear here once they are created. | — |
| Club gallery (no images) | `ImageOff` | No photos yet | Photos will appear here when they are uploaded. | — |
| Club members (empty) | `Users` | No club members | — | — |

### Admin Pages

| Context | Icon | Primary Message | Secondary Message | CTA |
|---|---|---|---|---|
| Dashboard (no data) | `BarChart3` | No data available | Dashboard statistics will appear once there is activity. | — |
| Events management (empty) | `CalendarX` | No events created | Get started by creating your first event. | Create event |
| Members management (empty) | `Users` | No members registered | Members will appear here once they sign up. | — |
| Reports (none pending) | `ShieldCheck` | No pending reports | All reports have been reviewed. Great job! | — |
| Reports (none ever) | `ShieldCheck` | No reports submitted | Reports from users will appear here. | — |
| Galleries (empty) | `Image` | No images uploaded | Upload images to create and manage galleries. | Upload images |
| Clubs management (empty) | `Building2` | No clubs created | Get started by creating your first club. | Create club |
| Activity log (empty) | `ScrollText` | No recent activity | Activity will be logged as users interact with the site. | — |

### Profile Page

| Context | Icon | Primary Message | Secondary Message | CTA |
|---|---|---|---|---|
| No social links | `Link` | No social links added | Add your social media profiles to connect with others. | Add link |
| No bio | `FileText` | No bio yet | Tell others about yourself. | Edit profile |

---

## First-Run vs No-Data Distinction

Empty states are categorized into two types with different messaging:

### First-Run Empty State

Shown when a feature has never been used. Emphasizes getting started.

| Characteristic | Implementation |
|---|---|
| **Tone** | Encouraging, invitational |
| **Message** | "Get started by..." / "Create your first..." |
| **CTA** | Always include a creation/setup action |
| **When** | `count === 0 && !hasEverHadData` (or first deployment) |

```tsx
// First-run example — Admin events
<EmptyState
  icon={CalendarX}
  message="No events created"
  description="Get started by creating your first event."
  action={{ label: 'Create event', href: '/admin/events/new' }}
/>
```

### No-Data Empty State

Shown when data existed but is now empty (e.g., all filtered out, all resolved).

| Characteristic | Implementation |
|---|---|
| **Tone** | Informational, neutral |
| **Message** | "No X found" / "No X match your criteria" |
| **CTA** | Reset filters / clear search (if applicable) |
| **When** | Data was filtered to nothing, or all items resolved |

```tsx
// No-data example — Filtered events
<EmptyState
  icon={Filter}
  message="No events match your filters"
  description="Try adjusting your filter criteria."
  action={{ label: 'Clear filters', onClick: clearFilters }}
/>
```

### Distinction Logic

```tsx
// Determine which empty state to show
function getEmptyStateType(totalCount: number, filteredCount: number, hasFilters: boolean) {
  if (totalCount === 0) return 'first-run';     // Never had data
  if (hasFilters && filteredCount === 0) return 'no-match'; // Filters removed all
  if (filteredCount === 0) return 'no-data';     // Had data, now empty
  return null; // Not empty
}
```

---

## Implementation

### EmptyState Component

```tsx
// src/components/ui/empty-state.tsx
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  description?: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon: Icon, message, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Icon className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
      <div className="text-center space-y-1">
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <Button variant="outline" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
```

### Usage Example

```tsx
import { CalendarX, Filter } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

// In an events list page
function EventsList({ events, hasFilters, totalCount }) {
  if (events.length === 0) {
    if (hasFilters) {
      return (
        <EmptyState
          icon={Filter}
          message="No events match your filters"
          description="Try adjusting your filter criteria."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      );
    }
    return (
      <EmptyState
        icon={CalendarX}
        message="No upcoming events scheduled"
        description="New events will appear here when they're created."
      />
    );
  }

  return <EventGrid events={events} />;
}
```

---

## i18n Keys

All empty state messages use i18n keys for localization. The default language is Japanese.

| Key | English (Reference) | Japanese |
|---|---|---|
| `empty.home.events` | No upcoming events | 今後のイベントはありません |
| `empty.home.events.desc` | Check back soon for new events. | 新しいイベントをお楽しみに。 |
| `empty.home.members` | No members yet | メンバーはまだいません |
| `empty.events.upcoming` | No upcoming events scheduled | 予定されているイベントはありません |
| `empty.events.upcoming.desc` | New events will appear here when they're created. | イベントが作成されるとここに表示されます。 |
| `empty.events.past` | No past events found | 過去のイベントはありません |
| `empty.events.past.desc` | Past events will be archived here. | 過去のイベントはここにアーカイブされます。 |
| `empty.events.filtered` | No events match your filters | フィルターに一致するイベントはありません |
| `empty.events.filtered.desc` | Try adjusting your filter criteria. | フィルター条件を変更してお試しください。 |
| `empty.events.filtered.cta` | Clear filters | フィルターをクリア |
| `empty.events.gallery` | No photos for this event | このイベントの写真はありません |
| `empty.members.list` | No members found | メンバーが見つかりません |
| `empty.members.search` | No members match your search | 検索に一致するメンバーはいません |
| `empty.members.search.desc` | Try a different search term. | 別の検索キーワードをお試しください。 |
| `empty.members.search.cta` | Clear search | 検索をクリア |
| `empty.members.filtered` | No members match your filters | フィルターに一致するメンバーはいません |
| `empty.members.filtered.desc` | Try adjusting your filter criteria. | フィルター条件を変更してお試しください。 |
| `empty.members.filtered.cta` | Clear filters | フィルターをクリア |
| `empty.clubs.list` | No clubs created yet | クラブはまだ作成されていません |
| `empty.clubs.list.desc` | Clubs will appear here once they are created. | クラブが作成されるとここに表示されます。 |
| `empty.clubs.gallery` | No photos yet | 写真はまだありません |
| `empty.clubs.gallery.desc` | Photos will appear here when they are uploaded. | 写真がアップロードされるとここに表示されます。 |
| `empty.clubs.members` | No club members | クラブメンバーはいません |
| `empty.admin.dashboard` | No data available | データがありません |
| `empty.admin.dashboard.desc` | Dashboard statistics will appear once there is activity. | アクティビティが発生するとダッシュボード統計が表示されます。 |
| `empty.admin.events` | No events created | イベントはまだ作成されていません |
| `empty.admin.events.desc` | Get started by creating your first event. | 最初のイベントを作成して始めましょう。 |
| `empty.admin.events.cta` | Create event | イベントを作成 |
| `empty.admin.members` | No members registered | 登録されたメンバーはいません |
| `empty.admin.members.desc` | Members will appear here once they sign up. | メンバーが登録するとここに表示されます。 |
| `empty.admin.reports.pending` | No pending reports | 未処理のレポートはありません |
| `empty.admin.reports.pending.desc` | All reports have been reviewed. Great job! | すべてのレポートが確認済みです。お疲れ様でした！ |
| `empty.admin.reports.none` | No reports submitted | レポートは提出されていません |
| `empty.admin.reports.none.desc` | Reports from users will appear here. | ユーザーからのレポートがここに表示されます。 |
| `empty.admin.galleries` | No images uploaded | アップロードされた画像はありません |
| `empty.admin.galleries.desc` | Upload images to create and manage galleries. | 画像をアップロードしてギャラリーを作成・管理しましょう。 |
| `empty.admin.galleries.cta` | Upload images | 画像をアップロード |
| `empty.admin.clubs` | No clubs created | クラブはまだ作成されていません |
| `empty.admin.clubs.desc` | Get started by creating your first club. | 最初のクラブを作成して始めましょう。 |
| `empty.admin.clubs.cta` | Create club | クラブを作成 |
| `empty.admin.activity` | No recent activity | 最近のアクティビティはありません |
| `empty.admin.activity.desc` | Activity will be logged as users interact with the site. | ユーザーがサイトを利用するとアクティビティが記録されます。 |
| `empty.profile.social` | No social links added | ソーシャルリンクが追加されていません |
| `empty.profile.social.desc` | Add your social media profiles to connect with others. | ソーシャルメディアプロフィールを追加して他のメンバーとつながりましょう。 |
| `empty.profile.social.cta` | Add link | リンクを追加 |
| `empty.profile.bio` | No bio yet | 自己紹介はまだありません |
| `empty.profile.bio.desc` | Tell others about yourself. | 自己紹介を書いてみましょう。 |
| `empty.profile.bio.cta` | Edit profile | プロフィールを編集 |

---

## Cross-References

- [Error Handling Pattern](./error-handling.md) — error states vs empty states
- [Accessibility Pattern](./accessibility.md) — screen reader announcements for empty states
- [Page Specifications](../04-pages/) — per-page empty state contexts
- [Component Specs](../03-components/) — EmptyState component usage
- [Color Tokens](../02-tokens/colors.md) — `muted-foreground` token definition
