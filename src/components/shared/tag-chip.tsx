"use client";

import { cn } from "@/lib/utils";

interface TagChipProps {
  name: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function TagChip({
  name,
  color,
  onClick,
  isActive,
  className,
}: TagChipProps) {
  const baseClasses = cn(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-150",
    isActive ? "opacity-100 ring-2 ring-ring ring-offset-1" : "opacity-80",
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isActive ?? false}
        onClick={onClick}
        className={cn(baseClasses, "cursor-pointer hover:opacity-100")}
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {name}
      </button>
    );
  }

  return (
    <span
      className={baseClasses}
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {name}
    </span>
  );
}
