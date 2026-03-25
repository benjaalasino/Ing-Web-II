const multer = require('multer');

const errorHandler = (error, req, res, next) => {
    if (error instanceof multer.MulterError || error.message) {
        res.status(400).json({
            statusCode: 400,
            message: error.message || 'Error de carga de archivo.'
        });
        return;
    }

    res.status(500).json({
        statusCode: 500,
        message: 'Error interno del servidor.'
    });
};

module.exports = {
    errorHandler
};
