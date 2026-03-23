import { Skeleton } from "@/components/ui/skeleton";

export default function ClubDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
