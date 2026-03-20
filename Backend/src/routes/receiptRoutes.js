const express = require('express');
const { extractReceiptData } = require('../controllers/receiptController');
const { uploadInvoiceImage } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/receipts/extract', uploadInvoiceImage, extractReceiptData);

module.exports = router;
