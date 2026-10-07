import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import type { CreatedFile } from "@kumo/shared";

import db from "../db/database.js";
import type { FileRow } from "../db/rows.js";
import authMiddleware from "../middleware/auth.js";
import filesUpload from "../middleware/storage/fileStorage.js";
import * as access from "../utils/access.js";

const router = Router();

function splitFileName(originalname: string) {
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  const extension = ext.startsWith(".") ? ext.slice(1) : ext;

  return {
    name,
    extension,
  };
}

function toFullName(file: { name: string; extension: string }): string {
  return file.extension ? `${file.name}.${file.extension}` : file.name;
}

// Upload a file to the user's root folder or a folder they own.
router.post(
  "/upload",
  authMiddleware,
  filesUpload.single("file"),
  (req, res) => {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        error: "No file provided",
      });
    }

    // The file is already on disk when validation fails: remove it
    const discardUpload = () => fs.unlink(uploadedFile.path, () => {});

    const { originalname, filename, size } = uploadedFile;

    const folderId = req.body.folderId ? Number(req.body.folderId) : null;

    const { name, extension } = splitFileName(originalname);

    if (folderId !== null) {
      const folder = db
        .prepare("SELECT id FROM folders WHERE id = ? AND owner_id = ?")
        .get(folderId, req.user.id);

      if (!folder) {
        discardUpload();

        return res.status(404).json({
          error: "Destination folder not found",
        });
      }
    }

    const duplicate = db
      .prepare(
        `
          SELECT id FROM files
          WHERE owner_id = ?
            AND folder_id IS ?
            AND name = ?
            AND extension = ?
        `,
      )
      .get(req.user.id, folderId, name, extension);

    if (duplicate) {
      discardUpload();

      return res.status(409).json({
        error: "A file with that name already exists here",
      });
    }

    const result = db
      .prepare(
        `
          INSERT INTO files (
            owner_id,
            folder_id,
            name,
            extension,
            stored_name,
            size
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
      )
      .run(req.user.id, folderId, name, extension, filename, size);

    const created: CreatedFile = {
      id: Number(result.lastInsertRowid),
      name,
      extension,
      folderId,
      size,
    };

    return res.status(201).json(created);
  },
);

// Rename an owned file while preserving its extension.
router.patch("/:id", authMiddleware, (req, res) => {
  const { name } = req.body;
  const trimmedName = typeof name === "string" ? name.trim() : "";

  if (!trimmedName) {
    return res.status(400).json({
      error: "File name is required",
    });
  }

  const file = db
    .prepare("SELECT * FROM files WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id) as FileRow | undefined;

  if (!file) {
    return res.status(404).json({
      error: "File not found",
    });
  }

  const duplicate = db
    .prepare(
      `
        SELECT id FROM files
        WHERE owner_id = ?
          AND folder_id IS ?
          AND name = ?
          AND extension = ?
          AND id != ?
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

  return res.json({
    message: "File has been renamed",
  });
});

// Delete an owned file from the database and local storage.
router.delete("/:id", authMiddleware, (req, res) => {
  const file = db
    .prepare("SELECT * FROM files WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id) as FileRow | undefined;

  if (!file) {
    return res.status(404).json({
      error: "File not found",
    });
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

  return res.json({
    message: "File has been deleted",
  });
});

// Download a file when the user has read access.
router.get("/:id/download", authMiddleware, (req, res) => {
  const file = access.getFileById(Number(req.params.id));

  if (!file) {
    return res.status(404).json({
      error: "File not found",
    });
  }

  const { canRead, ownerId } = access.getFileAccess(file, req.user.id);

  if (!canRead || ownerId === undefined) {
    return res.status(404).json({
      error: "File not found",
    });
  }

  const filePath = path.join(
    "./storage/uploads",
    String(ownerId),
    file.stored_name,
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "File not found on disk",
    });
  }

  return res.download(filePath, toFullName(file));
});

export default router;
