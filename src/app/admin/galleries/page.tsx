import { getAdminGalleries } from "@/lib/api/admin";
import { getClubs } from "@/lib/api/clubs";
import { NextIntlClientProvider } from "next-intl";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/shared/pagination";
import { GalleryManagementClient } from "@/components/features/admin/gallery-management-client";
import type { AdminGalleryImage, PaginatedResponse } from "@/lib/api/types";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getLocaleMessages } from "@/i18n/messages";

export const metadata: Metadata = {
  title: "Gallery Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGalleriesPage(props: { searchParams: Promise<{ page?: string; club?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const clubId = searchParams.club;

  let data: PaginatedResponse<AdminGalleryImage>;
  let clubs: Array<{ id: string; name: string }>;
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("admin.galleries"),
  ]);
  const messages = getLocaleMessages(locale);
  try {
    [data, clubs] = await Promise.all([
      getAdminGalleries({
        page,
        per_page: 20,
        target_type: clubId ? "club" : undefined,
        club_id: clubId,
      }),
      getClubs().then((items) => items.map((club) => ({ id: club.id, name: club.name }))),
    ]);
  } catch {
    data = { items: [], total_count: 0, total_pages: 0 };
    clubs = [];
  }

  return (
    <div>
      <SectionHeader
        title={t("title")}
        description={clubId ? `${t("description")} (${t("targetClub")})` : t("description")}
      />
      <Card className="rounded-xl mt-6">
        <CardContent className="p-0">
          <NextIntlClientProvider
            locale={locale}
            messages={{
              admin: {
                galleries: messages.admin.galleries,
              },
            }}
          >
            <GalleryManagementClient images={data.items} clubs={clubs} initialClubId={clubId} />
          </NextIntlClientProvider>
        </CardContent>
      </Card>
      {data.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl="/admin/galleries"
            searchParams={searchParams as Record<string, string>}
          />
        </div>
      )}
    </div>
  );
}
