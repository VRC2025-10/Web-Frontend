import { getAdminEvents } from "@/lib/api/admin";
import { Pagination } from "@/components/shared/pagination";
import { EventManagementClient } from "@/components/features/admin/event-management-client";
import type { PublicEvent, PaginatedResponse } from "@/lib/api/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  let data: PaginatedResponse<PublicEvent>;
  try {
    data = await getAdminEvents({ page, per_page: 20 });
  } catch {
    data = { items: [], total_count: 0, total_pages: 0 };
  }

  return (
    <div>
      <EventManagementClient events={data.items} />
      {data.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl="/admin/events"
            searchParams={searchParams as Record<string, string>}
          />
        </div>
      )}
    </div>
  );
}
