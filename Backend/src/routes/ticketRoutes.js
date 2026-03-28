const express = require('express');
const { uploadTicket } = require('../controllers/ticketController');
const { uploadInvoiceImage } = require('../middlewares/uploadMiddleware');
const { requireAuth } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/tickets/upload', requireAuth, uploadInvoiceImage, asyncHandler(uploadTicket));

module.exports = router;
