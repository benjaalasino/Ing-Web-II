const { pool } = require('../data/db');

/* ── Token management ── */
const saveToken = async (userId, accessToken) => {
    const res = await fetch('https://api.mercadopago.com/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Access Token inválido. Verificá que sea correcto.');

    const mpUser = await res.json();

    await pool.query(
        `INSERT INTO mp_tokens (user_id, access_token, mp_user_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET access_token = $2, mp_user_id = $3, created_at = NOW()`,
        [userId, accessToken, String(mpUser.id)]
    );

    return { userId, mpUserId: mpUser.id };
};

const isConnected = async (userId) => {
    const { rows } = await pool.query('SELECT id FROM mp_tokens WHERE user_id = $1', [userId]);
    return rows.length > 0;
};

const disconnect = async (userId) => {
    await pool.query('DELETE FROM mp_payments WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM mp_tokens WHERE user_id = $1', [userId]);
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
const getStoredPayments = async (userId, filters = {}) => {
    const conditions = ['user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (filters.category) {
        conditions.push(`category = $${idx++}`);
        params.push(filters.category);
    }
    if (filters.month) {
        conditions.push(`EXTRACT(MONTH FROM date) = $${idx++}`);
        params.push(Number(filters.month));
    }
    if (filters.year) {
        conditions.push(`EXTRACT(YEAR FROM date) = $${idx++}`);
        params.push(Number(filters.year));
    }

    const { rows } = await pool.query(
        `SELECT * FROM mp_payments WHERE ${conditions.join(' AND ')} ORDER BY date DESC`,
        params
    );

    return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        mpPaymentId: r.mp_payment_id,
        description: r.description,
        amount: Number(r.amount),
        date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : r.date,
        category: r.category,
        paymentMethod: r.payment_method,
        createdAt: r.created_at
    }));
};

/* ── Webhook processing ── */
const processWebhookPayment = async (paymentId) => {
    const { rows: tokens } = await pool.query('SELECT * FROM mp_tokens');

    for (const tokenEntry of tokens) {
        try {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${tokenEntry.access_token}` }
            });

            if (!response.ok) continue;

            const payment = await response.json();
            if (payment.status !== 'approved') return { action: 'skipped', reason: 'not approved' };

            const isExpense = String(payment.payer?.id) === String(tokenEntry.mp_user_id);
            if (!isExpense) return { action: 'skipped', reason: 'not an expense' };

            // Check duplicate
            const { rows: dup } = await pool.query(
                'SELECT id FROM mp_payments WHERE user_id = $1 AND mp_payment_id = $2',
                [tokenEntry.user_id, String(payment.id)]
            );
            if (dup.length > 0) return { action: 'skipped', reason: 'already exists' };

            const description = payment.description || payment.additional_info?.items?.[0]?.title || 'Pago MercadoPago';

            await pool.query(
                `INSERT INTO mp_payments (user_id, mp_payment_id, description, amount, date, category, payment_method)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    tokenEntry.user_id,
                    String(payment.id),
                    description,
                    payment.transaction_amount,
                    payment.date_created.split('T')[0],
                    categorizeMpPayment(description),
                    payment.payment_type_id || 'unknown'
                ]
            );

            return { action: 'created', userId: tokenEntry.user_id };
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
