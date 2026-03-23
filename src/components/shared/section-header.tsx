import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  id?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  id,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        <h2 id={id} className="text-2xl font-bold font-heading md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
