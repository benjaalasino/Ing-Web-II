const multer = require('multer');

const allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

const uploadInvoiceImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new Error('Solo se aceptan archivos JPG, PNG, WEBP o PDF (max 5MB).'));
            return;
        }
        cb(null, true);
    }
}).single('image');

module.exports = {
    uploadInvoiceImage
};
