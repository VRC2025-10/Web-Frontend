"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/features/admin/confirmation-dialog";
import { createClubAction, updateClubAction, deleteClubAction } from "@/actions/admin";
import { formatDate } from "@/lib/date";
import type { PublicClub } from "@/lib/api/types";

interface ClubManagementClientProps {
  clubs: PublicClub[];
}

const defaultForm = {
  name: "",
  description: "",
  cover_image_url: "",
};

export function ClubManagementClient({ clubs }: ClubManagementClientProps) {
  const locale = useLocale();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<PublicClub | null>(null);
  const [targetClub, setTargetClub] = useState<PublicClub | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingClub(null);
    setForm(defaultForm);
    setFormOpen(true);
  }

  function openEdit(club: PublicClub) {
    setEditingClub(club);
    setForm({
      name: club.name,
      description: club.description,
      cover_image_url: club.cover_image_url ?? "",
    });
    setFormOpen(true);
  }

  function openDelete(club: PublicClub) {
    setTargetClub(club);
    setDeleteOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    startTransition(async () => {
      const data = {
        name: form.name,
        description: form.description,
        cover_image_url: form.cover_image_url || undefined,
      };

      const result = editingClub
        ? await updateClubAction(editingClub.id, data)
        : await createClubAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingClub ? "Club updated successfully" : "Club created successfully");
        setFormOpen(false);
      }
    });
  }

  function handleDelete() {
    if (!targetClub) return;
    startTransition(async () => {
      const result = await deleteClubAction(targetClub.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Club deleted successfully");
      }
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold font-heading md:text-3xl">Club Management</h2>
        <Button onClick={openCreate} className="rounded-xl">Create Club</Button>
      </div>

      <div className="rounded-xl border bg-card mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Cover</th>
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Description</th>
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Created</th>
                <th scope="col" className="text-right p-4 font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4">
                    {club.cover_image_url ? (
                      <div className="relative w-20 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={club.cover_image_url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-12 rounded-lg bg-muted" />
                    )}
                  </td>
                  <td className="p-4 font-medium">{club.name}</td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate">
                    {club.description}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(club.created_at, locale)}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${club.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(club)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDelete(club)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {clubs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No clubs created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Club form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-xl max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClub ? "Edit Club" : "Create Club"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="club-name">Club Name</Label>
              <Input
                id="club-name"
                className="rounded-xl"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="club-desc">Description</Label>
              <Textarea
                id="club-desc"
                className="rounded-xl min-h-[80px]"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="club-cover">Cover Image URL</Label>
              <Input
                id="club-cover"
                className="rounded-xl"
                value={form.cover_image_url}
                onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                placeholder="https://..."
              />
              {form.cover_image_url && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden mt-2">
                  <Image
                    src={form.cover_image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Club"
        description={`Are you sure you want to delete "${targetClub?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
