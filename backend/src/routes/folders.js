const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create new folder
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

// View folder contents (or the root if folderId is not provided)
function getContents(req, res) {
  const folderId = req.params.folderId || null;

  if (folderId) {
    const folder = db
      .prepare("SELECT * FROM folders WHERE id = ? AND owner_id = ?")
      .get(folderId, req.user.id);
    if (!folder)
      return res.status(404).json({ error: "Carpeta no encontrada" });
  }

  const subfolders = db
    .prepare("SELECT * FROM folders WHERE owner_id = ? AND parent_id IS ?")
    .all(req.user.id, folderId);

  const files = db
    .prepare("SELECT * FROM files WHERE owner_id = ? AND folder_id IS ?")
    .all(req.user.id, folderId);

  res.json({ folders: subfolders, files });
}

router.get("/contents", authMiddleware, getContents);
router.get("/:folderId/contents", authMiddleware, getContents);

// Rename a folder
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

// Delete a folder (only if empty, to prevent accidental mass deletions)
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
