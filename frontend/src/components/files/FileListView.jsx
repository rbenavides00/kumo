import { Folder } from "lucide-react";

import ItemMenu from "@/components/files/ItemMenu";
import UserAvatar from "@/components/shared/UserAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatBytes } from "@/utils/formatBytes";
import { formatDateMedium } from "@/utils/formatDate";
import { formatFileName } from "@/utils/formatFileName";
import { getFileIcon } from "@/utils/getFileIcon";

function ItemIcon({ icon: Icon }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon size={18} />
    </span>
  );
}

function AuthorCell({ owner }) {
  return (
    <TableCell>
      <UserAvatar user={owner} showDetails />
    </TableCell>
  );
}

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
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Name</TableHead>

          {showUploader && <TableHead>Author</TableHead>}

          <TableHead>Date</TableHead>

          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {folders.map((folder) => (
          <TableRow key={`folder-${folder.id}`}>
            <TableCell>
              <button
                type="button"
                onClick={() => onOpenFolder(folder.id)}
                className="flex w-full items-center gap-3"
              >
                <ItemIcon icon={Folder} />
                <span className="truncate font-medium">{folder.name}</span>
              </button>
            </TableCell>

            {showUploader && <AuthorCell owner={folder.owner} />}

            <TableCell className="text-muted-foreground">
              {formatDateMedium(folder.created_at)}
            </TableCell>

            <TableCell>
              <ItemMenu
                itemType="folder"
                itemId={folder.id}
                name={folder.name}
                canEdit={canEdit}
                onRename={(name) => onRenameFolder(folder.id, name)}
                onDelete={() => onDeleteFolder(folder.id)}
              />
            </TableCell>
          </TableRow>
        ))}

        {files.map((file) => (
          <TableRow key={`file-${file.id}`} className="hover:bg-transparent">
            <TableCell>
              <div className="flex gap-3">
                <ItemIcon icon={getFileIcon(file.extension)} />

                <div>
                  <span className="block truncate font-medium">
                    {file.name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatBytes(file.size)}
                    {file.extension && (
                      <>
                        <span className="mx-2">|</span>
                        {file.extension}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </TableCell>

            {showUploader && <AuthorCell owner={file.owner} />}

            <TableCell className="text-muted-foreground">
              {formatDateMedium(file.uploaded_at)}
            </TableCell>

            <TableCell>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default FileListView;
