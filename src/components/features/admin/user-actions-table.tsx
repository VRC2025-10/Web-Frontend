"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { MoreHorizontal, Eye, ShieldCheck, Ban, CheckCircle } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/features/admin/confirmation-dialog";
import { changeUserRoleAction, changeUserStatusAction } from "@/actions/admin";
import { formatDate } from "@/lib/date";
import type { AdminUser, UserRole } from "@/lib/api/types";

const roleBadgeColor: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive",
  admin: "bg-primary/10 text-primary",
  staff: "bg-accent/20 text-accent-foreground",
  member: "bg-muted text-muted-foreground",
};

const assignableRoles: UserRole[] = ["member", "staff", "admin"];

interface UserActionsTableProps {
  users: AdminUser[];
}

export function UserActionsTable({ users }: UserActionsTableProps) {
  const locale = useLocale();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");
  const [isPending, startTransition] = useTransition();

  function openRoleDialog(user: AdminUser) {
    setTargetUser(user);
    setSelectedRole(user.role);
    setRoleDialogOpen(true);
  }

  function openSuspendDialog(user: AdminUser) {
    setTargetUser(user);
    setSuspendDialogOpen(true);
  }

  function openActivateDialog(user: AdminUser) {
    setTargetUser(user);
    setActivateDialogOpen(true);
  }

  function handleRoleChange() {
    if (!targetUser) return;
    startTransition(async () => {
      const result = await changeUserRoleAction(targetUser.id, selectedRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Role updated successfully");
      }
      setRoleDialogOpen(false);
    });
  }

  function handleSuspend() {
    if (!targetUser) return;
    startTransition(async () => {
      const result = await changeUserStatusAction(targetUser.id, "suspended");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User suspended");
      }
      setSuspendDialogOpen(false);
    });
  }

  function handleActivate() {
    if (!targetUser) return;
    startTransition(async () => {
      const result = await changeUserStatusAction(targetUser.id, "active");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User activated");
      }
      setActivateDialogOpen(false);
    });
  }

  function getUserName(user: AdminUser): string {
    const displayName = user.discord_username?.trim();
    return displayName && displayName.length > 0 ? displayName : "Unknown user";
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">User</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Role</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Joined</th>
              <th scope="col" className="text-right p-4 font-medium text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border/50 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback>{getUserName(user).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{getUserName(user)}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="secondary" className={`rounded-full ${roleBadgeColor[user.role] ?? ""}`}>
                    {user.role}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge
                    variant={user.status === "active" ? "secondary" : "destructive"}
                    className="rounded-full"
                  >
                    {user.status}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground">
                  {formatDate(user.created_at, locale)}
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Actions for ${getUserName(user)}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem asChild>
                        <Link href={`/members/${user.discord_id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      {user.status === "active" ? (
                        <DropdownMenuItem
                          onClick={() => openSuspendDialog(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => openActivateDialog(user)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Role change dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Select a new role for {targetUser ? getUserName(targetUser) : ""}.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isPending}>
              {isPending ? "…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend confirmation */}
      <ConfirmationDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        title="Suspend User"
        description={`Are you sure? ${targetUser ? getUserName(targetUser) : "This user"} will lose access.`}
        confirmLabel="Suspend"
        variant="destructive"
        loading={isPending}
        onConfirm={handleSuspend}
      />

      {/* Activate confirmation */}
      <ConfirmationDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Activate User"
        description={`This will restore ${targetUser ? getUserName(targetUser) : "this user"}'s access.`}
        confirmLabel="Activate"
        loading={isPending}
        onConfirm={handleActivate}
      />
    </>
  );
}
