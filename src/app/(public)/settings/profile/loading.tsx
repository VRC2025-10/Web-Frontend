import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";

export default function ProfileEditorLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Card className="rounded-2xl p-4 md:rounded-[2rem] md:p-8">
        <CardHeader className="px-0 pt-0">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>

        <div className="space-y-8">
          {/* Name (read-only) */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-3 w-36" />
          </div>

          {/* VRC ID */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Short Bio */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Bio (Markdown) */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-36 rounded-xl" />
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <Skeleton className="h-3 w-48" />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>

          {/* X (Twitter) */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Submit */}
          <div className="flex justify-end border-t pt-6 max-md:justify-stretch">
            <Skeleton className="h-10 w-32 rounded-full max-md:w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
}
