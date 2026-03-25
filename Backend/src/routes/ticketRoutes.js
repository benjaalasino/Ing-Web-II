const express = require('express');
const { uploadTicket } = require('../controllers/ticketController');
const { uploadInvoiceImage } = require('../middlewares/uploadMiddleware');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/tickets/upload', requireAuth, uploadInvoiceImage, uploadTicket);

module.exports = router;
