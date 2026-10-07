import multer from "multer";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import type { NextFunction, Request, Response } from "express";

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG or WEBP images are allowed"));
    }

    cb(null, true);
  },
});

async function processAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image provided",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    const dir = "./storage/avatars";

    await fs.mkdir(dir, { recursive: true });

    const filename = `${req.user.id}-${Date.now()}.webp`;
    const filepath = path.join(dir, filename);

    await sharp(req.file.buffer)
      .resize(500, 500, { fit: "cover", position: "center" })
      .webp({ quality: 80 })
      .toFile(filepath);

    req.file.path = filepath;
    req.file.filename = filename;

    next();
  } catch (error) {
    next(error);
  }
}

export { avatarUpload, processAvatar };
