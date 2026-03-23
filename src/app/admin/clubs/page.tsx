import { getAdminClubs } from "@/lib/api/admin";
import { requireMe } from "@/lib/api/auth";
import { ClubManagementClient } from "@/components/features/admin/club-management-client";
import type { PublicClub } from "@/lib/api/types";
import type { Metadata } from "next";
import { forbidden } from "next/navigation";

export const metadata: Metadata = {
  title: "Club Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminClubsPage() {
  const me = await requireMe();
  if (!me.admin_permissions.manage_clubs) {
    forbidden();
  }

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
