function FileGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4"
        >
          <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />

          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default FileGridSkeleton;
