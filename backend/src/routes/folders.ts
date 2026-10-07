import { Router, type Request, type Response } from "express";
import type { CreatedFolder, FolderContents, User } from "@kumo/shared";

import db from "../db/database.js";
import type { FileListRow, FolderRow, PublicUserRow } from "../db/rows.js";
import authMiddleware from "../middleware/auth.js";
import { toPagination } from "../db/mappers/contents.js";
import { toFileItem } from "../db/mappers/file.js";
import { toFolderItem } from "../db/mappers/folder.js";
import { toPublicUser } from "../db/mappers/user.js";
import * as access from "../utils/access.js";
import {
  parsePagination,
  splitOffsetAcrossLists,
  type PaginationResult,
} from "../utils/pagination.js";
import * as shares from "../utils/shares.js";

const router = Router();

// Loads every owner with a single query instead of one per item.
function loadOwners(rows: { owner_id: number }[]): Map<number, User> {
  const ids = [...new Set(rows.map((row) => row.owner_id))];

  if (ids.length === 0) {
    return new Map();
  }

  const owners = db
    .prepare(
      `
        SELECT id, username, first_name, last_name, avatar_path
        FROM users
        WHERE id IN (${ids.map(() => "?").join(", ")})
      `,
    )
    .all(...ids) as PublicUserRow[];

  return new Map(owners.map((owner) => [owner.id, toPublicUser(owner)]));
}

// Creates a folder within the user's own folder tree.
router.post("/", authMiddleware, (req, res) => {
  const { name, parentId } = req.body;

  const folderName = typeof name === "string" ? name.trim() : "";

  if (!folderName) {
    return res.status(400).json({
      error: "Folder name is required",
    });
  }

  const parsedParentId = parentId ? Number(parentId) : null;

  if (parsedParentId !== null) {
    const parent = db
      .prepare("SELECT * FROM folders WHERE id = ? AND owner_id = ?")
      .get(parsedParentId, req.user.id);

    if (!parent) {
      return res.status(404).json({
        error: "Parent folder not found",
      });
    }
  }

  try {
    const result = db
      .prepare(
        `
          INSERT INTO folders (owner_id, parent_id, name)
          VALUES (?, ?, ?)
        `,
      )
      .run(req.user.id, parsedParentId, folderName);

    const created: CreatedFolder = {
      id: Number(result.lastInsertRowid),
      name: folderName,
      parentId: parsedParentId,
    };

    return res.status(201).json(created);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return res.status(409).json({
        error: "A folder with that name already exists here",
      });
    }

    throw error;
  }
});

// "My files": the requester's own folder tree.
function getMyContents(
  req: Request,
  res: Response,
  pagination: PaginationResult,
) {
  const { page, pageSize, offset } = pagination;

  const folderId = req.params.folderId ? Number(req.params.folderId) : null;

  if (folderId !== null) {
    const folder = db
      .prepare("SELECT id FROM folders WHERE id = ? AND owner_id = ?")
      .get(folderId, req.user.id);

    if (!folder) {
      return res.status(404).json({
        error: "Folder not found",
      });
    }
  }

  const folderCountResult = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM folders
        WHERE owner_id = ?
          AND parent_id IS ?
      `,
    )
    .get(req.user.id, folderId) as { count: number };

  const fileCountResult = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM files
        WHERE owner_id = ?
          AND folder_id IS ?
      `,
    )
    .get(req.user.id, folderId) as { count: number };

  const totalFolders = folderCountResult.count;
  const totalFiles = fileCountResult.count;
  const total = totalFolders + totalFiles;

  const slices = splitOffsetAcrossLists(offset, pageSize, totalFolders);

  const subfolders = slices.folders.limit
    ? (db
        .prepare(
          `
            SELECT
              id,
              owner_id,
              parent_id,
              name,
              is_public,
              created_at
            FROM folders
            WHERE owner_id = ?
              AND parent_id IS ?
            ORDER BY name COLLATE NOCASE
            LIMIT ? OFFSET ?
          `,
        )
        .all(
          req.user.id,
          folderId,
          slices.folders.limit,
          slices.folders.offset,
        ) as FolderRow[])
    : [];

  const files = slices.files.limit
    ? (db
        .prepare(
          `
            SELECT
              id,
              owner_id,
              folder_id,
              name,
              extension,
              size,
              is_public,
              uploaded_at
            FROM files
            WHERE owner_id = ?
              AND folder_id IS ?
            ORDER BY name COLLATE NOCASE
            LIMIT ? OFFSET ?
          `,
        )
        .all(
          req.user.id,
          folderId,
          slices.files.limit,
          slices.files.offset,
        ) as FileListRow[])
    : [];

  const body: FolderContents = {
    isOwner: true,
    folders: subfolders.map((folder) =>
      toFolderItem(folder, shares.getShareStatus("folder", folder)),
    ),
    files: files.map((file) =>
      toFileItem(file, shares.getShareStatus("file", file)),
    ),
    pagination: toPagination(page, pageSize, total),
  };

  return res.json(body);
}

// "Shared with me": items owned by others.
function getSharedContents(
  req: Request,
  res: Response,
  pagination: PaginationResult,
) {
  const { page, pageSize, offset } = pagination;

  const folderId = req.params.folderId ? Number(req.params.folderId) : null;

  if (folderId !== null) {
    const folder = access.getFolderById(folderId);

    if (!folder) {
      return res.status(404).json({
        error: "Folder not found",
      });
    }

    const { canRead } = access.getFolderAccess(folder, req.user.id);

    if (!canRead) {
      return res.status(404).json({
        error: "Folder not found",
      });
    }
  }

  const folderCountResult = db
    .prepare(
      `
        SELECT COUNT(DISTINCT f.id) AS count
        FROM folders f
        LEFT JOIN shares s
          ON s.folder_id = f.id
          AND s.shared_with_user_id = ?
        WHERE f.parent_id IS ?
          AND f.owner_id != ?
          AND (f.is_public = 1 OR s.id IS NOT NULL)
      `,
    )
    .get(req.user.id, folderId, req.user.id) as { count: number };

  const fileCountResult = db
    .prepare(
      `
        SELECT COUNT(DISTINCT f.id) AS count
        FROM files f
        LEFT JOIN shares s
          ON s.file_id = f.id
          AND s.shared_with_user_id = ?
        WHERE f.folder_id IS ?
          AND f.owner_id != ?
          AND (f.is_public = 1 OR s.id IS NOT NULL)
      `,
    )
    .get(req.user.id, folderId, req.user.id) as { count: number };

  const totalFolders = folderCountResult.count;
  const totalFiles = fileCountResult.count;
  const total = totalFolders + totalFiles;

  const slices = splitOffsetAcrossLists(offset, pageSize, totalFolders);

  const subfolders = slices.folders.limit
    ? (db
        .prepare(
          `
            SELECT DISTINCT
              f.id,
              f.owner_id,
              f.parent_id,
              f.name,
              f.is_public,
              f.created_at
            FROM folders f
            LEFT JOIN shares s
              ON s.folder_id = f.id
              AND s.shared_with_user_id = ?
            WHERE f.parent_id IS ?
              AND f.owner_id != ?
              AND (f.is_public = 1 OR s.id IS NOT NULL)
            ORDER BY f.name COLLATE NOCASE
            LIMIT ? OFFSET ?
          `,
        )
        .all(
          req.user.id,
          folderId,
          req.user.id,
          slices.folders.limit,
          slices.folders.offset,
        ) as FolderRow[])
    : [];

  const files = slices.files.limit
    ? (db
        .prepare(
          `
            SELECT DISTINCT
              f.id,
              f.owner_id,
              f.folder_id,
              f.name,
              f.extension,
              f.size,
              f.is_public,
              f.uploaded_at
            FROM files f
            LEFT JOIN shares s
              ON s.file_id = f.id
              AND s.shared_with_user_id = ?
            WHERE f.folder_id IS ?
              AND f.owner_id != ?
              AND (f.is_public = 1 OR s.id IS NOT NULL)
            ORDER BY f.name COLLATE NOCASE
            LIMIT ? OFFSET ?
          `,
        )
        .all(
          req.user.id,
          folderId,
          req.user.id,
          slices.files.limit,
          slices.files.offset,
        ) as FileListRow[])
    : [];

  const owners = loadOwners([...subfolders, ...files]);

  const body: FolderContents = {
    isOwner: false,
    folders: subfolders.map((folder) =>
      toFolderItem(
        folder,
        shares.getShareStatus("folder", folder),
        owners.get(folder.owner_id) ?? null,
      ),
    ),
    files: files.map((file) =>
      toFileItem(
        file,
        shares.getShareStatus("file", file),
        owners.get(file.owner_id) ?? null,
      ),
    ),
    pagination: toPagination(page, pageSize, total),
  };

  return res.json(body);
}

function getContents(req: Request, res: Response) {
  const pagination = parsePagination(
    req.query as {
      page?: string;
      pageSize?: string;
    },
  );

  if ("error" in pagination) {
    return res.status(400).json({
      error: pagination.error,
    });
  }

  const filter =
    typeof req.query.filter === "string" ? req.query.filter : "myFiles";

  if (filter === "sharedWithMe") {
    return getSharedContents(req, res, pagination);
  }

  if (filter === "myFiles") {
    return getMyContents(req, res, pagination);
  }

  return res.status(400).json({
    error: "Invalid filter",
  });
}

router.get("/contents", authMiddleware, getContents);

router.get("/:folderId/contents", authMiddleware, getContents);

// Renames an owned folder.
router.patch("/:id", authMiddleware, (req, res) => {
  const { name } = req.body;

  const folderName = typeof name === "string" ? name.trim() : "";

  if (!folderName) {
    return res.status(400).json({
      error: "Folder name is required",
    });
  }

  const folder = db
    .prepare("SELECT id FROM folders WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id);

  if (!folder) {
    return res.status(404).json({
      error: "Folder not found",
    });
  }

  db.prepare("UPDATE folders SET name = ? WHERE id = ?").run(
    folderName,
    req.params.id,
  );

  return res.json({
    message: "Folder has been renamed",
  });
});

// Deletes an owned folder only when it is empty.
router.delete("/:id", authMiddleware, (req, res) => {
  const folderId = req.params.id;

  const folder = db
    .prepare("SELECT id FROM folders WHERE id = ? AND owner_id = ?")
    .get(folderId, req.user.id);

  if (!folder) {
    return res.status(404).json({
      error: "Folder not found",
    });
  }

  const hasSubfolders = db
    .prepare("SELECT 1 FROM folders WHERE parent_id = ?")
    .get(folderId);

  const hasFiles = db
    .prepare("SELECT 1 FROM files WHERE folder_id = ?")
    .get(folderId);

  if (hasSubfolders || hasFiles) {
    return res.status(400).json({
      error: "Folder is not empty",
    });
  }

  db.prepare("DELETE FROM folders WHERE id = ?").run(folderId);

  return res.json({
    message: "Folder has been deleted",
  });
});

export default router;
