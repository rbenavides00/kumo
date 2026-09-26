import { Folder } from "lucide-react";

import { formatBytes } from "../../utils/formatBytes";
import { formatDateLong, formatDateMedium } from "../../utils/formatDate";
import { formatFileName } from "../../utils/formatFileName";
import { getFileIcon } from "../../utils/getFileIcon";

import ItemMenu from "./ItemMenu";
import UploaderAvatar from "./UploaderAvatar";

function FileListView({
  filter,
  folders,
  files,
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
    <div className="rounded-xl border border-gray-200">
      <table className="w-full table-fixed">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="rounded-tl-xl w-auto px-3 py-2 text-left text-xs font-medium text-gray-500 sm:px-4">
              Name
            </th>

            {showUploader && (
              <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 sm:w-24 sm:px-4">
                Author
              </th>
            )}

            <th className="w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 sm:w-30 sm:px-4">
              Date
            </th>

            <th className="w-20 px-3 py-2 text-right text-xs font-medium text-gray-500 sm:w-24 sm:px-4">
              Size
            </th>

            <th className="rounded-tr-xl w-10 sm:w-12" />
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {folders.map((folder) => (
            <tr key={`folder-${folder.id}`} className="hover:bg-gray-50">
              <td className="min-w-0 px-3 py-2 sm:px-4">
                <button
                  type="button"
                  onClick={() => onOpenFolder(folder.id)}
                  className="flex min-w-0 w-full items-center gap-2 text-left text-sm text-gray-800 sm:gap-3"
                >
                  <Folder size={18} className="shrink-0 text-gray-400" />

                  <span className="min-w-0 truncate">{folder.name}</span>
                </button>
              </td>

              {showUploader && (
                <td className="px-3 py-2 text-center sm:px-4">
                  <UploaderAvatar owner={folder.owner} />
                </td>
              )}

              <td className="px-3 py-3 text-left text-sm text-gray-400 sm:px-4">
                {formatDateMedium(folder.created_at)}
              </td>

              <td className="px-3 py-2 text-right text-sm text-gray-400 sm:px-4">
                —
              </td>

              <td className="px-2 py-2 sm:px-4">
                <ItemMenu
                  name={folder.name}
                  canEdit={canEdit}
                  onRename={(name) => onRenameFolder(folder.id, name)}
                  onDelete={() => onDeleteFolder(folder.id)}
                />
              </td>
            </tr>
          ))}

          {files.map((file) => {
            const FileIcon = getFileIcon(file.extension);

            return (
              <tr key={`file-${file.id}`}>
                <td className="min-w-0 px-3 py-3 sm:px-4">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-gray-800 sm:gap-3">
                    <FileIcon size={18} className="shrink-0 text-gray-400" />

                    <span className="min-w-0 truncate">
                      {formatFileName(file.name, file.extension)}
                    </span>
                  </span>
                </td>

                {showUploader && (
                  <td className="px-3 py-3 text-center sm:px-4">
                    <UploaderAvatar owner={file.owner} />
                  </td>
                )}

                <td className="px-3 py-3 text-left text-sm text-gray-400 sm:px-4">
                  {formatDateMedium(file.uploaded_at)}
                </td>

                <td className="px-3 py-3 text-right text-sm text-gray-400 sm:px-4">
                  {formatBytes(file.size)}
                </td>

                <td className="px-2 py-2 sm:px-4">
                  <ItemMenu
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FileListView;
