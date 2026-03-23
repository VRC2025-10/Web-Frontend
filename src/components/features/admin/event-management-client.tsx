"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { createEventAction, updateEventAction, deleteEventAction } from "@/actions/admin";
import { formatDate } from "@/lib/date";
import type { PublicEvent, EventStatus } from "@/lib/api/types";

const statusColor: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  archived: "bg-muted text-muted-foreground",
};

interface EventManagementClientProps {
  events: PublicEvent[];
}

const defaultForm = {
  title: "",
  description_markdown: "",
  start_time: "",
  end_time: "",
  location: "",
  event_status: "draft" as EventStatus,
};

export function EventManagementClient({ events }: EventManagementClientProps) {
  const locale = useLocale();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PublicEvent | null>(null);
  const [targetEvent, setTargetEvent] = useState<PublicEvent | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingEvent(null);
    setForm(defaultForm);
    setFormOpen(true);
  }

  function openEdit(event: PublicEvent) {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description_markdown: event.description_markdown,
      start_time: event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : "",
      end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : "",
      location: event.location ?? "",
      event_status: event.event_status,
    });
    setFormOpen(true);
  }

  function openDelete(event: PublicEvent) {
    setTargetEvent(event);
    setDeleteOpen(true);
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.start_time) {
      toast.error("Title and start time are required");
      return;
    }

    startTransition(async () => {
      const data = {
        title: form.title,
        description_markdown: form.description_markdown,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
        location: form.location || undefined,
        event_status: form.event_status,
      };

      const result = editingEvent
        ? await updateEventAction(editingEvent.id, data)
        : await createEventAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingEvent ? "Event updated successfully" : "Event created successfully");
        setFormOpen(false);
      }
    });
  }

  function handleDelete() {
    if (!targetEvent) return;
    startTransition(async () => {
      const result = await deleteEventAction(targetEvent.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Event deleted successfully");
      }
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold font-heading md:text-3xl">Event Management</h2>
        <Button onClick={openCreate} className="rounded-xl">Create Event</Button>
      </div>

      <div className="rounded-xl border bg-card mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Title</th>
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Tags</th>
                <th scope="col" className="text-right p-4 font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4 font-medium">{event.title}</td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(event.start_time, locale)}
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className={`rounded-full ${statusColor[event.event_status] ?? ""}`}>
                      {event.event_status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {event.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="rounded-full text-xs" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${event.title}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(event)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDelete(event)}
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
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No events created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-xl max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                className="rounded-xl"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-desc">Description</Label>
              <Textarea
                id="event-desc"
                className="rounded-xl min-h-[100px]"
                value={form.description_markdown}
                onChange={(e) => setForm((f) => ({ ...f, description_markdown: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-start">Start Time</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  className="rounded-xl"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-end">End Time</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  className="rounded-xl"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                className="rounded-xl"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-status">Status</Label>
              <Select
                value={form.event_status}
                onValueChange={(v) => setForm((f) => ({ ...f, event_status: v as EventStatus }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
        title="Delete Event"
        description={`Are you sure you want to delete "${targetEvent?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
