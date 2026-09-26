const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const access = require("../utils/access");
const shares = require("../utils/shares");

const router = express.Router();

// Ensures the folder exists and belongs to the authenticated user.
function requireOwnedFolder(req, res) {
  const folder = access.getFolderById(req.params.id);
  if (!folder) {
    res.status(404).json({ error: "Folder not found" });
    return null;
  }
  if (folder.owner_id !== req.user.id) {
    res.status(403).json({ error: "Only the owner can manage sharing" });
    return null;
  }
  return folder;
}

// Returns the folder's sharing information.
router.get("/folder/:id", authMiddleware, (req, res) => {
  const folder = requireOwnedFolder(req, res);
  if (!folder) return;

  res.json({
    isPublic: Boolean(folder.is_public),
    status: shares.getShareStatus("folder", folder),
    sharedWith: shares.listShares("folder", folder.id),
  });
});

// Updates the folder's sharing information.
router.patch("/folder/:id", authMiddleware, (req, res) => {
  const folder = requireOwnedFolder(req, res);
  if (!folder) return;

  const { isPublic, sharedWith } = req.body;

  if (typeof isPublic !== "boolean") {
    return res.status(400).json({ error: "isPublic must be a boolean" });
  }

  if (!Array.isArray(sharedWith)) {
    return res.status(400).json({ error: "sharedWith must be an array" });
  }

  const userIds = [...new Set(sharedWith.map(Number))];
  if (userIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return res
      .status(400)
      .json({ error: "sharedWith must contain valid user IDs" });
  }

  if (userIds.includes(req.user.id)) {
    return res
      .status(400)
      .json({ error: "You cannot share a folder with yourself" });
  }

  const placeholders = userIds.map(() => "?").join(", ");

  if (userIds.length > 0) {
    const users = db
      .prepare(`SELECT id FROM users WHERE id IN (${placeholders})`)
      .all(...userIds);

    if (users.length !== userIds.length) {
      return res
        .status(404)
        .json({ error: "One or more users were not found" });
    }
  }

  const updateSharing = db.transaction(() => {
    db.prepare("UPDATE folders SET is_public = ? WHERE id = ?").run(
      isPublic ? 1 : 0,
      folder.id,
    );

    db.prepare("DELETE FROM shares WHERE folder_id = ?").run(folder.id);
    const insertShare = db.prepare(
      ` INSERT INTO shares (folder_id, shared_with_user_id) VALUES (?, ?) `,
    );

    for (const userId of userIds) {
      insertShare.run(folder.id, userId);
    }
  });

  updateSharing();

  const updatedFolder = db
    .prepare("SELECT * FROM folders WHERE id = ?")
    .get(folder.id);

  res.json({
    isPublic: Boolean(updatedFolder.is_public),
    status: shares.getShareStatus("folder", updatedFolder),
    sharedWith: shares.listShares("folder", folder.id),
  });
});

// Ensures the file exists and belongs to the authenticated user.
function requireOwnedFile(req, res) {
  const file = access.getFileById(req.params.id);
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return null;
  }
  if (file.owner_id !== req.user.id) {
    res.status(403).json({ error: "Only the owner can manage sharing" });
    return null;
  }
  return file;
}

// Returns the file's sharing information.
router.get("/file/:id", authMiddleware, (req, res) => {
  const file = requireOwnedFile(req, res);
  if (!file) return;

  res.json({
    isPublic: Boolean(file.is_public),
    status: shares.getShareStatus("file", file),
    sharedWith: shares.listShares("file", file.id),
  });
});

// Updates the file's sharing information.
router.patch("/file/:id", authMiddleware, (req, res) => {
  const file = requireOwnedFile(req, res);
  if (!file) return;

  const { isPublic, sharedWith } = req.body;

  if (typeof isPublic !== "boolean") {
    return res.status(400).json({ error: "isPublic must be a boolean" });
  }

  if (!Array.isArray(sharedWith)) {
    return res.status(400).json({ error: "sharedWith must be an array" });
  }

  const userIds = [...new Set(sharedWith.map(Number))];
  if (userIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return res
      .status(400)
      .json({ error: "sharedWith must contain valid user IDs" });
  }

  if (userIds.includes(req.user.id)) {
    return res
      .status(400)
      .json({ error: "You cannot share a file with yourself" });
  }

  const placeholders = userIds.map(() => "?").join(", ");

  if (userIds.length > 0) {
    const users = db
      .prepare(`SELECT id FROM users WHERE id IN (${placeholders})`)
      .all(...userIds);

    if (users.length !== userIds.length) {
      return res
        .status(404)
        .json({ error: "One or more users were not found" });
    }
  }

  const updateSharing = db.transaction(() => {
    db.prepare("UPDATE files SET is_public = ? WHERE id = ?").run(
      isPublic ? 1 : 0,
      file.id,
    );

    db.prepare("DELETE FROM shares WHERE file_id = ?").run(file.id);
    const insertShare = db.prepare(
      ` INSERT INTO shares (file_id, shared_with_user_id) VALUES (?, ?) `,
    );

    for (const userId of userIds) {
      insertShare.run(file.id, userId);
    }
  });

  updateSharing();

  const updatedFile = db
    .prepare("SELECT * FROM files WHERE id = ?")
    .get(file.id);

  res.json({
    isPublic: Boolean(updatedFile.is_public),
    status: shares.getShareStatus("file", updatedFile),
    sharedWith: shares.listShares("file", file.id),
  });
});

module.exports = router;
