import type {
  AdminManagedRole,
  AdminPermissionSet,
  AdminRolePayload,
  AdminSystemRolePolicy,
  AdminSystemRolePolicyPayload,
  AdminGalleryImage,
  AdminReport,
  AdminStats,
  AdminUser,
  GalleryImageStatus,
  GalleryTargetType,
  MyProfile,
  PaginatedResponse,
  PublicClub,
  PublicClubDetail,
  PublicGalleryImage,
  PublicMember,
  PublicMemberDetail,
  ReportStatus,
  ReportTargetType,
  ScheduleManagedRole,
  ScheduleNotificationRule,
  ScheduleTemplate,
  ScheduleTimelineDay,
  ScheduleTimelineEvent,
  ScheduleVisibilityMode,
  Tag,
  UserRole,
  UserStatus,
} from "./types";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export interface MockApiErrorLike {
  status: number;
  code: string;
  message?: string;
}

interface MockMemberRecord {
  id: string;
  discordId: string;
  displayName: string;
  avatarUrl: string | null;
  discordRoleIds: string[];
  joinedAt: string;
  role: UserRole;
  status: UserStatus;
  profile: MyProfile;
}

interface MockClubRecord {
  id: string;
  name: string;
  description: string;
  descriptionHtml: string;
  coverImageUrl: string | null;
  ownerDiscordId: string;
  members: Array<{
    userId: string;
    role: string;
    joinedAt: string;
  }>;
  createdAt: string;
}

interface MockGalleryRecord extends AdminGalleryImage {}

interface MockScheduleEventRecord {
  id: string;
  created_by_user_id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  visibility_mode: ScheduleVisibilityMode;
  auto_notify_enabled: boolean;
  visible_role_ids: string[];
}

interface MockScheduleState {
  managedRoles: ScheduleManagedRole[];
  templates: ScheduleTemplate[];
  events: MockScheduleEventRecord[];
  webhookUrl: string;
  rules: ScheduleNotificationRule[];
}

interface MockState {
  meId: string;
  members: MockMemberRecord[];
  adminSystemRoles: AdminSystemRolePolicy[];
  adminRoles: AdminManagedRole[];
  clubs: MockClubRecord[];
  tags: Tag[];
  reports: AdminReport[];
  galleries: MockGalleryRecord[];
  schedule: MockScheduleState;
}

const DEV_MOCK_DISABLE_VALUES = new Set(["0", "false", "off"]);

export function isDevelopmentMockEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  const rawValue = process.env.NEXT_PUBLIC_USE_DEV_MOCKS?.trim().toLowerCase();
  if (!rawValue) {
    return true;
  }

  return !DEV_MOCK_DISABLE_VALUES.has(rawValue);
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEV_MOCK_MARKDOWN_SCHEMA = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "del",
    "hr",
  ],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    a: [...(defaultSchema.attributes?.a ?? []), "href"],
    img: ["src", "alt"],
    th: ["align"],
    td: ["align"],
  },
  protocols: {
    ...(defaultSchema.protocols ?? {}),
    href: ["https"],
    src: ["https"],
  },
};

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, DEV_MOCK_MARKDOWN_SCHEMA)
  .use(rehypeStringify);

const DEV_MOCK_PROFILE_MARKDOWN = `# 見出し1

これは見出し1です。

## 見出し2

これは見出し2です。

### 見出し3

これは見出し3です。

#### 見出し4

これは見出し4です。

##### 見出し5

これは見出し5です。

###### 見出し6

これは見出し6です。

## 段落

これは1つ目の段落の1行目です。  
これは1つ目の段落の2行目です。

これは2つ目の段落の1行目です。  
これは2つ目の段落の2行目です。

## 順序無しリスト

これは順序無しリストです。

- 1
- 2
    - 2-1
    - 2-2
        - 2-2-1
        - 2-2-2
- 3

これは順序無しリストです。

## 順序付きリスト

これは順序付きリストです。

1. 1
1. 2
    1. 2-1
    1. 2-2
        1. 2-2-1
        1. 2-2-2
1. 3

これは順序付きリストです。

## 引用

これは引用です。

> 引用
> 引用

これは引用です。

## コードブロック

これはコードブロックです。

\`\`\`ruby
puts 1 + 1
\`\`\`

これはコードブロックです。

## テーブル

これはテーブルです。

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       |        This |     This     |
| column     |      column |    column    |
| will       |        will |     will     |
| be         |          be |      be      |
| left       |       right |    center    |
| aligned    |     aligned |   aligned    |

これはテーブルです。

## リンク

これは [リンク](http://example.com) です。

## コード

これは \`puts 1 + 1\` コードです。

## 強い強調

これは **強い強調** です。

## 強調

これは *強調* です。

## 削除済みテキスト

これは ~~削除済みテキスト~~ です。

### 定義リスト

これは定義リストです。

<dl>
  <dt>リンゴ</dt>
  <dd>赤いフルーツ</dd>
  <dt>オレンジ</dt>
  <dd>橙色のフルーツ</dd>
</dl>

これは定義リストです。

## 水平線

これは水平線です。

---

これは水平線です。

## 画像

これは ![バナナ](https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bananavarieties.jpg/220px-Bananavarieties.jpg) 画像です。
`;

const DEV_MOCK_PROFILE_MARKDOWN = `# 見出し1

これは見出し1です。

## 見出し2

これは見出し2です。

### 見出し3

これは見出し3です。

#### 見出し4

これは見出し4です。

##### 見出し5

これは見出し5です。

###### 見出し6

これは見出し6です。

## 段落

これは1つ目の段落の1行目です。  
これは1つ目の段落の2行目です。

これは2つ目の段落の1行目です。  
これは2つ目の段落の2行目です。

## 順序無しリスト

これは順序無しリストです。

- 1
- 2
    - 2-1
    - 2-2
        - 2-2-1
        - 2-2-2
- 3

これは順序無しリストです。

## 順序付きリスト

これは順序付きリストです。

1. 1
1. 2
    1. 2-1
    1. 2-2
        1. 2-2-1
        1. 2-2-2
1. 3

これは順序付きリストです。

## 引用

これは引用です。

> 引用
> 引用

これは引用です。

## コードブロック

これはコードブロックです。

\`\`\`ruby
puts 1 + 1
\`\`\`

これはコードブロックです。

## テーブル

これはテーブルです。

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       |        This |     This     |
| column     |      column |    column    |
| will       |        will |     will     |
| be         |          be |      be      |
| left       |       right |    center    |
| aligned    |     aligned |   aligned    |

これはテーブルです。

## リンク

これは [リンク](http://example.com) です。

## コード

これは \`puts 1 + 1\` コードです。

## 強い強調

これは **強い強調** です。

## 強調

これは *強調* です。

## 削除済みテキスト

これは ~~削除済みテキスト~~ です。

### 定義リスト

これは定義リストです。

<dl>
  <dt>リンゴ</dt>
  <dd>赤いフルーツ</dd>
  <dt>オレンジ</dt>
  <dd>橙色のフルーツ</dd>
</dl>

これは定義リストです。

## 水平線

これは水平線です。

---

これは水平線です。

## 画像

これは ![バナナ](https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bananavarieties.jpg/220px-Bananavarieties.jpg) 画像です。
`;

function htmlFromText(text: string): string {
  if (text.trim().length === 0) {
    return "";
  }

  return String(markdownProcessor.processSync(text));
}

let nextSequence = 1000;

function nextId(prefix: string): string {
  nextSequence += 1;
  return `${prefix}-${nextSequence}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function paginate<T>(items: T[], page = 1, perPage = 20): PaginatedResponse<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const start = (page - 1) * perPage;
  const sliced = items.slice(start, start + perPage);

  return {
    items: clone(sliced),
    total_count: totalCount,
    total_pages: totalPages,
  };
}

function getPageParams(url: URL): { page: number; perPage: number } {
  const page = Number(url.searchParams.get("page") ?? "1");
  const perPage = Number(url.searchParams.get("per_page") ?? "20");

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : 20,
  };
}

function createInitialState(): MockState {
  const members: MockMemberRecord[] = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      discordId: "100000000000000001",
      displayName: "Aki",
      avatarUrl: "/logo.png",
      discordRoleIds: ["role-ops", "discord-role-admin-ops"],
      joinedAt: "2025-10-01T12:00:00.000Z",
      role: "super_admin",
      status: "active",
      profile: {
        vrc_id: "usr_11111111-1111-1111-1111-111111111111",
        x_id: "aki_october",
        bio_markdown: DEV_MOCK_PROFILE_MARKDOWN,
        bio_html: htmlFromText(DEV_MOCK_PROFILE_MARKDOWN),
        is_public: true,
        updated_at: "2026-03-22T10:00:00.000Z",
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      discordId: "100000000000000002",
      displayName: "Nao",
      avatarUrl: "/logo.png",
      discordRoleIds: ["discord-role-gallery"],
      joinedAt: "2025-10-03T18:00:00.000Z",
      role: "member",
      status: "active",
      profile: {
        vrc_id: "usr_22222222-2222-2222-2222-222222222222",
        x_id: "nao_builds",
        bio_markdown: "I like building calm spaces and event backdrops.",
        bio_html: htmlFromText("I like building calm spaces and event backdrops."),
        is_public: true,
        updated_at: "2026-03-20T08:30:00.000Z",
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      discordId: "100000000000000003",
      displayName: "Mio",
      avatarUrl: "/logo.png",
      discordRoleIds: ["role-talent"],
      joinedAt: "2025-10-06T09:15:00.000Z",
      role: "staff",
      status: "active",
      profile: {
        vrc_id: null,
        x_id: null,
        bio_markdown: "I help with check-ins, moderation, and follow-up.",
        bio_html: htmlFromText("I help with check-ins, moderation, and follow-up."),
        is_public: true,
        updated_at: "2026-03-18T22:10:00.000Z",
      },
    },
  ];

  const tags: Tag[] = [
    { id: "tag-social", name: "Social", color: "#E8836B" },
    { id: "tag-music", name: "Music", color: "#3D8480" },
    { id: "tag-build", name: "Build", color: "#D4A843" },
  ];

  const clubs: MockClubRecord[] = [
    {
      id: "club-music-lounge",
      name: "Music Lounge",
      description: "Weekly listening sessions and small live performances.",
      descriptionHtml: htmlFromText("Weekly listening sessions and small live performances."),
      coverImageUrl: "/banner.png",
      ownerDiscordId: "100000000000000001",
      members: [
        { userId: "100000000000000001", role: "owner", joinedAt: "2025-10-01T12:00:00.000Z" },
        { userId: "100000000000000003", role: "member", joinedAt: "2025-10-08T20:00:00.000Z" },
      ],
      createdAt: "2025-10-08T20:00:00.000Z",
    },
    {
      id: "club-world-builders",
      name: "World Builders",
      description: "Scene studies, prop work, and environment reviews.",
      descriptionHtml: htmlFromText("Scene studies, prop work, and environment reviews."),
      coverImageUrl: "/banner.png",
      ownerDiscordId: "100000000000000002",
      members: [
        { userId: "100000000000000002", role: "owner", joinedAt: "2025-10-12T19:00:00.000Z" },
        { userId: "100000000000000001", role: "member", joinedAt: "2025-10-14T19:30:00.000Z" },
      ],
      createdAt: "2025-10-12T19:00:00.000Z",
    },
  ];

  const reports: AdminReport[] = [
    {
      id: "report-1",
      reporter_id: "100000000000000003",
      reporter_username: "Mio",
      target_type: "profile",
      target_id: "100000000000000002",
      reason: "Display name contains inappropriate text.",
      status: "pending",
      created_at: "2026-03-21T08:00:00.000Z",
    },
  ];

  const galleries: MockGalleryRecord[] = [
    {
      id: "gallery-community-1",
      target_type: "community",
      club_id: null,
      club: null,
      uploaded_by: { user_id: "100000000000000001", discord_display_name: "Aki" },
      image_url: "/banner.png",
      caption: "Community meetup snapshot",
      status: "approved",
      created_at: "2026-03-19T10:00:00.000Z",
    },
    {
      id: "gallery-club-1",
      target_type: "club",
      club_id: "club-world-builders",
      club: { id: "club-world-builders", name: "World Builders" },
      uploaded_by: { user_id: "100000000000000002", discord_display_name: "Nao" },
      image_url: "/banner.png",
      caption: "Lighting test board",
      status: "approved",
      created_at: "2026-03-20T14:00:00.000Z",
    },
  ];

  const schedule: MockScheduleState = {
    managedRoles: [
      {
        id: "schedule-role-ops",
        discord_role_id: "role-ops",
        display_name: "Operations Lead",
        description: "Can manage restricted entries, templates, and notification settings.",
        can_manage_roles: true,
        can_manage_events: true,
        can_manage_templates: true,
        can_manage_notifications: true,
        can_view_restricted_events: true,
      },
      {
        id: "schedule-role-talent",
        discord_role_id: "role-talent",
        display_name: "Talent",
        description: "Can view restricted talent availability blocks.",
        can_manage_roles: false,
        can_manage_events: false,
        can_manage_templates: false,
        can_manage_notifications: false,
        can_view_restricted_events: true,
      },
    ],
    templates: [
      {
        id: "schedule-template-stream",
        name: "Stream",
        title: "Streaming slot",
        description: "Primary streaming slot. Confirm world, lobby, and staff handoff before start.",
        is_default: true,
      },
      {
        id: "schedule-template-recording",
        name: "Recording",
        title: "Recording block",
        description: "Recording session. Confirm assets, cast handoff, and delivery owner.",
        is_default: false,
      },
    ],
    events: [
      {
        id: "schedule-event-1",
        created_by_user_id: "00000000-0000-0000-0000-000000000001",
        title: "Collab stream prep",
        description: "Asset handoff, overlay review, and final mic check.",
        start_at: "2026-03-25T10:00:00.000Z",
        end_at: "2026-03-25T12:00:00.000Z",
        visibility_mode: "public",
        auto_notify_enabled: true,
        visible_role_ids: [],
      },
      {
        id: "schedule-event-2",
        created_by_user_id: "00000000-0000-0000-0000-000000000003",
        title: "Talent-only rehearsal",
        description: "Private rehearsal slot for the collab lineup.",
        start_at: "2026-03-27T12:30:00.000Z",
        end_at: "2026-03-27T15:00:00.000Z",
        visibility_mode: "restricted",
        auto_notify_enabled: false,
        visible_role_ids: ["role-talent", "role-ops"],
      },
    ],
    webhookUrl: "https://discord.com/api/webhooks/mock/schedule",
    rules: [
      {
        id: "schedule-rule-1",
        name: "1 hour reminder",
        enabled: true,
        schedule_type: "before_event",
        offset_minutes: 60,
        time_of_day: null,
        window_start_minutes: null,
        window_end_minutes: null,
        body_template: "[{{rule_name}}] {{title}} starts at {{start_at}}\n{{description}}",
        list_item_template: null,
      },
    ],
  };

  const adminRoles: AdminManagedRole[] = [
    {
      id: "admin-role-gallery",
      discord_role_id: "discord-role-gallery",
      display_name: "Gallery Crew",
      description: "Can review gallery submissions and inspect dashboard counts.",
      can_view_dashboard: true,
      can_manage_users: false,
      can_manage_roles: false,
      can_manage_events: false,
      can_manage_tags: false,
      can_manage_reports: false,
      can_manage_galleries: true,
      can_manage_clubs: false,
      updated_at: "2026-03-23T22:30:00.000Z",
    },
    {
      id: "admin-role-admin-ops",
      discord_role_id: "discord-role-admin-ops",
      display_name: "Operations Admin",
      description: "Can operate dashboard users, reports, clubs, and role policies.",
      can_view_dashboard: true,
      can_manage_users: true,
      can_manage_roles: true,
      can_manage_events: false,
      can_manage_tags: false,
      can_manage_reports: true,
      can_manage_galleries: true,
      can_manage_clubs: true,
      updated_at: "2026-03-23T22:35:00.000Z",
    },
  ];

  const adminSystemRoles: AdminSystemRolePolicy[] = [
    {
      role: "member",
      can_view_dashboard: false,
      can_manage_users: false,
      can_manage_roles: false,
      can_manage_events: false,
      can_manage_tags: false,
      can_manage_reports: false,
      can_manage_galleries: false,
      can_manage_clubs: false,
      updated_at: "2026-03-23T22:40:00.000Z",
    },
    {
      role: "staff",
      can_view_dashboard: true,
      can_manage_users: false,
      can_manage_roles: false,
      can_manage_events: false,
      can_manage_tags: false,
      can_manage_reports: true,
      can_manage_galleries: true,
      can_manage_clubs: true,
      updated_at: "2026-03-23T22:40:00.000Z",
    },
    {
      role: "admin",
      can_view_dashboard: true,
      can_manage_users: true,
      can_manage_roles: true,
      can_manage_events: true,
      can_manage_tags: true,
      can_manage_reports: true,
      can_manage_galleries: true,
      can_manage_clubs: true,
      updated_at: "2026-03-23T22:40:00.000Z",
    },
  ];

  return {
    meId: members[0].id,
    members,
    adminSystemRoles,
    adminRoles,
    clubs,
    tags,
    reports,
    galleries,
    schedule,
  };
}

const state = createInitialState();

function getMockMeRecord(): MockMemberRecord {
  const me = state.members.find((member) => member.id === state.meId);
  if (!me) {
    throw { status: 500, code: "MOCK_ME_NOT_FOUND", message: "Mock current user is missing" } satisfies MockApiErrorLike;
  }

  return me;
}

function toUserBrief(discordId: string) {
  const member = state.members.find((entry) => entry.discordId === discordId);
  return {
    user_id: discordId,
    discord_display_name: member?.displayName ?? "Unknown member",
  };
}

function buildAdminPermissions(member: MockMemberRecord): AdminPermissionSet {
  const base: AdminPermissionSet = member.role === "super_admin"
    ? {
        view_dashboard: true,
        manage_users: true,
        manage_roles: true,
        manage_events: true,
        manage_tags: true,
        manage_reports: true,
        manage_galleries: true,
        manage_clubs: true,
      }
    : {
        view_dashboard: false,
        manage_users: false,
        manage_roles: false,
        manage_events: false,
        manage_tags: false,
        manage_reports: false,
        manage_galleries: false,
        manage_clubs: false,
      };

  const systemRole = state.adminSystemRoles.find((entry) => entry.role === member.role);
  if (systemRole) {
    base.view_dashboard = systemRole.can_view_dashboard;
    base.manage_users = systemRole.can_manage_users;
    base.manage_roles = systemRole.can_manage_roles;
    base.manage_events = systemRole.can_manage_events;
    base.manage_tags = systemRole.can_manage_tags;
    base.manage_reports = systemRole.can_manage_reports;
    base.manage_galleries = systemRole.can_manage_galleries;
    base.manage_clubs = systemRole.can_manage_clubs;
  }

  const matchedRoles = state.adminRoles.filter((role) => member.discordRoleIds.includes(role.discord_role_id));

  for (const role of matchedRoles) {
    base.view_dashboard = base.view_dashboard || role.can_view_dashboard;
    base.manage_users = base.manage_users || role.can_manage_users;
    base.manage_roles = base.manage_roles || role.can_manage_roles;
    base.manage_events = base.manage_events || role.can_manage_events;
    base.manage_tags = base.manage_tags || role.can_manage_tags;
    base.manage_reports = base.manage_reports || role.can_manage_reports;
    base.manage_galleries = base.manage_galleries || role.can_manage_galleries;
    base.manage_clubs = base.manage_clubs || role.can_manage_clubs;
  }

  return base;
}

function buildAuthMe() {
  const me = getMockMeRecord();
  const adminPermissions = buildAdminPermissions(me);
  return {
    id: me.id,
    discord_id: me.discordId,
    discord_username: me.displayName,
    avatar_url: me.avatarUrl,
    role: me.role,
    admin_access: Object.values(adminPermissions).some(Boolean),
    admin_permissions: adminPermissions,
    schedule_access: me.role !== "member",
    profile: {
      vrc_id: me.profile.vrc_id,
      x_id: me.profile.x_id,
      is_public: me.profile.is_public,
    },
  };
}

function buildOwnProfile(profile: MyProfile) {
  return {
    nickname: null,
    vrc_id: profile.vrc_id,
    x_id: profile.x_id,
    bio_markdown: profile.bio_markdown,
    bio_html: profile.bio_html,
    avatar_url: null,
    is_public: profile.is_public,
    updated_at: profile.updated_at,
  };
}

function buildPublicMember(member: MockMemberRecord) {
  return {
    user_id: member.discordId,
    discord_display_name: member.displayName,
    discord_avatar_hash: null,
    joined_at: member.joinedAt,
    profile: member.profile.is_public
      ? {
          vrc_id: member.profile.vrc_id,
          x_id: member.profile.x_id,
          bio_html: member.profile.bio_html,
          avatar_url: member.avatarUrl,
          updated_at: member.profile.updated_at,
        }
      : null,
  };
}

function buildPublicMemberDetail(member: MockMemberRecord) {
  const memberships = state.clubs
    .filter((club) => club.members.some((entry) => entry.userId === member.discordId))
    .map((club) => {
      const membership = club.members.find((entry) => entry.userId === member.discordId)!;
      return {
        id: club.id,
        name: club.name,
        role: membership.role,
      };
    });

  return {
    ...buildPublicMember(member),
    clubs: memberships,
  };
}

function buildPublicClub(club: MockClubRecord) {
  return {
    id: club.id,
    name: club.name,
    description_html: club.descriptionHtml,
    cover_image_url: club.coverImageUrl,
    owner: toUserBrief(club.ownerDiscordId),
    member_count: club.members.length,
    created_at: club.createdAt,
  };
}

function buildPublicClubDetail(club: MockClubRecord) {
  return {
    ...buildPublicClub(club),
    members: club.members.map((member) => ({
      user_id: member.userId,
      discord_display_name: toUserBrief(member.userId).discord_display_name,
      role: member.role,
      joined_at: member.joinedAt,
    })),
  };
}

function buildAdminUser(member: MockMemberRecord): AdminUser {
  return {
    id: member.id,
    discord_id: member.discordId,
    discord_username: member.displayName,
    avatar_url: member.avatarUrl,
    role: member.role,
    status: member.status,
    created_at: member.joinedAt,
    updated_at: member.profile.updated_at,
  };
}

function buildAdminClub(club: MockClubRecord): PublicClub {
  return {
    id: club.id,
    name: club.name,
    description: club.description,
    description_html: club.descriptionHtml,
    cover_image_url: club.coverImageUrl,
    owner: toUserBrief(club.ownerDiscordId),
    member_count: club.members.length,
    created_at: club.createdAt,
  };
}

function buildClubGallery(clubId: string): PaginatedResponse<PublicGalleryImage> {
  const items = state.galleries
    .filter((image) => image.target_type === "club" && image.club_id === clubId && image.status === "approved")
    .map((image) => ({
      id: image.id,
      image_url: image.image_url,
      caption: image.caption,
      uploaded_by: image.uploaded_by,
      created_at: image.created_at,
    }));

  return paginate(items, 1, items.length || 20);
}

function buildAdminStats(): AdminStats {
  return {
    total_users: state.members.length,
    total_events: 0,
    total_clubs: state.clubs.length,
    pending_reports: state.reports.filter((report) => report.status === "pending").length,
  };
}

function addJstDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  return `${base.getUTCFullYear()}-${`${base.getUTCMonth() + 1}`.padStart(2, "0")}-${`${base.getUTCDate()}`.padStart(2, "0")}`;
}

function isoToJstDate(dateLike: string) {
  const date = new Date(dateLike);
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${shifted.getUTCFullYear()}-${`${shifted.getUTCMonth() + 1}`.padStart(2, "0")}-${`${shifted.getUTCDate()}`.padStart(2, "0")}`;
}

function overlapsDate(date: string, startAt: string, endAt: string) {
  const dayStart = new Date(`${date}T00:00:00.000Z`).getTime() - 9 * 60 * 60 * 1000;
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  return new Date(startAt).getTime() < dayEnd && new Date(endAt).getTime() > dayStart;
}

function buildSchedulePermissions(role: UserRole) {
  if (role === "admin" || role === "super_admin") {
    return {
      manage_roles: true,
      manage_events: true,
      manage_templates: true,
      manage_notifications: true,
      view_restricted_events: true,
    };
  }

  if (role === "staff") {
    return {
      manage_roles: false,
      manage_events: true,
      manage_templates: false,
      manage_notifications: false,
      view_restricted_events: true,
    };
  }

  return {
    manage_roles: false,
    manage_events: false,
    manage_templates: false,
    manage_notifications: false,
    view_restricted_events: false,
  };
}

function buildScheduleTimelineEvent(entry: MockScheduleEventRecord, viewerId: string): ScheduleTimelineEvent {
  return {
    id: entry.id,
    display_mode: "full",
    title: entry.title,
    description: entry.description,
    start_at: entry.start_at,
    end_at: entry.end_at,
    visibility_mode: entry.visibility_mode,
    auto_notify_enabled: entry.auto_notify_enabled,
    visible_role_ids: clone(entry.visible_role_ids),
    created_by_viewer: entry.created_by_user_id === viewerId,
    editable: true,
  };
}

function buildScheduleTimeline(from: string, days: number, viewerId: string) {
  const timeline: ScheduleTimelineDay[] = Array.from({ length: days }, (_, index) => {
    const date = addJstDays(from, index);
    return {
      date,
      events: state.schedule.events
        .filter((entry) => overlapsDate(date, entry.start_at, entry.end_at))
        .map((entry) => buildScheduleTimelineEvent(entry, viewerId)),
    };
  });

  return {
    from,
    days,
    timezone: "Asia/Tokyo",
    timeline,
  };
}

function buildScheduleBootstrap(url: URL) {
  const me = getMockMeRecord();
  const permissions = buildSchedulePermissions(me.role);
  const from = url.searchParams.get("from") ?? isoToJstDate(nowIso()).slice(0, 7) + "-01";
  const days = Number(url.searchParams.get("days") ?? "31");

  return {
    viewer: {
      id: me.id,
      discord_id: me.discordId,
      discord_display_name: me.displayName,
      avatar_url: me.avatarUrl,
      role: me.role,
      discord_role_ids: me.discordRoleIds,
      permissions,
      schedule_access: me.role !== "member",
    },
    timeline: buildScheduleTimeline(from, Number.isFinite(days) ? days : 31, me.id),
    managed_roles: clone(state.schedule.managedRoles),
    templates: clone(state.schedule.templates),
    notifications: permissions.manage_notifications
      ? {
          webhook_url: state.schedule.webhookUrl,
          rules: clone(state.schedule.rules),
          placeholders: {
            before_event: ["description", "duration", "end_at", "start_at", "title"],
            daily_body: ["event_count", "events_list", "rule_name", "window_end", "window_start"],
            daily_item: ["description", "duration", "end_at", "start_at", "title"],
          },
        }
      : null,
  };
}

function parseJsonBody(body: BodyInit | null | undefined): Record<string, unknown> {
  if (!body || typeof body !== "string") {
    return {};
  }

  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function findMemberByDiscordId(discordId: string): MockMemberRecord {
  const member = state.members.find((entry) => entry.discordId === discordId && entry.profile.is_public);
  if (!member) {
    throw { status: 404, code: "MEMBER_NOT_FOUND", message: "Member not found" } satisfies MockApiErrorLike;
  }

  return member;
}

function findClubById(clubId: string): MockClubRecord {
  const club = state.clubs.find((entry) => entry.id === clubId);
  if (!club) {
    throw { status: 404, code: "CLUB_NOT_FOUND", message: "Club not found" } satisfies MockApiErrorLike;
  }

  return club;
}

function applyProfileUpdate(body: Record<string, unknown>) {
  const me = getMockMeRecord();
  const bioMarkdown = String(body.bio_markdown ?? me.profile.bio_markdown ?? "");
  const xId = body.x_id;
  const vrcId = body.vrc_id;

  me.profile = {
    ...me.profile,
    vrc_id: typeof vrcId === "string" ? vrcId : vrcId === null ? null : me.profile.vrc_id,
    x_id: typeof xId === "string" ? xId.replace(/^@/, "") : xId === null ? null : me.profile.x_id,
    bio_markdown: bioMarkdown,
    bio_html: htmlFromText(bioMarkdown),
    is_public: Boolean(body.is_public),
    updated_at: nowIso(),
  };

  return buildOwnProfile(me.profile);
}

function createGalleryItem(targetType: GalleryTargetType, clubId?: string, caption?: string | null) {
  const me = getMockMeRecord();
  const club = clubId ? state.clubs.find((entry) => entry.id === clubId) : null;

  return {
    id: nextId("gallery"),
    target_type: targetType,
    club_id: clubId ?? null,
    club: club ? { id: club.id, name: club.name } : null,
    uploaded_by: { user_id: me.discordId, discord_display_name: me.displayName },
    image_url: "/banner.png",
    caption: caption ?? null,
    status: "approved" as GalleryImageStatus,
    created_at: nowIso(),
  } satisfies MockGalleryRecord;
}

export async function resolveDevelopmentMock<T>(
  path: string,
  options: Omit<RequestInit, "headers"> & { headers?: Record<string, string> }
): Promise<T> {
  const url = new URL(path, "http://mock.local");
  const pathname = url.pathname;
  const method = (options.method ?? "GET").toUpperCase();

  if (pathname === "/api/v1/internal/auth/me" && method === "GET") {
    return clone(buildAuthMe()) as T;
  }

  if (pathname === "/api/v1/internal/schedule/bootstrap" && method === "GET") {
    return clone(buildScheduleBootstrap(url)) as T;
  }

  if (pathname === "/api/v1/internal/schedule/events" && method === "POST") {
    const body = parseJsonBody(options.body);
    const me = getMockMeRecord();
    const event: MockScheduleEventRecord = {
      id: nextId("schedule-event"),
      created_by_user_id: me.id,
      title: String(body.title ?? "Untitled entry"),
      description: String(body.description ?? ""),
      start_at: String(body.start_at ?? nowIso()),
      end_at: String(body.end_at ?? nowIso()),
      visibility_mode: String(body.visibility_mode ?? "public") as ScheduleVisibilityMode,
      auto_notify_enabled: Boolean(body.auto_notify_enabled),
      visible_role_ids: Array.isArray(body.visible_role_ids)
        ? body.visible_role_ids.filter((value): value is string => typeof value === "string")
        : [],
    };
    state.schedule.events.push(event);
    return clone(buildScheduleTimelineEvent(event, me.id)) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/events\/[^/]+$/) && method === "PATCH") {
    const eventId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const entry = state.schedule.events.find((item) => item.id === eventId);
    const me = getMockMeRecord();
    if (!entry) {
      throw { status: 404, code: "SCHEDULE_EVENT_NOT_FOUND", message: "Schedule event not found" } satisfies MockApiErrorLike;
    }
    if (typeof body.title === "string") entry.title = body.title;
    if (typeof body.description === "string") entry.description = body.description;
    if (typeof body.start_at === "string") entry.start_at = body.start_at;
    if (typeof body.end_at === "string") entry.end_at = body.end_at;
    if (typeof body.visibility_mode === "string") entry.visibility_mode = body.visibility_mode as ScheduleVisibilityMode;
    if (typeof body.auto_notify_enabled === "boolean") entry.auto_notify_enabled = body.auto_notify_enabled;
    if (Array.isArray(body.visible_role_ids)) {
      entry.visible_role_ids = body.visible_role_ids.filter((value): value is string => typeof value === "string");
    }
    return clone(buildScheduleTimelineEvent(entry, me.id)) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/events\/[^/]+$/) && method === "DELETE") {
    const eventId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.schedule.events = state.schedule.events.filter((item) => item.id !== eventId);
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/schedule/roles" && method === "POST") {
    const body = parseJsonBody(options.body);
    const role: ScheduleManagedRole = {
      id: nextId("schedule-role"),
      discord_role_id: String(body.discord_role_id ?? "role-new"),
      display_name: String(body.display_name ?? "New role"),
      description: String(body.description ?? ""),
      can_manage_roles: Boolean(body.can_manage_roles),
      can_manage_events: Boolean(body.can_manage_events),
      can_manage_templates: Boolean(body.can_manage_templates),
      can_manage_notifications: Boolean(body.can_manage_notifications),
      can_view_restricted_events: body.can_view_restricted_events !== false,
    };
    state.schedule.managedRoles.push(role);
    return clone(role) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/roles\/[^/]+$/) && method === "PATCH") {
    const roleId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const role = state.schedule.managedRoles.find((item) => item.id === roleId);
    if (!role) {
      throw { status: 404, code: "SCHEDULE_ROLE_NOT_FOUND", message: "Managed role not found" } satisfies MockApiErrorLike;
    }
    if (typeof body.discord_role_id === "string") role.discord_role_id = body.discord_role_id;
    if (typeof body.display_name === "string") role.display_name = body.display_name;
    if (typeof body.description === "string") role.description = body.description;
    if (typeof body.can_manage_roles === "boolean") role.can_manage_roles = body.can_manage_roles;
    if (typeof body.can_manage_events === "boolean") role.can_manage_events = body.can_manage_events;
    if (typeof body.can_manage_templates === "boolean") role.can_manage_templates = body.can_manage_templates;
    if (typeof body.can_manage_notifications === "boolean") role.can_manage_notifications = body.can_manage_notifications;
    if (typeof body.can_view_restricted_events === "boolean") role.can_view_restricted_events = body.can_view_restricted_events;
    return clone(role) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/roles\/[^/]+$/) && method === "DELETE") {
    const roleId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.schedule.managedRoles = state.schedule.managedRoles.filter((item) => item.id !== roleId);
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/schedule/templates" && method === "POST") {
    const body = parseJsonBody(options.body);
    if (body.is_default === true) {
      state.schedule.templates.forEach((template) => {
        template.is_default = false;
      });
    }
    const template: ScheduleTemplate = {
      id: nextId("schedule-template"),
      name: String(body.name ?? "New template"),
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      is_default: Boolean(body.is_default),
    };
    state.schedule.templates.push(template);
    return clone(template) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/templates\/[^/]+$/) && method === "PATCH") {
    const templateId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const template = state.schedule.templates.find((item) => item.id === templateId);
    if (!template) {
      throw { status: 404, code: "SCHEDULE_TEMPLATE_NOT_FOUND", message: "Template not found" } satisfies MockApiErrorLike;
    }
    if (body.is_default === true) {
      state.schedule.templates.forEach((entry) => {
        entry.is_default = false;
      });
    }
    if (typeof body.name === "string") template.name = body.name;
    if (typeof body.title === "string") template.title = body.title;
    if (typeof body.description === "string") template.description = body.description;
    if (typeof body.is_default === "boolean") template.is_default = body.is_default;
    return clone(template) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/templates\/[^/]+$/) && method === "DELETE") {
    const templateId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.schedule.templates = state.schedule.templates.filter((item) => item.id !== templateId);
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/schedule/notifications/webhook" && method === "PUT") {
    const body = parseJsonBody(options.body);
    state.schedule.webhookUrl = String(body.webhook_url ?? "");
    return clone(buildScheduleBootstrap(url).notifications) as T;
  }

  if (pathname === "/api/v1/internal/schedule/notifications/webhook" && method === "DELETE") {
    state.schedule.webhookUrl = "";
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/schedule/notifications/rules" && method === "POST") {
    const body = parseJsonBody(options.body);
    const rule: ScheduleNotificationRule = {
      id: nextId("schedule-rule"),
      name: String(body.name ?? "New rule"),
      enabled: body.enabled !== false,
      schedule_type: String(body.schedule_type ?? "before_event") as ScheduleNotificationRule["schedule_type"],
      offset_minutes: typeof body.offset_minutes === "number" ? body.offset_minutes : null,
      time_of_day: typeof body.time_of_day === "string" ? body.time_of_day : null,
      window_start_minutes: typeof body.window_start_minutes === "number" ? body.window_start_minutes : null,
      window_end_minutes: typeof body.window_end_minutes === "number" ? body.window_end_minutes : null,
      body_template: String(body.body_template ?? ""),
      list_item_template: typeof body.list_item_template === "string" ? body.list_item_template : null,
    };
    state.schedule.rules.push(rule);
    return clone(rule) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/notifications\/rules\/[^/]+$/) && method === "PATCH") {
    const ruleId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const rule = state.schedule.rules.find((item) => item.id === ruleId);
    if (!rule) {
      throw { status: 404, code: "SCHEDULE_RULE_NOT_FOUND", message: "Notification rule not found" } satisfies MockApiErrorLike;
    }
    if (typeof body.name === "string") rule.name = body.name;
    if (typeof body.enabled === "boolean") rule.enabled = body.enabled;
    if (typeof body.schedule_type === "string") rule.schedule_type = body.schedule_type as ScheduleNotificationRule["schedule_type"];
    if (typeof body.offset_minutes === "number" || body.offset_minutes === null) rule.offset_minutes = body.offset_minutes as number | null;
    if (typeof body.time_of_day === "string" || body.time_of_day === null) rule.time_of_day = body.time_of_day as string | null;
    if (typeof body.window_start_minutes === "number" || body.window_start_minutes === null) {
      rule.window_start_minutes = body.window_start_minutes as number | null;
    }
    if (typeof body.window_end_minutes === "number" || body.window_end_minutes === null) {
      rule.window_end_minutes = body.window_end_minutes as number | null;
    }
    if (typeof body.body_template === "string") rule.body_template = body.body_template;
    if (typeof body.list_item_template === "string" || body.list_item_template === null) {
      rule.list_item_template = body.list_item_template as string | null;
    }
    return clone(rule) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/schedule\/notifications\/rules\/[^/]+$/) && method === "DELETE") {
    const ruleId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.schedule.rules = state.schedule.rules.filter((item) => item.id !== ruleId);
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/me/profile" && method === "GET") {
    return clone(buildOwnProfile(getMockMeRecord().profile)) as T;
  }

  if (pathname === "/api/v1/internal/me/profile" && method === "PUT") {
    return clone(applyProfileUpdate(parseJsonBody(options.body))) as T;
  }

  if (pathname === "/api/v1/public/members" && method === "GET") {
    const { page, perPage } = getPageParams(url);
    const publicMembers = state.members
      .filter((member) => member.status === "active" && member.profile.is_public)
      .map(buildPublicMember);
    return paginate(publicMembers, page, perPage) as T;
  }

  if (pathname.startsWith("/api/v1/public/members/") && method === "GET") {
    const discordId = decodeURIComponent(pathname.split("/").pop() ?? "");
    return clone(buildPublicMemberDetail(findMemberByDiscordId(discordId))) as T;
  }

  if (pathname === "/api/v1/public/clubs" && method === "GET") {
    const { page, perPage } = getPageParams(url);
    return paginate(state.clubs.map(buildPublicClub), page, perPage) as T;
  }

  if (pathname.match(/^\/api\/v1\/public\/clubs\/[^/]+\/gallery$/) && method === "GET") {
    const clubId = decodeURIComponent(pathname.split("/")[5] ?? "");
    return buildClubGallery(clubId) as T;
  }

  if (pathname.startsWith("/api/v1/public/clubs/") && method === "GET") {
    const clubId = decodeURIComponent(pathname.split("/").pop() ?? "");
    return clone(buildPublicClubDetail(findClubById(clubId))) as T;
  }

  if (pathname === "/api/v1/public/tags" && method === "GET") {
    return clone(state.tags) as T;
  }

  if (pathname === "/api/v1/internal/admin/stats" && method === "GET") {
    return clone(buildAdminStats()) as T;
  }

  if (pathname === "/api/v1/internal/admin/users" && method === "GET") {
    const { page, perPage } = getPageParams(url);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase().trim();
    const filtered = state.members
      .filter((member) => !role || member.role === role)
      .filter((member) => !status || member.status === status)
      .filter((member) => !search || member.displayName.toLowerCase().includes(search) || member.discordId.includes(search))
      .map(buildAdminUser);
    return paginate(filtered, page, perPage) as T;
  }

  if (pathname === "/api/v1/internal/admin/roles" && method === "GET") {
    return clone(state.adminRoles) as T;
  }

  if (pathname === "/api/v1/internal/admin/role-policies" && method === "GET") {
    return clone(state.adminSystemRoles) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/role-policies\/[^/]+$/) && method === "PATCH") {
    const roleName = decodeURIComponent(pathname.split("/").pop() ?? "") as UserRole;
    const body = parseJsonBody(options.body) as Partial<AdminSystemRolePolicyPayload>;
    const role = state.adminSystemRoles.find((entry) => entry.role === roleName);
    if (!role) {
      throw { status: 404, code: "ADMIN_SYSTEM_ROLE_NOT_FOUND", message: "System role policy not found" } satisfies MockApiErrorLike;
    }

    role.can_view_dashboard = Boolean(body.can_view_dashboard ?? role.can_view_dashboard);
    role.can_manage_users = Boolean(body.can_manage_users ?? role.can_manage_users);
    role.can_manage_roles = Boolean(body.can_manage_roles ?? role.can_manage_roles);
    role.can_manage_events = Boolean(body.can_manage_events ?? role.can_manage_events);
    role.can_manage_tags = Boolean(body.can_manage_tags ?? role.can_manage_tags);
    role.can_manage_reports = Boolean(body.can_manage_reports ?? role.can_manage_reports);
    role.can_manage_galleries = Boolean(body.can_manage_galleries ?? role.can_manage_galleries);
    role.can_manage_clubs = Boolean(body.can_manage_clubs ?? role.can_manage_clubs);
    role.updated_at = nowIso();
    return clone(role) as T;
  }

  if (pathname === "/api/v1/internal/admin/roles" && method === "POST") {
    const body = parseJsonBody(options.body) as Partial<AdminRolePayload>;
    const role: AdminManagedRole = {
      id: nextId("admin-role"),
      discord_role_id: String(body.discord_role_id ?? ""),
      display_name: String(body.display_name ?? ""),
      description: String(body.description ?? ""),
      can_view_dashboard: Boolean(body.can_view_dashboard),
      can_manage_users: Boolean(body.can_manage_users),
      can_manage_roles: Boolean(body.can_manage_roles),
      can_manage_events: Boolean(body.can_manage_events),
      can_manage_tags: Boolean(body.can_manage_tags),
      can_manage_reports: Boolean(body.can_manage_reports),
      can_manage_galleries: Boolean(body.can_manage_galleries),
      can_manage_clubs: Boolean(body.can_manage_clubs),
      updated_at: nowIso(),
    };
    state.adminRoles.unshift(role);
    return clone(role) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/roles\/[^/]+$/) && method === "PATCH") {
    const roleId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body) as Partial<AdminRolePayload>;
    const role = state.adminRoles.find((entry) => entry.id === roleId);
    if (!role) {
      throw { status: 404, code: "ADMIN_ROLE_NOT_FOUND", message: "Managed role not found" } satisfies MockApiErrorLike;
    }

    role.discord_role_id = String(body.discord_role_id ?? role.discord_role_id);
    role.display_name = String(body.display_name ?? role.display_name);
    role.description = String(body.description ?? role.description);
    role.can_view_dashboard = Boolean(body.can_view_dashboard ?? role.can_view_dashboard);
    role.can_manage_users = Boolean(body.can_manage_users ?? role.can_manage_users);
    role.can_manage_roles = Boolean(body.can_manage_roles ?? role.can_manage_roles);
    role.can_manage_events = Boolean(body.can_manage_events ?? role.can_manage_events);
    role.can_manage_tags = Boolean(body.can_manage_tags ?? role.can_manage_tags);
    role.can_manage_reports = Boolean(body.can_manage_reports ?? role.can_manage_reports);
    role.can_manage_galleries = Boolean(body.can_manage_galleries ?? role.can_manage_galleries);
    role.can_manage_clubs = Boolean(body.can_manage_clubs ?? role.can_manage_clubs);
    role.updated_at = nowIso();

    return clone(role) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/roles\/[^/]+$/) && method === "DELETE") {
    const roleId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const index = state.adminRoles.findIndex((entry) => entry.id === roleId);
    if (index < 0) {
      throw { status: 404, code: "ADMIN_ROLE_NOT_FOUND", message: "Managed role not found" } satisfies MockApiErrorLike;
    }
    state.adminRoles.splice(index, 1);
    return undefined as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/users\/[^/]+\/role$/) && method === "PATCH") {
    const userId = decodeURIComponent(pathname.split("/")[6] ?? "");
    const body = parseJsonBody(options.body);
    const member = state.members.find((entry) => entry.id === userId);
    if (!member) {
      throw { status: 404, code: "USER_NOT_FOUND", message: "User not found" } satisfies MockApiErrorLike;
    }
    member.role = String(body.role ?? member.role) as UserRole;
    member.profile.updated_at = nowIso();
    return undefined as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/users\/[^/]+\/status$/) && method === "PATCH") {
    const userId = decodeURIComponent(pathname.split("/")[6] ?? "");
    const body = parseJsonBody(options.body);
    const member = state.members.find((entry) => entry.id === userId);
    if (!member) {
      throw { status: 404, code: "USER_NOT_FOUND", message: "User not found" } satisfies MockApiErrorLike;
    }
    member.status = String(body.status ?? member.status) as UserStatus;
    member.profile.updated_at = nowIso();
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/admin/tags" && method === "GET") {
    return clone(state.tags) as T;
  }

  if (pathname === "/api/v1/internal/admin/tags" && method === "POST") {
    const body = parseJsonBody(options.body);
    const tag: Tag = {
      id: nextId("tag"),
      name: String(body.name ?? "New tag"),
      color: String(body.color ?? "#E8836B"),
    };
    state.tags.push(tag);
    return clone(tag) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/tags\/[^/]+$/) && method === "PUT") {
    const tagId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const tag = state.tags.find((entry) => entry.id === tagId);
    if (!tag) {
      throw { status: 404, code: "TAG_NOT_FOUND", message: "Tag not found" } satisfies MockApiErrorLike;
    }
    if (typeof body.name === "string") tag.name = body.name;
    if (typeof body.color === "string") tag.color = body.color;
    return clone(tag) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/tags\/[^/]+$/) && method === "DELETE") {
    const tagId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.tags = state.tags.filter((entry) => entry.id !== tagId);
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/admin/reports" && method === "GET") {
    const { page, perPage } = getPageParams(url);
    return paginate(state.reports, page, perPage) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/reports\/[^/]+$/) && method === "PATCH") {
    const reportId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const report = state.reports.find((entry) => entry.id === reportId);
    if (!report) {
      throw { status: 404, code: "REPORT_NOT_FOUND", message: "Report not found" } satisfies MockApiErrorLike;
    }
    report.status = String(body.status ?? report.status) as ReportStatus;
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/admin/galleries" && method === "GET") {
    const { page, perPage } = getPageParams(url);
    const targetType = url.searchParams.get("target_type");
    const clubId = url.searchParams.get("club_id");
    const filtered = state.galleries
      .filter((image) => !targetType || image.target_type === targetType)
      .filter((image) => !clubId || image.club_id === clubId);
    return paginate(filtered, page, perPage) as T;
  }

  if (pathname === "/api/v1/internal/admin/gallery" && method === "POST") {
    const body = parseJsonBody(options.body);
    const targetType = String(body.target_type ?? "community") as GalleryTargetType;
    const clubId = typeof body.club_id === "string" ? body.club_id : undefined;
    const image = createGalleryItem(targetType, clubId, typeof body.caption === "string" ? body.caption : null);
    if (typeof body.image_url === "string" && body.image_url.length > 0) {
      image.image_url = body.image_url;
    }
    state.galleries.unshift(image);
    return clone(image) as T;
  }

  if (pathname === "/api/v1/internal/admin/gallery/files" && method === "POST") {
    const formData = options.body instanceof FormData ? options.body : new FormData();
    const targetType = String(formData.get("target_type") ?? "community") as GalleryTargetType;
    const clubId = String(formData.get("club_id") ?? "").trim() || undefined;
    const caption = String(formData.get("caption") ?? "").trim() || null;
    const files = formData.getAll("files");
    const items = files.length > 0 ? files.map(() => createGalleryItem(targetType, clubId, caption)) : [createGalleryItem(targetType, clubId, caption)];
    state.galleries.unshift(...items);
    return clone({ uploaded_count: items.length, items }) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/gallery\/[^/]+\/status$/) && method === "PATCH") {
    const imageId = decodeURIComponent(pathname.split("/")[6] ?? "");
    const body = parseJsonBody(options.body);
    const image = state.galleries.find((entry) => entry.id === imageId);
    if (!image) {
      throw { status: 404, code: "GALLERY_NOT_FOUND", message: "Gallery image not found" } satisfies MockApiErrorLike;
    }
    image.status = String(body.status ?? image.status) as GalleryImageStatus;
    return undefined as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/gallery\/[^/]+$/) && method === "DELETE") {
    const imageId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.galleries = state.galleries.filter((entry) => entry.id !== imageId);
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/admin/clubs" && method === "GET") {
    return clone(state.clubs.map(buildAdminClub)) as T;
  }

  if (pathname === "/api/v1/internal/admin/clubs" && method === "POST") {
    const body = parseJsonBody(options.body);
    const me = getMockMeRecord();
    const club: MockClubRecord = {
      id: nextId("club"),
      name: String(body.name ?? "New club"),
      description: String(body.description ?? ""),
      descriptionHtml: htmlFromText(String(body.description ?? "")),
      coverImageUrl: typeof body.cover_image_url === "string" && body.cover_image_url.length > 0 ? body.cover_image_url : "/banner.png",
      ownerDiscordId: me.discordId,
      members: [{ userId: me.discordId, role: "owner", joinedAt: nowIso() }],
      createdAt: nowIso(),
    };
    state.clubs.unshift(club);
    return clone(buildAdminClub(club)) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/clubs\/[^/]+$/) && method === "PUT") {
    const clubId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const club = findClubById(clubId);
    if (typeof body.name === "string") club.name = body.name;
    if (typeof body.description === "string") {
      club.description = body.description;
      club.descriptionHtml = htmlFromText(body.description);
    }
    if (typeof body.cover_image_url === "string") club.coverImageUrl = body.cover_image_url;
    return clone(buildAdminClub(club)) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/clubs\/[^/]+$/) && method === "DELETE") {
    const clubId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.clubs = state.clubs.filter((entry) => entry.id !== clubId);
    state.galleries = state.galleries.filter((entry) => entry.club_id !== clubId);
    return undefined as T;
  }

  if (pathname === "/api/v1/internal/reports" && method === "POST") {
    const body = parseJsonBody(options.body);
    const me = getMockMeRecord();
    const report: AdminReport = {
      id: nextId("report"),
      reporter_id: me.discordId,
      reporter_username: me.displayName,
      target_type: String(body.target_type ?? "profile") as ReportTargetType,
      target_id: String(body.target_id ?? ""),
      reason: String(body.reason ?? ""),
      status: "pending",
      created_at: nowIso(),
    };
    state.reports.unshift(report);
    return clone(report) as T;
  }

  throw {
    status: 501,
    code: "MOCK_ROUTE_NOT_IMPLEMENTED",
    message: `No development mock is configured for ${method} ${pathname}`,
  } satisfies MockApiErrorLike;
}
