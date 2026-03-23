import { LeafSpinner } from "@/components/ui/leaf-spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LeafSpinner size="lg" />
    </div>
  );
}
