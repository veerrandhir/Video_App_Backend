import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
  // Step : 1 where you want to keep your file
  destination: (req, file, cb) => {
    cb(null, path.resolve("src/DB/temp"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
});

export { upload };
