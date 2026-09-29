function FileListSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200">
      <table className="w-full table-fixed">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="w-auto px-3 py-2 sm:px-4">
              <div className="h-4 w-10 animate-pulse rounded bg-gray-300" />
            </th>

            <th className="w-20 px-3 py-2 sm:w-30 sm:px-4">
              <div className="h-4 w-10 animate-pulse rounded bg-gray-300" />
            </th>

            <th className="w-10 sm:w-12" />
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              <td className="px-3 py-3 sm:px-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-md bg-gray-100" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-30 animate-pulse rounded bg-gray-200 truncate" />
                    <div className="h-2 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              </td>

              <td className="px-3 py-3 sm:px-4">
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              </td>

              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileListSkeleton;
