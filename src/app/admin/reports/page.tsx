import { getAdminReports } from "@/lib/api/admin";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ReportActionsTable } from "@/components/features/admin/report-actions-table";
import { Flag } from "lucide-react";
import type { AdminReport, PaginatedResponse } from "@/lib/api/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  let data: PaginatedResponse<AdminReport>;
  try {
    data = await getAdminReports({ page, per_page: 20 });
  } catch {
    data = { items: [], total_count: 0, total_pages: 0 };
  }

  return (
    <div>
      <SectionHeader title="Report Management" />
      <Card className="rounded-xl mt-6">
        <CardContent className="p-0">
          {data.items.length > 0 ? (
            <ReportActionsTable reports={data.items} />
          ) : (
            <div className="p-8"><EmptyState icon={Flag} message="No reports" /></div>
          )}
        </CardContent>
      </Card>
      {data.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl="/admin/reports"
            searchParams={searchParams as Record<string, string>}
          />
        </div>
      )}
    </div>
  );
}
