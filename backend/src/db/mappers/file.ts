import type { FileItem, User, ShareStatus } from "@kumo/shared";

import type { FileListRow } from "../../db/rows.js";
import { toIsoDate } from "./date.js";

export function toFileItem(
  row: FileListRow,
  shareStatus: ShareStatus,
  owner: User | null = null,
): FileItem {
  return {
    id: row.id,
    name: row.name,
    extension: row.extension,
    size: row.size,
    isPublic: Boolean(row.is_public),
    folderId: row.folder_id,
    uploadedAt: toIsoDate(row.uploaded_at),
    shareStatus,
    owner,
  };
}
