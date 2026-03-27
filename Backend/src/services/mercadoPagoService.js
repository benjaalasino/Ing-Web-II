const { db, getNextId } = require('../data/db');

/* ── Token management ── */
const saveToken = async (userId, accessToken) => {
    // Fetch MP user ID to identify the user in webhooks
    const res = await fetch('https://api.mercadopago.com/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Access Token inválido. Verificá que sea correcto.');

    const mpUser = await res.json();
    const existing = db.mpTokens.find((t) => t.userId === userId);
    const entry = { userId, accessToken, mpUserId: mpUser.id, createdAt: new Date().toISOString() };

    if (existing) {
        Object.assign(existing, entry);
    } else {
        db.mpTokens.push(entry);
    }
    return entry;
};

const isConnected = (userId) => {
    return db.mpTokens.some((t) => t.userId === userId);
};

const disconnect = (userId) => {
    const idx = db.mpTokens.findIndex((t) => t.userId === userId);
    if (idx >= 0) db.mpTokens.splice(idx, 1);
    db.mpPayments = db.mpPayments.filter((p) => p.userId !== userId);
};

/* ── Categorization ── */
const categorizeMpPayment = (description) => {
    const desc = (description || '').toLowerCase();
    if (/super|coto|dia|carrefour|jumbo|chango|almac/i.test(desc)) return 'Supermercado';
    if (/farmacia|farmacity|medic|salud|hospital/i.test(desc)) return 'Salud';
    if (/uber|cabify|sube|combustible|ypf|shell|nafta|estacion/i.test(desc)) return 'Transporte';
    if (/cine|netflix|spotify|juego|steam|entradas/i.test(desc)) return 'Entretenimiento';
    if (/curso|udemy|libro|escuela|universidad|educacion/i.test(desc)) return 'Educacion';
    if (/restaur|comida|pizza|hambur|cafe|bar|delivery|rappi|pedidos/i.test(desc)) return 'Comida';
    return 'Otros';
};

/* ── Stored payments ── */
const getStoredPayments = (userId, filters = {}) => {
    let items = db.mpPayments.filter((p) => p.userId === userId);

    if (filters.category) {
        items = items.filter((p) => p.category === filters.category);
    }
    if (filters.month) {
        items = items.filter((p) => new Date(p.date).getMonth() + 1 === Number(filters.month));
    }
    if (filters.year) {
        items = items.filter((p) => new Date(p.date).getFullYear() === Number(filters.year));
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
};

/* ── Webhook processing ── */
const processWebhookPayment = async (paymentId) => {
    for (const tokenEntry of db.mpTokens) {
        try {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${tokenEntry.accessToken}` }
            });

            if (!response.ok) continue;

            const payment = await response.json();
            if (payment.status !== 'approved') return { action: 'skipped', reason: 'not approved' };

            // Only store expenses: the connected user must be the payer (not the collector)
            const isExpense = payment.payer?.id === tokenEntry.mpUserId;
            if (!isExpense) return { action: 'skipped', reason: 'not an expense' };

            const alreadyExists = db.mpPayments.some(
                (p) => p.userId === tokenEntry.userId && p.mpPaymentId === payment.id
            );
            if (alreadyExists) return { action: 'skipped', reason: 'already exists' };

            const description = payment.description || payment.additional_info?.items?.[0]?.title || 'Pago MercadoPago';

            db.mpPayments.push({
                id: getNextId('mpPayments'),
                userId: tokenEntry.userId,
                mpPaymentId: payment.id,
                description,
                amount: payment.transaction_amount,
                date: payment.date_created.split('T')[0],
                category: categorizeMpPayment(description),
                paymentMethod: payment.payment_type_id || 'unknown',
                createdAt: new Date().toISOString()
            });

            return { action: 'created', userId: tokenEntry.userId };
        } catch {
            continue;
        }
    }

    return { action: 'skipped', reason: 'no matching user' };
};

module.exports = {
    saveToken,
    isConnected,
    disconnect,
    getStoredPayments,
    processWebhookPayment
};
