const multer = require("multer");
const path = require("path");
const createDiskStorage = require("./createDiskStorage");

const storage = createDiskStorage({
  getDestination: (req) => path.join("./storage/uploads", String(req.user.id)),
  getFilename: (req, file) => `${Date.now()}-${file.originalname}`,
});

const filesUpload = multer({ storage });

module.exports = filesUpload;
