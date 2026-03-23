"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { MoreHorizontal, Eye, FileText, CheckCircle, XCircle, User, Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { resolveReportAction } from "@/actions/admin";
import { formatDate } from "@/lib/date";
import type { AdminReport } from "@/lib/api/types";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  dismissed: "bg-muted text-muted-foreground",
};

const targetIcon: Record<string, typeof User> = {
  profile: User,
  event: Calendar,
};

interface ReportActionsTableProps {
  reports: AdminReport[];
}

export function ReportActionsTable({ reports }: ReportActionsTableProps) {
  const locale = useLocale();
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [targetReport, setTargetReport] = useState<AdminReport | null>(null);
  const [isPending, startTransition] = useTransition();

  function openReasonDialog(report: AdminReport) {
    setTargetReport(report);
    setReasonDialogOpen(true);
  }

  function openResolveDialog(report: AdminReport) {
    setTargetReport(report);
    setResolveDialogOpen(true);
  }

  function openDismissDialog(report: AdminReport) {
    setTargetReport(report);
    setDismissDialogOpen(true);
  }

  function handleResolve() {
    if (!targetReport) return;
    startTransition(async () => {
      const result = await resolveReportAction(targetReport.id, "resolved");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Report resolved");
      }
      setResolveDialogOpen(false);
    });
  }

  function handleDismiss() {
    if (!targetReport) return;
    startTransition(async () => {
      const result = await resolveReportAction(targetReport.id, "dismissed");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Report dismissed");
      }
      setDismissDialogOpen(false);
    });
  }

  function getTargetLink(report: AdminReport) {
    return report.target_type === "profile"
      ? `/members/${report.target_id}`
      : `/events/${report.target_id}`;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Reporter</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Target</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Reason</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Date</th>
              <th scope="col" className="text-right p-4 font-medium text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const TargetIcon = targetIcon[report.target_type] ?? FileText;
              return (
                <tr key={report.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4 font-medium">{report.reporter_username}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TargetIcon className="h-4 w-4" />
                      <span>{report.target_type}</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs truncate">{report.reason}</td>
                  <td className="p-4">
                    <Badge variant="secondary" className={`rounded-full ${statusColor[report.status] ?? ""}`}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(report.created_at, locale)}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Actions for report by ${report.reporter_username}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem asChild>
                          <Link href={getTargetLink(report)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Target
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openReasonDialog(report)}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Reason
                        </DropdownMenuItem>
                        {report.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => openResolveDialog(report)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDismissDialog(report)}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Dismiss
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View full reason dialog */}
      <Dialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <DialogContent className="rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle>Report Reason</DialogTitle>
          </DialogHeader>
          <p className="text-sm whitespace-pre-wrap">{targetReport?.reason}</p>
        </DialogContent>
      </Dialog>

      {/* Resolve confirmation */}
      <ConfirmationDialog
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
        title="Resolve Report"
        description="Mark this report as resolved."
        confirmLabel="Resolve"
        loading={isPending}
        onConfirm={handleResolve}
      />

      {/* Dismiss confirmation */}
      <ConfirmationDialog
        open={dismissDialogOpen}
        onOpenChange={setDismissDialogOpen}
        title="Dismiss Report"
        description="Dismiss this report without action."
        confirmLabel="Dismiss"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDismiss}
      />
    </>
  );
}
