import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => cb(null, 'uploads/logos'),
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

export const uploadLogoMiddleware = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});