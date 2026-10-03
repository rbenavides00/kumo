import { Folder } from "lucide-react";

import ItemMenu from "@/components/files/ItemMenu";
import UserAvatar from "@/components/shared/UserAvatar";
import { Card } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/formatBytes";
import { formatFileName } from "@/utils/formatFileName";
import { getFileIcon } from "@/utils/getFileIcon";

const contentClass =
  "flex w-full flex-col items-center gap-3 px-4 pt-8 pb-5 text-center";

function ItemTile({ icon: Icon }) {
  return (
    <span className="flex size-14 items-center justify-center rounded-xl bg-muted">
      <Icon className="size-7" />
    </span>
  );
}

function ItemCard({ owner, showOwner, menu, className, children }) {
  return (
    <Card className={cn("group relative gap-0 py-0 transition-all", className)}>
      {showOwner && (
        <div className="absolute top-2 left-2 z-10">
          <UserAvatar user={owner} showDetails className="size-6" />
        </div>
      )}

      <div className="absolute top-2 right-2 z-10 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        {menu}
      </div>

      {children}
    </Card>
  );
}

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
  const showOwner = filter === "sharedWithMe";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {folders.map((folder) => (
        <ItemCard
          key={`folder-${folder.id}`}
          owner={folder.owner}
          showOwner={showOwner}
          className="hover:border-ring/50 hover:shadow-sm"
          menu={
            <ItemMenu
              itemType="folder"
              itemId={folder.id}
              name={folder.name}
              canEdit={canEdit}
              onRename={(name) => onRenameFolder(folder.id, name)}
              onDelete={() => onDeleteFolder(folder.id)}
            />
          }
        >
          <button
            type="button"
            onClick={() => onOpenFolder(folder.id)}
            className={cn(
              contentClass,
              "focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
          >
            <ItemTile icon={Folder} />

            <div className="w-full min-w-0">
              <p className="truncate font-medium mb-4">{folder.name}</p>
            </div>
          </button>
        </ItemCard>
      ))}

      {files.map((file) => (
        <ItemCard
          key={`file-${file.id}`}
          owner={file.owner}
          showOwner={showOwner}
          menu={
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
          }
        >
          <div className={contentClass}>
            <ItemTile icon={getFileIcon(file.extension)} />

            <div className="w-full min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
                {file.extension && (
                  <>
                    <span className="mx-1.5">|</span>
                    {file.extension}
                  </>
                )}
              </p>
            </div>
          </div>
        </ItemCard>
      ))}
    </div>
  );
}

export default FileGridView;
