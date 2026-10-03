import { useState } from "react";
import { Download, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PromptDialog from "@/components/shared/PromptDialog";
import ShareModal from "@/components/files/ShareDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function ItemMenu({
  itemType,
  itemId,
  name,
  extension,
  canEdit = true,
  onRename,
  onDelete,
  onDownload,
}) {
  const [dialog, setDialog] = useState(null);
  const closeDialog = () => setDialog(null);

  const fullName = extension ? `${name}.${extension}` : name;

  if (!canEdit && !onDownload) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={`Actions for ${fullName}`}
            />
          }
        >
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {onDownload && (
            <DropdownMenuItem onClick={onDownload}>
              <Download />
              Download
            </DropdownMenuItem>
          )}

          {canEdit && (
            <>
              <DropdownMenuItem onClick={() => setDialog("rename")}>
                <Pencil />
                Rename
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setDialog("share")}>
                <Share2 />
                Share
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDialog("delete")}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canEdit && (
        <>
          <PromptDialog
            isOpen={dialog === "rename"}
            onClose={closeDialog}
            onSubmit={onRename}
            title="Rename item"
            placeholder="New name"
            initialValue={name}
            suffix={extension ? `.${extension}` : undefined}
            submitLabel="Rename"
            validate={(value) => (!value ? "Item name is required" : null)}
          />

          <ShareModal
            isOpen={dialog === "share"}
            onClose={closeDialog}
            itemType={itemType}
            itemId={itemId}
            itemName={fullName}
          />

          <ConfirmDialog
            isOpen={dialog === "delete"}
            onClose={closeDialog}
            onConfirm={onDelete}
            title="Delete"
            message={
              <>
                Are you sure you want to delete <strong>{fullName}</strong>?
                This can't be undone.
              </>
            }
            confirmLabel="Delete"
            variant="destructive"
          />
        </>
      )}
    </>
  );
}

export default ItemMenu;
