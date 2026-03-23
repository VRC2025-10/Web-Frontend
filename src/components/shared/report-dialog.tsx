"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { submitReportAction } from "@/actions/report";
import { toast } from "sonner";
import type { ReportTargetType } from "@/lib/api/types";

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  triggerLabel?: string;
}

export function ReportDialog({
  targetType,
  targetId,
  triggerLabel,
}: ReportDialogProps) {
  const t = useTranslations("report");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (reason.trim().length < 10) return;

    startTransition(async () => {
      const result = await submitReportAction(targetType, targetId, reason);
      if (result.success) {
        toast.success(t("submitted"));
        setOpen(false);
        setReason("");
      } else {
        toast.error(result.error ?? t("error"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="w-4 h-4 mr-2" />
          {triggerLabel ?? t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="report-reason">{t("reasonLabel")}</Label>
            <Textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              maxLength={1000}
              rows={4}
              aria-describedby="report-reason-hint"
            />
            <p id="report-reason-hint" className="text-xs text-muted-foreground">
              {t("reasonHint", { min: 10, max: 1000, current: reason.length })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending || reason.trim().length < 10}
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
