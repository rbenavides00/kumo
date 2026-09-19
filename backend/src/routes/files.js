const express = require("express");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const filesUpload = require("../middleware/storage/fileStorage");

const router = express.Router();

function splitFileName(originalname) {
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  const extension = ext.startsWith(".") ? ext.slice(1) : ext;
  return { name, extension };
}

function toFullName(file) {
  return file.extension ? `${file.name}.${file.extension}` : file.name;
}

router.post(
  "/upload",
  authMiddleware,
  filesUpload.single("file"),
  (req, res) => {
    const { originalname, filename, size } = req.file;
    const folderId = req.body.folderId || null;
    const { name, extension } = splitFileName(originalname);

    if (folderId) {
      const folder = db
        .prepare("SELECT * FROM folders WHERE id = ? AND owner_id = ?")
        .get(folderId, req.user.id);
      if (!folder) {
        return res.status(404).json({ error: "Destination folder not found" });
      }
    }

    const duplicate = db
      .prepare(
        `
        SELECT id FROM files
        WHERE owner_id = ? AND folder_id IS ? AND name = ? AND extension = ?
      `,
      )
      .get(req.user.id, folderId, name, extension);

    if (duplicate) {
      return res
        .status(409)
        .json({ error: "A file with that name already exists here" });
    }

    const result = db
      .prepare(
        `
      INSERT INTO files (owner_id, folder_id, name, extension, stored_name, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(req.user.id, folderId, name, extension, filename, size);

    const file = {
      id: result.lastInsertRowid,
      name,
      extension,
      folder_id: folderId,
      size,
    };

    res.status(201).json({ ...file, original_name: toFullName(file) });
  },
);

// Rename a file (extension is preserved and can't be changed)
router.patch("/:id", authMiddleware, (req, res) => {
  const { name } = req.body;
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return res.status(400).json({ error: "File name is required" });
  }

  const file = db
    .prepare("SELECT * FROM files WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id);

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  const duplicate = db
    .prepare(
      `
        SELECT id FROM files
        WHERE owner_id = ? AND folder_id IS ? AND name = ? AND extension = ? AND id != ?
      `,
    )
    .get(req.user.id, file.folder_id, trimmedName, file.extension, file.id);

  if (duplicate) {
    return res.status(409).json({
      error: "A file with that name already exists in the current folder",
    });
  }

  db.prepare("UPDATE files SET name = ? WHERE id = ?").run(
    trimmedName,
    file.id,
  );

  res.json({ message: "File has been renamed" });
});

// Delete file
router.delete("/:id", authMiddleware, (req, res) => {
  const file = db
    .prepare("SELECT * FROM files WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id);

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  const filePath = path.join(
    "./storage/uploads",
    String(req.user.id),
    file.stored_name,
  );

  db.prepare("DELETE FROM files WHERE id = ?").run(file.id);

  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete file from disk:", filePath, err);
    }
  });

  res.json({ message: "File has been deleted" });
});

// Download file
router.get("/:id/download", authMiddleware, (req, res) => {
  const file = db
    .prepare("SELECT * FROM files WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id);

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  const filePath = path.join(
    "./storage/uploads",
    String(req.user.id),
    file.stored_name,
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found on disk" });
  }

  res.download(filePath, toFullName(file));
});

module.exports = router;
