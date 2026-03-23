import { getAdminClubs } from "@/lib/api/admin";
import { ClubManagementClient } from "@/components/features/admin/club-management-client";
import type { PublicClub } from "@/lib/api/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Club Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminClubsPage() {
  let clubs: PublicClub[];
  try {
    clubs = await getAdminClubs();
  } catch {
    clubs = [];
  }

  return (
    <div>
      <ClubManagementClient clubs={clubs} />
    </div>
  );
}
