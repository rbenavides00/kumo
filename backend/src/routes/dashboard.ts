import { Router } from "express";
import type {
  CategoryStat,
  DashboardData,
  DashboardFile,
  FileCategory,
  ShareStatus,
  User,
} from "@kumo/shared";

import db from "../db/database.js";
import type { FileListRow, PublicUserRow } from "../db/rows.js";
import { toFileItem } from "../db/mappers/file.js";
import { toPublicUser } from "../db/mappers/user.js";
import authMiddleware from "../middleware/auth.js";
import { STORAGE_QUOTA_BYTES } from "../config.js";
import { getFileCategory } from "../utils/fileCategories.js";
import { getShareStatus } from "../utils/shares.js";
import { getUsedStorage } from "../utils/storage.js";

const router = Router();

const LIST_LIMIT = 5;

const OWN_FILES_SQL = `
  SELECT id, owner_id, folder_id, name, extension, size, is_public, uploaded_at
  FROM files
  WHERE owner_id = ?
`;

type SharedWithMeRow = FileListRow &
  Pick<PublicUserRow, "username" | "first_name" | "last_name" | "avatar_path">;

function toOwnFile(row: FileListRow): DashboardFile {
  const status = getShareStatus("file", {
    id: row.id,
    is_public: row.is_public,
  });

  return {
    ...toFileItem(row, status),
    category: getFileCategory(row.extension),
  };
}

function toSharedFile(row: SharedWithMeRow): DashboardFile {
  const owner: User = toPublicUser({
    id: row.owner_id,
    username: row.username,
    first_name: row.first_name,
    last_name: row.last_name,
    avatar_path: row.avatar_path,
  });

  const status: ShareStatus = row.is_public ? "public" : "shared";

  return {
    ...toFileItem(row, status, owner),
    category: getFileCategory(row.extension),
  };
}

router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id;

  // Files grouped by category
  const extensionRows = db
    .prepare(
      `
        SELECT lower(extension) AS extension, COUNT(*) AS count, SUM(size) AS size
        FROM files
        WHERE owner_id = ?
        GROUP BY lower(extension)
      `,
    )
    .all(userId) as { extension: string; count: number; size: number }[];

  const byCategory = new Map<FileCategory, CategoryStat>();

  for (const row of extensionRows) {
    const category = getFileCategory(row.extension);
    const current = byCategory.get(category) ?? { category, count: 0, size: 0 };

    current.count += row.count;
    current.size += row.size;
    byCategory.set(category, current);
  }

  const categories = [...byCategory.values()].sort((a, b) => b.count - a.count);

  // Own files grouped by sharing status
  const sharingRow = db
    .prepare(
      `
        SELECT
          COALESCE(SUM(is_public = 1), 0) AS public,
          COALESCE(SUM(is_public = 0 AND EXISTS (
            SELECT 1 FROM shares WHERE shares.file_id = files.id
          )), 0) AS shared,
          COALESCE(SUM(is_public = 0 AND NOT EXISTS (
            SELECT 1 FROM shares WHERE shares.file_id = files.id
          )), 0) AS private
        FROM files
        WHERE owner_id = ?
      `,
    )
    .get(userId) as Record<ShareStatus, number>;

  const recentFiles = (
    db
      .prepare(`${OWN_FILES_SQL} ORDER BY uploaded_at DESC, id DESC LIMIT ?`)
      .all(userId, LIST_LIMIT) as FileListRow[]
  ).map(toOwnFile);

  const largestFiles = (
    db
      .prepare(`${OWN_FILES_SQL} ORDER BY size DESC, id DESC LIMIT ?`)
      .all(userId, LIST_LIMIT) as FileListRow[]
  ).map(toOwnFile);

  // Files from other users that are public or shared directly with me
  const sharedWithMe = (
    db
      .prepare(
        `
          SELECT
            f.id, f.owner_id, f.folder_id, f.name, f.extension, f.size,
            f.is_public, f.uploaded_at,
            u.username, u.first_name, u.last_name, u.avatar_path
          FROM files f
          JOIN users u ON u.id = f.owner_id
          LEFT JOIN shares s
            ON s.file_id = f.id AND s.shared_with_user_id = ?
          WHERE f.owner_id != ?
            AND (f.is_public = 1 OR s.id IS NOT NULL)
          ORDER BY COALESCE(s.created_at, f.uploaded_at) DESC, f.id DESC
          LIMIT ?
        `,
      )
      .all(userId, userId, LIST_LIMIT) as SharedWithMeRow[]
  ).map(toSharedFile);

  const data: DashboardData = {
    storage: { used: getUsedStorage(userId), quota: STORAGE_QUOTA_BYTES },
    categories,
    sharing: {
      public: sharingRow.public,
      shared: sharingRow.shared,
      private: sharingRow.private,
    },
    recentFiles,
    largestFiles,
    sharedWithMe,
  };

  res.json(data);
});

export default router;
