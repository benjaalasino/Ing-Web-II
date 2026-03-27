const express = require('express');
const {
    getConnectionStatus,
    connect,
    disconnect,
    getPayments,
    handleWebhook
} = require('../controllers/mercadoPagoController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/mercadopago/status', requireAuth, getConnectionStatus);
router.post('/mercadopago/connect', requireAuth, connect);
router.post('/mercadopago/disconnect', requireAuth, disconnect);
router.get('/mercadopago/payments', requireAuth, getPayments);
router.post('/mercadopago/webhook', handleWebhook);

module.exports = router;
