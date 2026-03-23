import { cn } from "@/lib/utils";

interface LeafSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function LeafSpinner({ className, size = "md" }: LeafSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label="Loading"
    >
      <svg
        className={cn("animate-spin-leaf text-primary", sizeMap[size])}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20 2C14 6 4 16 6 28C8 34 14 38 20 38C26 38 32 34 34 28C36 16 26 6 20 2Z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M20 8C20 8 20 28 20 36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M12 18C12 18 20 20 28 16"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  );
}
