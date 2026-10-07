import type { ItemType, User, ShareSettings, ShareStatus } from "@kumo/shared";

import db from "../db/database.js";
import type { PublicUserRow } from "../db/rows.js";
import { toPublicUser } from "../db/mappers/user.js";

interface ShareItem {
  id: number;
  is_public: number;
}

function shareColumn(itemType: ItemType): "folder_id" | "file_id" {
  return itemType === "folder" ? "folder_id" : "file_id";
}

function findUserByUsername(
  username: string,
): Pick<PublicUserRow, "id" | "username"> | undefined {
  return db
    .prepare("SELECT id, username FROM users WHERE username = ?")
    .get(username) as Pick<PublicUserRow, "id" | "username"> | undefined;
}

function addShare(itemType: ItemType, itemId: number, userId: number) {
  return db
    .prepare(
      `INSERT INTO shares (${shareColumn(itemType)}, shared_with_user_id) VALUES (?, ?)`,
    )
    .run(itemId, userId);
}

function removeShare(itemType: ItemType, itemId: number, userId: number) {
  return db
    .prepare(
      `DELETE FROM shares WHERE ${shareColumn(itemType)} = ? AND shared_with_user_id = ?`,
    )
    .run(itemId, userId);
}

function listShares(itemType: ItemType, itemId: number): User[] {
  const rows = db
    .prepare(
      `
        SELECT
          users.id,
          users.username,
          users.first_name,
          users.last_name,
          users.avatar_path
        FROM shares
        JOIN users ON users.id = shares.shared_with_user_id
        WHERE shares.${shareColumn(itemType)} = ?
      `,
    )
    .all(itemId) as PublicUserRow[];

  return rows.map(toPublicUser);
}

function getShareStatus(itemType: ItemType, item: ShareItem): ShareStatus {
  if (item.is_public) {
    return "public";
  }

  const hasShares = db
    .prepare(`SELECT 1 FROM shares WHERE ${shareColumn(itemType)} = ? LIMIT 1`)
    .get(item.id);

  return hasShares ? "shared" : "private";
}

function getShareSettings(itemType: ItemType, item: ShareItem): ShareSettings {
  return {
    isPublic: Boolean(item.is_public),
    status: getShareStatus(itemType, item),
    sharedWith: listShares(itemType, item.id),
  };
}

export {
  shareColumn,
  findUserByUsername,
  addShare,
  removeShare,
  listShares,
  getShareStatus,
  getShareSettings,
};
