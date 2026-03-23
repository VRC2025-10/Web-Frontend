import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 text-center",
        className
      )}
    >
      <Icon className="h-16 w-16 text-muted-foreground/50" strokeWidth={1.5} />
      <p className="text-lg text-muted-foreground">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
