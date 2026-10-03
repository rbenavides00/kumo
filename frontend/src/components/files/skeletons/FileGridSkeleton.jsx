import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function FileGridSkeleton({ items = 10 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: items }, (_, index) => (
        <Card key={index} className="gap-0 py-0">
          <div className="flex w-full flex-col items-center gap-3 px-4 pt-8 pb-5">
            <Skeleton className="size-14 rounded-xl" />

            <div className="flex w-full flex-col items-center gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default FileGridSkeleton;
