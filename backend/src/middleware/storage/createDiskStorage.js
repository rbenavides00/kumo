const multer = require("multer");
const fs = require("fs");

function createDiskStorage({ getDestination, getFilename }) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = getDestination(req);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, getFilename(req, file));
    },
  });
}

module.exports = createDiskStorage;
