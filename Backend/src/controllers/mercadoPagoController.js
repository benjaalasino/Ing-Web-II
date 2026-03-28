const mpService = require('../services/mercadoPagoService');

const getConnectionStatus = (req, res) => {
    const connected = mpService.isConnected(req.auth.userId);
    res.json({ connected });
};

const connect = async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim().length < 10) {
        res.status(400).json({ statusCode: 400, message: 'Access Token inválido.' });
        return;
    }
    try {
        await mpService.saveToken(req.auth.userId, accessToken.trim());
        res.json({ statusCode: 200, message: 'MercadoPago conectado. Tus gastos se registrarán automáticamente.' });
    } catch (error) {
        res.status(400).json({ statusCode: 400, message: error.message });
    }
};

const disconnect = (req, res) => {
    mpService.disconnect(req.auth.userId);
    res.json({ statusCode: 200, message: 'MercadoPago desconectado.' });
};

const getPayments = (req, res) => {
    const { category, month, year } = req.query;
    const items = mpService.getStoredPayments(req.auth.userId, { category, month, year });
    res.json(items);
};

const handleWebhook = async (req, res) => {
    console.log('[MP Webhook] Body:', JSON.stringify(req.body));
    console.log('[MP Webhook] Query:', JSON.stringify(req.query));
    res.status(200).json({ ok: true });

    // Format 1 (Webhooks): { type: "payment", data: { id: "123" } }
    // Format 2 (IPN): ?topic=payment&id=123  OR  { topic: "payment", id: "123" }
    let paymentId = null;

    if (req.body?.data?.id) {
        paymentId = req.body.data.id;
    } else if (req.body?.topic === 'payment' && req.body?.id) {
        paymentId = req.body.id;
    } else if (req.query?.topic === 'payment' && req.query?.id) {
        paymentId = req.query.id;
    } else if (req.query?.['data.id']) {
        paymentId = req.query['data.id'];
    }

    if (paymentId) {
        try {
            const result = await mpService.processWebhookPayment(paymentId);
            console.log('[MP Webhook] Result:', JSON.stringify(result));
        } catch (err) {
            console.error('[MP Webhook] Error:', err.message);
        }
    } else {
        console.log('[MP Webhook] No payment ID found, ignoring.');
    }
};

module.exports = {
    getConnectionStatus,
    connect,
    disconnect,
    getPayments,
    handleWebhook
};
