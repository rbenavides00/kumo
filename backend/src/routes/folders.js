const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const access = require("../utils/access");
const shares = require("../utils/shares");

const router = express.Router();

function attachShareStatus(folder) {
  return { ...folder, shareStatus: shares.getShareStatus("folder", folder) };
}

function attachFileShareStatus(file) {
  return { ...file, shareStatus: shares.getShareStatus("file", file) };
}

function attachOwner(item) {
  const owner = db
    .prepare(
      "SELECT id, username, first_name, last_name, avatar_path FROM users WHERE id = ?",
    )
    .get(item.owner_id);

  const { owner_id, ...rest } = item;

  return {
    ...rest,
    owner: {
      id: owner.id,
      username: owner.username,
      firstName: owner.first_name,
      lastName: owner.last_name,
      hasAvatar: Boolean(owner.avatar_path),
    },
  };
}

// Creates a folder within the user's own folder tree.
// Shared access never grants permission to create or modify folders.
router.post("/", authMiddleware, (req, res) => {
  const { name, parentId } = req.body;
  const folderName = name?.trim();

  if (!folderName) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  // If parentId was sent, verify that the folder exists and belongs to the user
  if (parentId) {
    const parent = db
      .prepare("SELECT * FROM folders WHERE id = ? AND owner_id = ?")
      .get(parentId, req.user.id);

    if (!parent) {
      return res.status(404).json({ error: "Parent folder not found" });
    }
  }

  try {
    const result = db
      .prepare(
        "INSERT INTO folders (owner_id, parent_id, name) VALUES (?, ?, ?)",
      )
      .run(req.user.id, parentId || null, folderName);

    return res.status(201).json({
      id: result.lastInsertRowid,
      name: folderName,
      parentId: parentId || null,
    });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res
        .status(409)
        .json({ error: "A folder with that name already exists here" });
    }
    throw err;
  }
});

// "My files": the requester's own folder tree
function getMyContents(req, res) {
  const folderId = req.params.folderId || null;

  if (folderId !== null) {
    const folder = db
      .prepare("SELECT id FROM folders WHERE id = ? AND owner_id = ?")
      .get(folderId, req.user.id);

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
  }

  const subfolders = db
    .prepare(
      `
        SELECT id, parent_id, name, is_public, created_at
        FROM folders WHERE owner_id = ? AND parent_id IS ?
      `,
    )
    .all(req.user.id, folderId);

  const files = db
    .prepare(
      `
        SELECT id, folder_id, name, extension, size, is_public, uploaded_at
        FROM files WHERE owner_id = ? AND folder_id IS ?
      `,
    )
    .all(req.user.id, folderId);

  res.json({
    isOwner: true,
    folders: subfolders.map(attachShareStatus),
    files: files.map(attachFileShareStatus),
  });
}

// "Shared with me": items owned by others, public or shared directly with the requester
function getSharedContents(req, res) {
  const folderId = req.params.folderId || null;

  if (folderId !== null) {
    const folder = access.getFolderById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const { canRead } = access.getFolderAccess(folder, req.user.id);
    if (!canRead) {
      return res.status(404).json({ error: "Folder not found" });
    }
  }

  const subfolders = db
    .prepare(
      `
        SELECT DISTINCT
          f.id, f.parent_id, f.name, f.is_public, f.created_at, f.owner_id
        FROM folders f
        LEFT JOIN shares s ON s.folder_id = f.id AND s.shared_with_user_id = ?
        WHERE f.parent_id IS ? AND f.owner_id != ? AND (f.is_public = 1 OR s.id IS NOT NULL)
      `,
    )
    .all(req.user.id, folderId, req.user.id);

  const files = db
    .prepare(
      `
        SELECT DISTINCT
          f.id, f.folder_id, f.name, f.extension, f.size, f.is_public, f.uploaded_at, f.owner_id
        FROM files f
        LEFT JOIN shares s ON s.file_id = f.id AND s.shared_with_user_id = ?
        WHERE f.folder_id IS ? AND f.owner_id != ? AND (f.is_public = 1 OR s.id IS NOT NULL)
      `,
    )
    .all(req.user.id, folderId, req.user.id);

  res.json({
    isOwner: false,
    folders: subfolders.map((f) => attachOwner(attachShareStatus(f))),
    files: files.map((f) => attachOwner(attachFileShareStatus(f))),
  });
}

function getContents(req, res) {
  const filter = req.query.filter || "myFiles";

  if (filter === "sharedWithMe") return getSharedContents(req, res);
  if (filter === "myFiles") return getMyContents(req, res);

  return res.status(400).json({ error: "Invalid filter" });
}

router.get("/contents", authMiddleware, getContents);
router.get("/:folderId/contents", authMiddleware, getContents);

// Renames an owned folder.
router.patch("/:id", authMiddleware, (req, res) => {
  const { name } = req.body;
  const folderName = name?.trim();

  const folder = db
    .prepare("SELECT * FROM folders WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id);

  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  db.prepare("UPDATE folders SET name = ? WHERE id = ?").run(
    folderName,
    req.params.id,
  );

  return res.json({ message: "Folder has been renamed" });
});

// Deletes an owned folder only when it is empty.
router.delete("/:id", authMiddleware, (req, res) => {
  const folderId = req.params.id;

  const folder = db
    .prepare("SELECT * FROM folders WHERE id = ? AND owner_id = ?")
    .get(folderId, req.user.id);

  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  const hasSubfolders = db
    .prepare("SELECT 1 FROM folders WHERE parent_id = ?")
    .get(folderId);

  const hasFiles = db
    .prepare("SELECT 1 FROM files WHERE folder_id = ?")
    .get(folderId);

  if (hasSubfolders || hasFiles) {
    return res.status(400).json({ error: "Folder is not empty" });
  }

  db.prepare("DELETE FROM folders WHERE id = ?").run(folderId);

  return res.json({ message: "Folder has been deleted" });
});

module.exports = router;
