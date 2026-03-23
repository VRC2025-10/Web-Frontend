import type { PublicClub, PublicClubDetail, UserBrief } from "./types";

interface ClubMemberApi {
  user_id: string;
  discord_display_name: string;
  role: string;
  joined_at: string;
}

export interface PublicClubApi {
  id: string;
  name: string;
  description_html?: string | null;
  cover_image_url?: string | null;
  owner?: UserBrief;
  member_count?: number;
  created_at: string;
}

export interface PublicClubDetailApi extends PublicClubApi {
  members?: ClubMemberApi[];
}

function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizePublicClub(club: PublicClubApi): PublicClub {
  return {
    id: club.id,
    name: club.name,
    description: stripHtml(club.description_html),
    description_html: club.description_html ?? "",
    cover_image_url: club.cover_image_url ?? null,
    owner: club.owner ?? null,
    member_count: club.member_count ?? 0,
    created_at: club.created_at,
  };
}

export function normalizePublicClubDetail(club: PublicClubDetailApi): PublicClubDetail {
  return {
    ...normalizePublicClub(club),
    members: club.members ?? [],
  };
}

export function normalizePublicClubCollection(clubs: PublicClubApi[]): PublicClub[] {
  return clubs.map(normalizePublicClub);
}