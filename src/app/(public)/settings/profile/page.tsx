import { getMyProfile } from "@/lib/api/profile";
import { requireMe } from "@/lib/api/auth";
import { ProfileForm } from "@/components/features/profile/profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
  robots: { index: false, follow: false },
};

export default async function ProfileEditorPage() {
  const me = await requireMe();
  const profile = await getMyProfile();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <ProfileForm
        defaultValues={{
          vrc_id: profile.vrc_id,
          x_id: profile.x_id,
          bio_markdown: profile.bio_markdown,
          is_public: profile.is_public,
        }}
        username={me.discord_username}
      />
    </div>
  );
}
