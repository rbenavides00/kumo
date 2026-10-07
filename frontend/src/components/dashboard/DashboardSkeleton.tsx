import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default DashboardSkeleton;
