import { useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

function Pagination({
  page,
  totalPages,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}) {
  const [pageInput, setPageInput] = useState(String(page));

  const startPage = Math.max(1, Math.min(page - 1, totalPages - 2));
  const pages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => startPage + i,
  );

  const handlePageSubmit = (event) => {
    event.preventDefault();

    const newPage = Number(pageInput);

    if (newPage >= 1 && newPage <= totalPages) {
      onChangePage(newPage);
    } else {
      setPageInput(String(page));
    }
  };

  return (
    <div className="flex items-center justify-center pt-2 sm:justify-between">
      <div className="items-center gap-3 text-sm text-gray-500 hidden sm:flex">
        <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
          <span>Page</span>

          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            onBlur={handlePageSubmit}
            className="w-8 rounded-md border border-gray-200 px-1 py-1 text-center text-sm outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />

          <span>of {totalPages}</span>
        </form>

        <span>|</span>

        <label className="flex items-center gap-2">
          <span>Rows per page</span>

          <select
            value={rowsPerPage}
            onChange={(event) =>
              onChangeRowsPerPage(Number(event.target.value))
            }
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-gray-400"
          >
            {ROWS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChangePage(1)}
          disabled={page <= 1}
          aria-label="First page"
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => onChangePage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onChangePage(pageNumber)}
            className={`min-w-8 rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer ${
              pageNumber === page
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onChangePage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          onClick={() => onChangePage(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
