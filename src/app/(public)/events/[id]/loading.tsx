import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <div className="space-y-2 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}
