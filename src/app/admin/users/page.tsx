import { getAdminUsers } from "@/lib/api/admin";
import { requireMe } from "@/lib/api/auth";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/shared/pagination";
import { UserActionsTable } from "@/components/features/admin/user-actions-table";
import type { AdminUser, PaginatedResponse } from "@/lib/api/types";
import type { Metadata } from "next";
import { forbidden } from "next/navigation";

export const metadata: Metadata = {
  title: "User Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage(props: { searchParams: Promise<{ page?: string; role?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const me = await requireMe();
  if (!me.admin_permissions.manage_users) {
    forbidden();
  }

  let data: PaginatedResponse<AdminUser>;
  try {
    data = await getAdminUsers({ page, per_page: 20 });
  } catch {
    data = { items: [], total_count: 0, total_pages: 0 };
  }

  return (
    <div>
      <SectionHeader title="User Management" />
      <Card className="rounded-xl mt-6">
        <CardContent className="p-0">
          <UserActionsTable users={data.items} />
        </CardContent>
      </Card>
      {data.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl="/admin/users"
            searchParams={searchParams as Record<string, string>}
          />
        </div>
      )}
    </div>
  );
}
