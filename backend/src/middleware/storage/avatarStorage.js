const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

async function processAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const dir = "./storage/avatars";

    await fs.mkdir(dir, { recursive: true });

    const filename = `${req.user.id}-${Date.now()}.webp`;
    const filepath = path.join(dir, filename);

    await sharp(req.file.buffer)
      .resize(500, 500, { fit: "cover", position: "center" })
      .webp({ quality: 80,})
      .toFile(filepath);

    req.file.path = filepath;
    req.file.filename = filename;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  avatarUpload,
  processAvatar,
};
