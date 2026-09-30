import { Folder } from "lucide-react";

import { formatBytes } from "../../utils/formatBytes";
import { formatFileName } from "../../utils/formatFileName";
import { getFileIcon } from "../../utils/getFileIcon";

import ItemMenu from "./ItemMenu";
import UserAvatar from "../ui/UserAvatar";

function FileGridView({
  folders,
  files,
  filter,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
}) {
  const canEdit = filter === "myFiles";
  const showUploader = filter === "sharedWithMe";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {folders.map((folder) => (
        <div
          key={`folder-${folder.id}`}
          className="group relative rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          {showUploader && (
            <div className="absolute top-1 left-1 z-10">
              <UserAvatar user={folder.owner} size="xs" showDetails />
            </div>
          )}

          <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <ItemMenu
              itemType="folder"
              itemId={folder.id}
              name={folder.name}
              canEdit={canEdit}
              onRename={(name) => onRenameFolder(folder.id, name)}
              onDelete={() => onDeleteFolder(folder.id)}
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenFolder(folder.id)}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center transition-colors text-gray-800"
          >
            <Folder size={32} />
            <span className="w-full truncate text-sm font-medium">
              {folder.name}
            </span>
          </button>
        </div>
      ))}

      {files.map((file) => {
        const FileIcon = getFileIcon(file.extension);

        return (
          <div
            key={`file-${file.id}`}
            className="group relative flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center"
          >
            {showUploader && (
              <div className="absolute top-1 left-1 z-10">
                <UserAvatar user={file.owner} size="xs" showDetails />
              </div>
            )}

            <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <ItemMenu
                itemType="file"
                itemId={file.id}
                name={file.name}
                extension={file.extension}
                canEdit={canEdit}
                onRename={(name) => onRenameFile(file.id, name)}
                onDelete={() => onDeleteFile(file.id)}
                onDownload={() =>
                  onDownloadFile(
                    file.id,
                    formatFileName(file.name, file.extension),
                  )
                }
              />
            </div>

            <FileIcon size={32} className="text-gray-800" />
            <span className="w-full truncate text-sm font-medium text-gray-800">
              {file.name}
            </span>
            <span className="text-xs text-gray-400">
              {formatBytes(file.size)}
              {file.extension && (
                <>
                  <span className="mx-2">|</span>
                  {file.extension}
                </>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default FileGridView;
