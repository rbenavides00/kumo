import { useEffect, useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

function Pagination({
  page,
  totalPages,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}) {
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const startPage = Math.max(1, Math.min(page - 1, totalPages - 2));
  const pages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => startPage + i,
  );

  const commitPageInput = () => {
    const newPage = Number(pageInput);
    const isValid =
      Number.isInteger(newPage) && newPage >= 1 && newPage <= totalPages;

    if (!isValid) {
      setPageInput(String(page));
      return;
    }

    setPageInput(String(newPage));
    if (newPage !== page) onChangePage(newPage);
  };

  const handlePageSubmit = (event) => {
    event.preventDefault();
    commitPageInput();
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center sm:justify-between gap-0"
    >
      <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
        <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
          <span>Page</span>

          <Input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            onBlur={commitPageInput}
            aria-label="Page number"
            className="h-8 w-14 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />

          <span>of {totalPages}</span>
        </form>

        <span>|</span>

        <div className="flex items-center gap-2">
          <Label htmlFor="rows-per-page" className="font-normal">
            Rows per page
          </Label>

          <Select
            value={String(rowsPerPage)}
            onValueChange={(value) => onChangeRowsPerPage(Number(value))}
          >
            <SelectTrigger id="rows-per-page" size="sm" className="w-18">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {ROWS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="First page"
          disabled={page <= 1}
          onClick={() => onChangePage(1)}
        >
          <ChevronsLeft />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <ChevronLeft />
        </Button>

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "outline" : "ghost"}
            size="icon"
            className="size-8"
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onChangePage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          <ChevronRight />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Last page"
          disabled={page >= totalPages}
          onClick={() => onChangePage(totalPages)}
        >
          <ChevronsRight />
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
