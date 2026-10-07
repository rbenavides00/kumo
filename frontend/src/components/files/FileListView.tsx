import { format } from "date-fns";
import { Folder, type LucideIcon } from "lucide-react";

import type { ContentFilter, FileItem, FolderItem, User } from "@kumo/shared";

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
import { formatFileName } from "@/utils/formatFileName";
import { CATEGORY_META } from "@/utils/fileCategories";

type ItemIconProps = {
  icon: LucideIcon;
};

type AuthorCellProps = {
  owner: User | null;
};

type FileListViewProps = {
  filter: ContentFilter;
  folders: FolderItem[];
  files: FileItem[];
  onOpenFolder: (folderId: number) => void;
  onRenameFolder: (folderId: number, name: string) => Promise<void>;
  onDeleteFolder: (folderId: number) => Promise<void>;
  onRenameFile: (fileId: number, name: string) => Promise<void>;
  onDeleteFile: (fileId: number) => Promise<void>;
  onDownloadFile: (fileId: number, fileName: string) => void;
};

function ItemIcon({ icon: Icon }: ItemIconProps) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon size={18} />
    </span>
  );
}

function AuthorCell({ owner }: AuthorCellProps) {
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
}: FileListViewProps) {
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
              {format(new Date(folder.createdAt), "MMM d, yyyy")}
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

        {files.map((file) => {
          const { icon: FileIcon } = CATEGORY_META[file.category];

          return (
            <TableRow key={`file-${file.id}`} className="hover:bg-transparent">
              <TableCell>
                <div className="flex gap-3">
                  <ItemIcon icon={FileIcon} />

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
                {format(new Date(file.uploadedAt), "MMM d, yyyy")}
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
          );
        })}
      </TableBody>
    </Table>
  );
}

export default FileListView;
