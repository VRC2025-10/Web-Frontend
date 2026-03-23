import { getMemberById } from "@/lib/api/members";
import { getMe } from "@/lib/api/auth";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, UserCircle } from "lucide-react";
import { ReportDialog } from "@/components/shared/report-dialog";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/i18n/messages";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  try {
    const member = await getMemberById(params.id);
    return {
      title: member.discord_username,
      description: member.bio_markdown?.slice(0, 160) ?? "",
    };
  } catch {
    return {};
  }
}

export default async function MemberDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tPromise = getTranslations("members");
  const mePromise = getMe();
  const memberPromise = getMemberById(params.id);
  const localePromise = getLocale();

  let member;
  try {
    member = await memberPromise;
  } catch {
    notFound();
  }

  const [locale, t, me] = await Promise.all([localePromise, tPromise, mePromise]);
  const messages = getLocaleMessages(locale);
  const isOwnProfile = me?.discord_id === member.user_id;

  return (
    <div className="max-w-5xl mx-auto px-4 mt-8 pb-16">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/members"><ArrowLeft className="w-4 h-4 mr-2" />{t("detail.backButton")}</Link>
      </Button>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Card */}
        <aside aria-label="Profile summary" className="lg:w-1/3">
          <Card className="rounded-[2rem] p-8 text-center sticky top-24">
            <CardContent className="p-0">
              <Avatar className="w-40 h-40 mx-auto border-4 border-background shadow-md">
                <AvatarImage src={member.avatar_url ?? undefined} alt={member.discord_username} />
                <AvatarFallback><UserCircle className="w-20 h-20" /></AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold mt-4">{member.discord_username}</h1>
              <div className="flex justify-center gap-4 mt-6">
                {member.x_id && (
                  <Button variant="outline" size="icon" className="rounded-full" asChild>
                    <a href={`https://x.com/${member.x_id}`} target="_blank" rel="noopener noreferrer" aria-label={`X/Twitter profile of ${member.discord_username}`}>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {member.vrc_id && (
                  <Badge variant="secondary" className="rounded-full">{member.vrc_id}</Badge>
                )}
              </div>
              {isOwnProfile && (
                <Button variant="outline" className="rounded-2xl w-full mt-6" asChild>
                  <Link href="/settings/profile">{t("detail.editProfile")}</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Bio Section */}
        <article aria-label={`About ${member.discord_username}`} className="lg:w-2/3">
          <Card className="rounded-[2rem] p-8">
            <CardContent className="p-0">
              <h2 className="text-xl font-bold">{t("detail.about")}</h2>
              {member.bio_html ? (
                <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: member.bio_html }} />
              ) : (
                <p className="mt-4 text-muted-foreground">{t("detail.noBio")}</p>
              )}
              {me && !isOwnProfile && (
                <>
                  <Separator className="my-6" />
                  <NextIntlClientProvider locale={locale} messages={{ report: messages.report }}>
                    <ReportDialog
                      targetType="profile"
                      targetId={member.user_id}
                      triggerLabel={t("detail.report")}
                    />
                  </NextIntlClientProvider>
                </>
              )}
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
