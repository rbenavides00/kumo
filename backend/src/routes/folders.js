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

// Returns the contents of the user's root or a specific accessible folder.
function getContents(req, res) {
  const folderId = req.params.folderId || null;
  const filter = req.query.filter || "myFiles";

  if (!["myFiles", "sharedWithMe"].includes(filter)) {
    return res.status(400).json({ error: "Invalid filter" });
  }

  const isSharedFilter = filter === "sharedWithMe";
  if (folderId === null) {
    const foldersQuery = isSharedFilter
      ? ` SELECT DISTINCT f.* FROM folders f LEFT JOIN shares s ON s.folder_id = f.id AND s.shared_with_user_id = ? WHERE f.owner_id = ? OR f.is_public = 1 OR s.id IS NOT NULL `
      : ` SELECT * FROM folders WHERE owner_id = ? AND parent_id IS NULL `;

    const filesQuery = isSharedFilter
      ? ` SELECT DISTINCT f.* FROM files f LEFT JOIN shares s ON s.file_id = f.id AND s.shared_with_user_id = ? WHERE f.owner_id = ? OR f.is_public = 1 OR s.id IS NOT NULL `
      : ` SELECT * FROM files WHERE owner_id = ? AND folder_id IS NULL `;

    const subfolders = isSharedFilter
      ? db.prepare(foldersQuery).all(req.user.id, req.user.id)
      : db.prepare(foldersQuery).all(req.user.id);

    const files = isSharedFilter
      ? db.prepare(filesQuery).all(req.user.id, req.user.id)
      : db.prepare(filesQuery).all(req.user.id);

    return res.json({
      isOwner: filter === "myFiles",
      folders: subfolders.map(attachShareStatus),
      files: files.map(attachFileShareStatus),
    });
  }

  const folder = access.getFolderById(folderId);
  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  const { isOwner, canRead, ownerId } = access.getFolderAccess(
    folder,
    req.user.id,
  );

  if (!canRead) {
    return res.status(404).json({ error: "Folder not found" });
  }

  const subfolders = isSharedFilter
    ? db
        .prepare(
          ` SELECT DISTINCT f.* FROM folders f LEFT JOIN shares s ON s.folder_id = f.id AND s.shared_with_user_id = ? WHERE f.parent_id = ? AND ( f.owner_id = ? OR f.is_public = 1 OR s.id IS NOT NULL ) `,
        )
        .all(req.user.id, folderId, req.user.id)
    : db
        .prepare(` SELECT * FROM folders WHERE owner_id = ? AND parent_id = ? `)
        .all(ownerId, folderId);

  const files = isSharedFilter
    ? db
        .prepare(
          ` SELECT DISTINCT f.* FROM files f LEFT JOIN shares s ON s.file_id = f.id AND s.shared_with_user_id = ? WHERE f.folder_id = ? AND ( f.owner_id = ? OR f.is_public = 1 OR s.id IS NOT NULL ) `,
        )
        .all(req.user.id, folderId, req.user.id)
    : db
        .prepare(` SELECT * FROM files WHERE owner_id = ? AND folder_id = ? `)
        .all(ownerId, folderId);

  res.json({
    isOwner,
    folders: subfolders.map(attachShareStatus),
    files: files.map(attachFileShareStatus),
  });
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
