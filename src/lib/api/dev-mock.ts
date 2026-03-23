import type {
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
  PublicEvent,
  PublicEventDetail,
  PublicGalleryImage,
  PublicMember,
  PublicMemberDetail,
  ReportStatus,
  ReportTargetType,
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

interface MockState {
  meId: string;
  members: MockMemberRecord[];
  clubs: MockClubRecord[];
  events: PublicEvent[];
  tags: Tag[];
  reports: AdminReport[];
  galleries: MockGalleryRecord[];
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
      joinedAt: "2025-10-01T12:00:00.000Z",
      role: "super_admin",
      status: "active",
      profile: {
        vrc_id: "usr_11111111-1111-1111-1111-111111111111",
        x_id: "aki_october",
        bio_markdown: "I handle operations, events, and gallery reviews.",
        bio_html: htmlFromText("I handle operations, events, and gallery reviews."),
        is_public: true,
        updated_at: "2026-03-22T10:00:00.000Z",
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      discordId: "100000000000000002",
      displayName: "Nao",
      avatarUrl: "/logo.png",
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

  const events: PublicEvent[] = [
    {
      id: "event-autumn-social",
      title: "Autumn Social Night",
      description_markdown: "A relaxed meetup for photos, introductions, and world hopping.",
      host_name: "Aki",
      host_user_id: "100000000000000001",
      event_status: "published",
      start_time: "2026-03-28T12:00:00.000Z",
      end_time: "2026-03-28T14:00:00.000Z",
      location: "VRChat Group+",
      tags: [tags[0], tags[1]],
      created_at: "2026-03-10T12:00:00.000Z",
      updated_at: "2026-03-18T12:00:00.000Z",
    },
    {
      id: "event-build-review",
      title: "Build Review Session",
      description_markdown: "Share works in progress and get environment feedback.",
      host_name: "Nao",
      host_user_id: "100000000000000002",
      event_status: "draft",
      start_time: "2026-04-02T11:00:00.000Z",
      end_time: null,
      location: "World Builders Room",
      tags: [tags[2]],
      created_at: "2026-03-11T15:30:00.000Z",
      updated_at: "2026-03-19T09:45:00.000Z",
    },
  ];

  const reports: AdminReport[] = [
    {
      id: "report-1",
      reporter_id: "100000000000000003",
      reporter_username: "Mio",
      target_type: "event",
      target_id: "event-build-review",
      reason: "Start time is missing in the announcement.",
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

  return {
    meId: members[0].id,
    members,
    clubs,
    events,
    tags,
    reports,
    galleries,
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

function buildAuthMe() {
  const me = getMockMeRecord();
  return {
    id: me.id,
    discord_id: me.discordId,
    discord_username: me.displayName,
    avatar_url: me.avatarUrl,
    role: me.role,
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
    total_events: state.events.length,
    total_clubs: state.clubs.length,
    pending_reports: state.reports.filter((report) => report.status === "pending").length,
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

function findEventById(eventId: string): PublicEventDetail {
  const event = state.events.find((entry) => entry.id === eventId);
  if (!event) {
    throw { status: 404, code: "EVENT_NOT_FOUND", message: "Event not found" } satisfies MockApiErrorLike;
  }

  return clone(event);
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

  if (pathname === "/api/v1/public/events" && method === "GET") {
    const { page, perPage } = getPageParams(url);
    return paginate(state.events, page, perPage) as T;
  }

  if (pathname.startsWith("/api/v1/public/events/") && method === "GET") {
    const eventId = decodeURIComponent(pathname.split("/").pop() ?? "");
    return findEventById(eventId) as T;
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

  if (pathname.match(/^\/api\/v1\/internal\/admin\/users\/[^/]+\/role$/) && method === "PUT") {
    const userId = decodeURIComponent(pathname.split("/")[6] ?? "");
    const body = parseJsonBody(options.body);
    const member = state.members.find((entry) => entry.id === userId);
    if (!member) {
      throw { status: 404, code: "USER_NOT_FOUND", message: "User not found" } satisfies MockApiErrorLike;
    }
    member.role = String(body.new_role ?? member.role) as UserRole;
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

  if (pathname === "/api/v1/internal/admin/events" && method === "GET") {
    const { page, perPage } = getPageParams(url);
    return paginate(state.events, page, perPage) as T;
  }

  if (pathname === "/api/v1/internal/admin/events" && method === "POST") {
    const body = parseJsonBody(options.body);
    const me = getMockMeRecord();
    const event: PublicEvent = {
      id: nextId("event"),
      title: String(body.title ?? "Untitled event"),
      description_markdown: String(body.description_markdown ?? ""),
      host_name: me.displayName,
      host_user_id: me.discordId,
      event_status: String(body.event_status ?? "draft") as PublicEvent["event_status"],
      start_time: String(body.start_time ?? nowIso()),
      end_time: typeof body.end_time === "string" ? body.end_time : null,
      location: typeof body.location === "string" ? body.location : null,
      tags: state.tags.filter((tag) => Array.isArray(body.tags) && body.tags.includes(tag.id)),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    state.events.unshift(event);
    return clone(event) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/events\/[^/]+$/) && method === "PUT") {
    const eventId = decodeURIComponent(pathname.split("/").pop() ?? "");
    const body = parseJsonBody(options.body);
    const event = state.events.find((entry) => entry.id === eventId);
    if (!event) {
      throw { status: 404, code: "EVENT_NOT_FOUND", message: "Event not found" } satisfies MockApiErrorLike;
    }
    if (typeof body.title === "string") event.title = body.title;
    if (typeof body.description_markdown === "string") event.description_markdown = body.description_markdown;
    if (typeof body.start_time === "string") event.start_time = body.start_time;
    if (typeof body.end_time === "string" || body.end_time === null) event.end_time = body.end_time as string | null;
    if (typeof body.location === "string" || body.location === null) event.location = body.location as string | null;
    if (typeof body.event_status === "string") event.event_status = body.event_status as PublicEvent["event_status"];
    if (Array.isArray(body.tags)) {
      const tagIds = body.tags.filter((value): value is string => typeof value === "string");
      event.tags = state.tags.filter((tag) => tagIds.includes(tag.id));
    }
    event.updated_at = nowIso();
    return clone(event) as T;
  }

  if (pathname.match(/^\/api\/v1\/internal\/admin\/events\/[^/]+$/) && method === "DELETE") {
    const eventId = decodeURIComponent(pathname.split("/").pop() ?? "");
    state.events = state.events.filter((entry) => entry.id !== eventId);
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
