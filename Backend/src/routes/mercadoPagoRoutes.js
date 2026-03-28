const express = require('express');
const {
    getConnectionStatus,
    connect,
    disconnect,
    getPayments,
    handleWebhook
} = require('../controllers/mercadoPagoController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/mercadopago/status', requireAuth, asyncHandler(getConnectionStatus));
router.post('/mercadopago/connect', requireAuth, asyncHandler(connect));
router.post('/mercadopago/disconnect', requireAuth, asyncHandler(disconnect));
router.get('/mercadopago/payments', requireAuth, asyncHandler(getPayments));
router.post('/mercadopago/webhook', asyncHandler(handleWebhook));

module.exports = router;
