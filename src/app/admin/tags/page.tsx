import { getAdminTags } from "@/lib/api/admin";
import { TagManagementClient } from "@/components/features/admin/tag-management-client";
import type { Tag } from "@/lib/api/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tag Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTagsPage() {
  let tags: Tag[];
  try {
    tags = await getAdminTags();
  } catch {
    tags = [];
  }

  return (
    <div>
      <TagManagementClient tags={tags} />
    </div>
  );
}
