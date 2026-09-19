const multer = require("multer");
const path = require("path");
const createDiskStorage = require("./createDiskStorage");

const storage = createDiskStorage({
  getDestination: () => "./storage/avatars",
  getFilename: (req, file) =>
    `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`,
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

module.exports = avatarUpload;
