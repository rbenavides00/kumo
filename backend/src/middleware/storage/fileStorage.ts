import multer from "multer";
import fs from "node:fs";
import path from "node:path";

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    if (!req.user) {
      return cb(new Error("Not authenticated"), "");
    }

    const dir = path.join("./storage/uploads", String(req.user.id));

    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },

  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const filesUpload = multer({ storage });

export default filesUpload;
