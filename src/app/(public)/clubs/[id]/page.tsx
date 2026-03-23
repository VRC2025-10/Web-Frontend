import { getClubById, getClubGallery } from "@/lib/api/clubs";
import { getMe } from "@/lib/api/auth";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { GalleryGrid } from "@/components/features/clubs/gallery-grid";
import { ArrowLeft, Crown, ImageOff, ImagePlus, Users } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  try {
    const club = await getClubById(params.id);
    return {
      title: club.name,
      description: club.description?.slice(0, 160) ?? "",
    };
  } catch {
    return {};
  }
}

export default async function ClubDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tPromise = getTranslations("clubs");
  const clubPromise = getClubById(params.id);
  const galleryPromise = getClubGallery(params.id, { per_page: 40 }).catch(() => ({
    items: [],
    total_count: 0,
    total_pages: 0,
  }));
  const mePromise = getMe();

  let club;
  try {
    club = await clubPromise;
  } catch {
    notFound();
  }

  const [t, gallery, me] = await Promise.all([tPromise, galleryPromise, mePromise]);
  const canUpload = me && ["admin", "super_admin", "staff"].includes(me.role);

  return (
    <div className="pb-16">
      {/* Cover Header */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        {club.cover_image_url ? (
          <Image src={club.cover_image_url} alt="" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-5xl px-4 pb-6 md:px-8 md:pb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4 text-foreground/80">
              <Link href="/clubs"><ArrowLeft className="w-4 h-4 mr-2" />{t("backToList")}</Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">{club.name}</h1>
            {club.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/80 md:text-base">
                {club.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <SectionHeader title={t("detail.aboutTitle")} />
          {club.description_html ? (
            <div
              className="markdown-content prose prose-sm prose-neutral mt-4 max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: club.description_html }}
            />
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t("detail.noDescription")}</p>
          )}
        </div>

        <aside className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Crown className="h-4 w-4" />
            {t("detail.owner")}
          </div>
          <p className="mt-2 text-base font-semibold">{club.owner?.discord_display_name ?? t("detail.unknownOwner")}</p>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            {t("detail.members", { count: club.members.length })}
          </div>
          {club.members.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {club.members.map((member) => (
                <li key={`${member.user_id}-${member.role}`} className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{member.discord_display_name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t("detail.noMembers")}</p>
          )}
        </aside>
      </section>

      {/* Gallery */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-8" aria-labelledby="gallery-heading">
        <SectionHeader
          title={t("gallery.title")}
          action={canUpload ? (
            <Button variant="outline" className="rounded-2xl border-dashed" asChild>
              <Link href={`/admin/galleries?club=${params.id}`}><ImagePlus className="w-4 h-4 mr-2" />{t("gallery.addPhotos")}</Link>
            </Button>
          ) : undefined}
        />
        {gallery.items.length > 0 ? (
          <GalleryGrid images={gallery.items} />
        ) : (
          <div className="mt-8"><EmptyState icon={ImageOff} message={t("gallery.empty")} /></div>
        )}
      </section>
    </div>
  );
}
