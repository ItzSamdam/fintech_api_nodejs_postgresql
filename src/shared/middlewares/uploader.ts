import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (
    file.mimetype.includes('jpeg') ||
    file.mimetype.includes('png') ||
    file.mimetype.includes('jpg') ||
    file.mimetype.includes('webp')
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = multer.memoryStorage();

const uploader = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB size limit per file
}).array('files'); // 'files' is the field name in the form

export default uploader;
