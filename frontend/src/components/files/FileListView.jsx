import { Folder } from "lucide-react";

import { formatBytes } from "../../utils/formatBytes";
import { formatDateLong } from "../../utils/formatDate";
import { formatFileName } from "../../utils/formatFileName";
import { getFileIcon } from "../../utils/getFileIcon";

import ItemMenu from "./ItemMenu";

function FileListView({
  folders,
  files,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
}) {
  return (
    <div className="rounded-xl border border-gray-200">
      <table className="w-full table-fixed">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="rounded-tl-xl w-auto px-3 py-2 text-left text-xs font-medium text-gray-500 sm:px-4">
              Name
            </th>

            <th className="w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 sm:w-48 sm:px-4">
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

              <td className="px-3 py-3 text-left text-sm text-gray-400 sm:px-4">
                {formatDateLong(folder.created_at)}
              </td>

              <td className="px-3 py-2 text-right text-sm text-gray-400 sm:px-4">
                —
              </td>

              <td className="px-2 py-2 sm:px-4">
                <ItemMenu
                  itemName={folder.name}
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
                      {file.extension
                        ? `${file.name}.${file.extension}`
                        : file.name}
                    </span>
                  </span>
                </td>

                <td className="px-3 py-3 text-left text-sm text-gray-400 sm:px-4">
                  {formatDateLong(file.uploaded_at)}
                </td>

                <td className="px-3 py-3 text-right text-sm text-gray-400 sm:px-4">
                  {formatBytes(file.size)}
                </td>

                <td className="px-2 py-2 sm:px-4">
                  <ItemMenu
                    name={file.name}
                    extension={file.extension}
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
