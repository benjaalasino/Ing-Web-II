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
    res.status(200).json({ ok: true });

    const { type, data } = req.body;

    if (type === 'payment' && data?.id) {
        try {
            await mpService.processWebhookPayment(data.id);
        } catch {
            // Silently ignore webhook processing errors
        }
    }
};

module.exports = {
    getConnectionStatus,
    connect,
    disconnect,
    getPayments,
    handleWebhook
};
