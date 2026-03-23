"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { MoreHorizontal, Check, X, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/features/admin/confirmation-dialog";
import { ImageDropzone } from "@/components/features/admin/image-dropzone";
import {
  updateGalleryStatusAction,
  deleteGalleryImageAction,
  uploadGalleryFilesAction,
} from "@/actions/admin";
import { formatDate } from "@/lib/date";
import type { AdminGalleryImage, GalleryTargetType } from "@/lib/api/types";

const MAX_TOTAL_UPLOAD_BYTES = 25 * 1024 * 1024;

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface GalleryManagementClientProps {
  images: AdminGalleryImage[];
  clubs: Array<{ id: string; name: string }>;
  initialClubId?: string;
}

function getDefaultTargetType(initialClubId?: string): GalleryTargetType {
  return initialClubId ? "club" : "community";
}

export function GalleryManagementClient({ images, clubs, initialClubId }: GalleryManagementClientProps) {
  const t = useTranslations("admin.galleries");
  const locale = useLocale();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetImage, setTargetImage] = useState<AdminGalleryImage | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    targetType: getDefaultTargetType(initialClubId),
    clubId: initialClubId ?? "",
    caption: "",
  });
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(image: AdminGalleryImage, status: "approved" | "rejected") {
    startTransition(async () => {
      const result = await updateGalleryStatusAction(image.id, status, {
        targetType: image.target_type,
        clubId: image.club_id,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("statusUpdated"));
      }
    });
  }

  function openDelete(image: AdminGalleryImage) {
    setTargetImage(image);
    setDeleteOpen(true);
  }

  function handleUpload() {
    if (files.length === 0) {
      toast.error(t("errors.noFiles"));
      return;
    }

    if (form.targetType === "club" && !form.clubId) {
      toast.error(t("selectClub"));
      return;
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      toast.error(t("errors.totalTooLarge", { maxSizeMB: MAX_TOTAL_UPLOAD_BYTES / (1024 * 1024) }));
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("target_type", form.targetType);
      if (form.targetType === "club") {
        formData.set("club_id", form.clubId);
      }
      if (form.caption.trim()) {
        formData.set("caption", form.caption.trim());
      }
      for (const file of files) {
        formData.append("files", file);
      }

      const result = await uploadGalleryFilesAction(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(t("uploadQueuedCount", { count: result.uploadedCount ?? files.length }));
      setForm({
        targetType: getDefaultTargetType(initialClubId),
        clubId: initialClubId ?? "",
        caption: "",
      });
      setFiles([]);
    });
  }

  function handleDelete() {
    if (!targetImage) return;
    startTransition(async () => {
      const result = await deleteGalleryImageAction(targetImage.id, {
        targetType: targetImage.target_type,
        clubId: targetImage.club_id,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("deleted"));
      }
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <div className="border-b border-border/60 p-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Upload className="h-5 w-5" />
          {t("uploadTitle")}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("uploadHelp")}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="gallery-target-type">{t("labels.target")}</Label>
            <Select
              value={form.targetType}
              onValueChange={(value) => setForm((current) => ({
                ...current,
                targetType: value as GalleryTargetType,
                clubId: value === "club" ? current.clubId : "",
              }))}
            >
              <SelectTrigger id="gallery-target-type" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="community">{t("targetCommunity")}</SelectItem>
                <SelectItem value="club">{t("targetClub")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gallery-club">{t("labels.club")}</Label>
            <Select
              value={form.clubId || undefined}
              onValueChange={(value) => setForm((current) => ({ ...current, clubId: value }))}
              disabled={form.targetType !== "club"}
            >
              <SelectTrigger id="gallery-club" className="rounded-xl">
                <SelectValue placeholder={form.targetType === "club" ? t("selectClub") : t("clubOptional")} />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 md:col-span-2 xl:col-span-1">
            <Label htmlFor="gallery-caption">{t("labels.caption")}</Label>
            <Input
              id="gallery-caption"
              className="rounded-xl"
              placeholder={t("placeholders.caption")}
              value={form.caption}
              onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))}
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <ImageDropzone
            files={files}
            onFilesSelected={(selected) => setFiles((current) => [...current, ...selected])}
            onFileRemoved={(index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            maxFiles={10}
            maxSizeMB={10}
            disabled={isPending}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            {t("uploadConstraints", { maxFiles: 10, maxSizeMB: 10, totalSizeMB: MAX_TOTAL_UPLOAD_BYTES / (1024 * 1024) })}
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleUpload} disabled={isPending || files.length === 0} className="rounded-xl">
            {isPending ? `${t("uploadButton")}...` : t("uploadButton")}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">{t("columns.thumbnail")}</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">{t("columns.target")}</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">{t("columns.uploader")}</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">{t("columns.status")}</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">{t("columns.date")}</th>
              <th scope="col" className="text-right p-4 font-medium text-muted-foreground">
                <span className="sr-only">{t("columns.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr key={image.id} className="border-b border-border/50 last:border-0">
                <td className="p-4">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={image.image_url}
                      alt={image.caption ?? "Gallery image"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">
                  <div className="font-medium text-foreground">
                    {image.target_type === "community" ? t("targetLabel.community") : image.club?.name ?? t("targetLabel.unknownClub")}
                  </div>
                  {image.caption && (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{image.caption}</div>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{image.uploaded_by.discord_display_name}</td>
                <td className="p-4">
                  <Badge variant="secondary" className={`rounded-full ${statusColor[image.status] ?? ""}`}>
                    {image.status}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground">
                  {formatDate(image.created_at, locale)}
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Actions for image`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      {image.status !== "approved" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(image, "approved")}
                          disabled={isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {t("actions.approve")}
                        </DropdownMenuItem>
                      )}
                      {image.status !== "rejected" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(image, "rejected")}
                          disabled={isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {t("actions.reject")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => openDelete(image)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {images.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("dialog.deleteTitle")}
        description={t("dialog.deleteDesc")}
        confirmLabel={t("actions.delete")}
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
