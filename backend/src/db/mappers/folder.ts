import type { FolderItem, User, ShareStatus } from "@kumo/shared";

import type { FolderRow } from "../../db/rows.js";
import { toIsoDate } from "./date.js";

export function toFolderItem(
  row: FolderRow,
  shareStatus: ShareStatus,
  owner: User | null = null,
): FolderItem {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    isPublic: Boolean(row.is_public),
    createdAt: toIsoDate(row.created_at),
    shareStatus,
    owner,
  };
}
