import { Request } from "express";
import fs from "fs";

export const handleUploadError = async (req: any, res: any, err: any) => {
  removeUploadedFile(req);

  res.status(400).json({
    success: false,
    data: {},
    message: err.message || "File upload error",
  });
};

export const removeUploadedFile = (req: Request) => {
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting uploaded file:", unlinkErr);
      }
    });
  }
};
