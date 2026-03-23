"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createTagAction, updateTagAction, deleteTagAction } from "@/actions/admin";
import type { Tag } from "@/lib/api/types";

interface TagManagementClientProps {
  tags: Tag[];
}

const COLOR_PRESETS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#d946ef", "#ec4899", "#6b7280", "#78716c",
];

const defaultForm = {
  name: "",
  color: "#3b82f6",
};

export function TagManagementClient({ tags }: TagManagementClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [targetTag, setTargetTag] = useState<Tag | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingTag(null);
    setForm(defaultForm);
    setFormOpen(true);
  }

  function openEdit(tag: Tag) {
    setEditingTag(tag);
    setForm({ name: tag.name, color: tag.color });
    setFormOpen(true);
  }

  function openDelete(tag: Tag) {
    setTargetTag(tag);
    setDeleteOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    startTransition(async () => {
      const result = editingTag
        ? await updateTagAction(editingTag.id, form)
        : await createTagAction(form);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingTag ? "Tag updated successfully" : "Tag created successfully");
        setFormOpen(false);
      }
    });
  }

  function handleDelete() {
    if (!targetTag) return;
    startTransition(async () => {
      const result = await deleteTagAction(targetTag.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Tag deleted successfully");
      }
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold font-heading md:text-3xl">Tag Management</h2>
        <Button onClick={openCreate} className="rounded-xl">Create Tag</Button>
      </div>

      <div className="rounded-xl border bg-card mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Color</th>
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th scope="col" className="text-right p-4 font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full inline-block shrink-0 border border-border"
                        style={{ backgroundColor: tag.color }}
                        aria-hidden="true"
                      />
                      <Badge
                        variant="secondary"
                        className="rounded-full text-xs"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{tag.name}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${tag.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(tag)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDelete(tag)}
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
              {tags.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No tags created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tag form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create Tag"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                className="rounded-xl"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? "var(--foreground)" : "transparent",
                    }}
                    onClick={() => setForm((f) => ({ ...f, color }))}
                    aria-label={`Select color ${color}`}
                    aria-pressed={form.color === color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 p-1 rounded-lg cursor-pointer"
                  aria-label="Custom color picker"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="rounded-xl font-mono text-sm flex-1"
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>
              {form.name && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground mr-2">Preview:</span>
                  <Badge
                    variant="secondary"
                    className="rounded-full"
                    style={{ backgroundColor: `${form.color}20`, color: form.color }}
                  >
                    {form.name}
                  </Badge>
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
        title="Delete Tag"
        description={`Are you sure you want to delete "${targetTag?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
