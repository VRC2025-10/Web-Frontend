import { Skeleton } from "@/components/ui/skeleton";

export default function MemberDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col items-center text-center gap-6">
        <Skeleton className="w-32 h-32 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="mt-12 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
