import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function FileListSkeleton({ rows = 5, showAuthor = false }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Name</TableHead>
          {showAuthor && <TableHead>Author</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: rows }, (_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-md" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </TableCell>

            {showAuthor && (
              <TableCell>
                <Skeleton className="size-8 rounded-full" />
              </TableCell>
            )}

            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>

            <TableCell>
              <Skeleton className="size-8 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default FileListSkeleton;
