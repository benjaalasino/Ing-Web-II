import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const allowedMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
]);

/** Opciones de Multer para la carga de la imagen del ticket. */
export const invoiceUploadOptions: MulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new BadRequestException('Solo se aceptan archivos JPG, PNG, WEBP o PDF (max 5MB).'), false);
      return;
    }
    cb(null, true);
  },
};
