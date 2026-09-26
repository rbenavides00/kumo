import { useState } from "react";
import { FolderPlus, LayoutGrid, List, Upload } from "lucide-react";

import PromptModal from "../ui/PromptModal";

function FilesToolbar({
  viewMode,
  onChangeViewMode,
  filter,
  onChangeFilter,
  onUploadClick,
  onCreateFolder,
  isUploading,
}) {
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-gray-300 p-1">
          <button
            type="button"
            onClick={() => onChangeFilter("myFiles")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer ${
              filter === "myFiles"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            My files
          </button>
          <button
            type="button"
            onClick={() => onChangeFilter("sharedWithMe")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer ${
              filter === "sharedWithMe"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Shared with me
          </button>
        </div>

        {filter === "myFiles" && (
          <>
            <button
              type="button"
              onClick={onUploadClick}
              disabled={isUploading}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              <Upload size={16} />
              {isUploading ? "Uploading..." : "Upload file"}
            </button>

            <button
              type="button"
              onClick={() => setIsNewFolderModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FolderPlus size={16} />
              New folder
            </button>
          </>
        )}
      </div>

      <div className="flex items-center rounded-lg border border-gray-300 p-1">
        <button
          type="button"
          onClick={() => onChangeViewMode("list")}
          aria-label="List view"
          className={`rounded-md p-1.5 transition-colors cursor-pointer ${
            viewMode === "list"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => onChangeViewMode("grid")}
          aria-label="Grid view"
          className={`rounded-md p-1.5 transition-colors cursor-pointer ${
            viewMode === "grid"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <LayoutGrid size={16} />
        </button>
      </div>

      <PromptModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onSubmit={onCreateFolder}
        title="New folder"
        placeholder="Folder name"
        submitLabel="Create"
        validate={(value) => (!value ? "Folder name is required" : null)}
      />
    </div>
  );
}

export default FilesToolbar;
