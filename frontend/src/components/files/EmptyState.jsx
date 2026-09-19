import { FolderOpen } from "lucide-react";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-12 text-center">
      <FolderOpen size={32} className="text-gray-300" />
      <h3 className="mt-3 text-sm font-medium text-gray-800">
        This folder is empty
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Upload a file or create a folder to get started.
      </p>
    </div>
  );
}

export default EmptyState;
