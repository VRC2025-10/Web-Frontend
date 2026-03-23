import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  hint?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn(
      "rounded-2xl border border-border/60 bg-card p-6 shadow-sm",
      className,
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className={cn("rounded-xl bg-primary/10 p-3 text-primary", iconClassName)}>
          <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
        </div>
        <dl>
          <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </dd>
          {hint && <dd className="mt-2 text-sm text-muted-foreground">{hint}</dd>}
        </dl>
      </div>
    </Card>
  );
}
