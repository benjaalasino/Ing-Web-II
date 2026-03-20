const multer = require('multer');

const errorHandler = (error, req, res, next) => {
    if (error instanceof multer.MulterError || error.message) {
        res.status(400).json({ message: error.message || 'Error de carga de archivo.' });
        return;
    }

    next(error);
};

module.exports = {
    errorHandler
};
