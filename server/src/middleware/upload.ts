import multer from "multer";
import fs from "fs";
import path from "path";

export const upload = (folderName: string, allowedTypes: string[]) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join("uploads", folderName);
      fs.mkdirSync(dir, { recursive: true }); // Create folder if not exists
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

  const fileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only ${allowedTypes.join(", ")} are allowed.`
        )
      );
    }
  };

  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter,
  });
};
