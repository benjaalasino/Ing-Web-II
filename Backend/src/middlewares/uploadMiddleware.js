const multer = require('multer');

const allowedMimeTypes = new Set(['image/png', 'image/jpeg']);

const uploadInvoiceImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new Error('Solo se aceptan archivos PNG o JPEG.'));
            return;
        }
        cb(null, true);
    }
}).single('invoiceImage');

module.exports = {
    uploadInvoiceImage
};
