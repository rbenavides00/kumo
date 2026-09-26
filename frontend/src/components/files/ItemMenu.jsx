import { useState } from "react";
import { Download, MoreVertical, Pencil, Trash2 } from "lucide-react";

import PromptModal from "../ui/PromptModal";
import ConfirmModal from "../ui/ConfirmModal";

// TODO: Change position if menu is too low on the screen
function ItemMenu({
  name,
  extension,
  canEdit = true,
  onRename,
  onDelete,
  onDownload,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fullName = extension ? `${name}.${extension}` : name;

  if (!canEdit && !onDownload) return null;

  return (
    <div className="relative text-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen((prev) => !prev);
        }}
        className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <MoreVertical size={16} />
      </button>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {onDownload && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onDownload();
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-100"
              >
                <Download size={14} />
                Download
              </button>
            )}

            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsRenameModalOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <Pencil size={14} />
                  Rename
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}

      {canEdit && (
        <>
          <PromptModal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            onSubmit={onRename}
            title="Rename item"
            placeholder="New name"
            initialValue={name}
            suffix={extension ? `.${extension}` : undefined}
            submitLabel="Rename"
            validate={(value) => (!value ? "Item name is required" : null)}
          />
          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={onDelete}
            title="Delete"
            message={
              <>
                Are you sure you want to delete <strong>{fullName}</strong>?
                This can't be undone.
              </>
            }
            confirmLabel="Delete"
            isDestructive
          />
        </>
      )}
    </div>
  );
}

export default ItemMenu;
