import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-full max-w-md mt-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 p-6 text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-5 w-2/3 mx-auto mt-4" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
