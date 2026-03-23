import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
  className?: string;
}

function buildUrl(
  baseUrl: string,
  page: number,
  searchParams?: Record<string, string>
) {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `${baseUrl}?${params.toString()}`;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers(currentPage, totalPages);

  const linkClasses =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav aria-label="Pagination" className={cn("flex justify-center", className)}>
      <ul className="flex items-center gap-1">
        <li>
          {currentPage > 1 ? (
            <Link
              href={buildUrl(baseUrl, currentPage - 1, searchParams)}
              className={linkClasses}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span
              className={cn(linkClasses, "pointer-events-none opacity-50")}
              aria-disabled="true"
            >
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
        </li>

        {pages.map((page, index) => (
          <li key={typeof page === "number" ? page : `ellipsis-${index}`}>
            {page === "ellipsis" ? (
              <span className="inline-flex h-10 w-10 items-center justify-center text-sm text-muted-foreground">
                &hellip;
              </span>
            ) : page === currentPage ? (
              <span
                aria-current="page"
                className={cn(
                  linkClasses,
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                {page}
              </span>
            ) : (
              <Link
                href={buildUrl(baseUrl, page, searchParams)}
                className={linkClasses}
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={buildUrl(baseUrl, currentPage + 1, searchParams)}
              className={linkClasses}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span
              className={cn(linkClasses, "pointer-events-none opacity-50")}
              aria-disabled="true"
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
