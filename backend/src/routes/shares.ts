import { Router, type Request, type Response } from "express";
import type { ItemType, UpdateShareSettingsBody } from "@kumo/shared";

import db from "../db/database.js";
import type { FileRow, FolderRow } from "../db/rows.js";
import authMiddleware from "../middleware/auth.js";
import * as access from "../utils/access.js";
import * as shares from "../utils/shares.js";

const router = Router();

const ITEMS = {
  folder: {
    table: "folders",
    notFound: "Folder not found",
    getById: access.getFolderById,
  },
  file: {
    table: "files",
    notFound: "File not found",
    getById: access.getFileById,
  },
} as const;

// Ensures the item exists and belongs to the authenticated user.
function getOwnedItem(
  itemType: ItemType,
  req: Request,
  res: Response,
): FolderRow | FileRow | null {
  const item = ITEMS[itemType].getById(Number(req.params.id));

  if (!item) {
    res.status(404).json({ error: ITEMS[itemType].notFound });
    return null;
  }

  if (item.owner_id !== req.user.id) {
    res.status(403).json({ error: "Only the owner can manage sharing" });
    return null;
  }

  return item;
}

for (const itemType of ["folder", "file"] as const) {
  const { table } = ITEMS[itemType];
  const column = shares.shareColumn(itemType);

  // Returns the item's sharing information.
  router.get(`/${itemType}/:id`, authMiddleware, (req, res) => {
    const item = getOwnedItem(itemType, req, res);

    if (!item) {
      return;
    }

    return res.json(shares.getShareSettings(itemType, item));
  });

  // Updates the item's sharing information.
  router.patch(`/${itemType}/:id`, authMiddleware, (req, res) => {
    const item = getOwnedItem(itemType, req, res);

    if (!item) {
      return;
    }

    const { isPublic, sharedWith } =
      req.body as Partial<UpdateShareSettingsBody>;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({
        error: "isPublic must be a boolean",
      });
    }

    if (!Array.isArray(sharedWith)) {
      return res.status(400).json({
        error: "sharedWith must be an array",
      });
    }

    const userIds = [
      ...new Set((sharedWith as unknown[]).map((id) => Number(id))),
    ];

    if (userIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      return res.status(400).json({
        error: "sharedWith must contain valid user IDs",
      });
    }

    if (userIds.includes(req.user.id)) {
      return res.status(400).json({
        error: `You cannot share a ${itemType} with yourself`,
      });
    }

    if (userIds.length > 0) {
      const placeholders = userIds.map(() => "?").join(", ");

      const users = db
        .prepare(`SELECT id FROM users WHERE id IN (${placeholders})`)
        .all(...userIds);

      if (users.length !== userIds.length) {
        return res.status(404).json({
          error: "One or more users were not found",
        });
      }
    }

    // table and column come from constants, never from user input
    const updateSharing = db.transaction(() => {
      db.prepare(`UPDATE ${table} SET is_public = ? WHERE id = ?`).run(
        isPublic ? 1 : 0,
        item.id,
      );

      db.prepare(`DELETE FROM shares WHERE ${column} = ?`).run(item.id);

      const insertShare = db.prepare(
        `INSERT INTO shares (${column}, shared_with_user_id) VALUES (?, ?)`,
      );

      for (const userId of userIds) {
        insertShare.run(item.id, userId);
      }
    });

    updateSharing();

    const updatedItem = ITEMS[itemType].getById(item.id);

    if (!updatedItem) {
      return res.status(404).json({ error: ITEMS[itemType].notFound });
    }

    return res.json(shares.getShareSettings(itemType, updatedItem));
  });
}

export default router;
