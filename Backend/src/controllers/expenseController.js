const { pool } = require('../data/db');
const { CATEGORIES } = require('../constants/categories');
const { buildExpenseStats } = require('../utils/expenseStats');

const toNumber = (value) => Number.parseFloat(value);

const getExpenseOwnerId = (req) => {
    if (req.auth.role === 'advisor' && req.query.userId) {
        return Number(req.query.userId);
    }
    return req.auth.userId;
};

const mapExpense = (row) => ({
    id: row.id,
    userId: row.user_id,
    commerce: row.commerce,
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date,
    amount: Number(row.amount),
    category: row.category,
    description: row.description || '',
    imageUrl: row.image_url,
    createdAt: row.created_at
});

const getExpenses = async (req, res) => {
    const ownerId = getExpenseOwnerId(req);
    const { category, month, year, commerce, limit } = req.query;

    const conditions = ['user_id = $1'];
    const params = [ownerId];
    let idx = 2;

    if (category) {
        conditions.push(`category = $${idx++}`);
        params.push(category);
    }
    if (month) {
        conditions.push(`EXTRACT(MONTH FROM date) = $${idx++}`);
        params.push(Number(month));
    }
    if (year) {
        conditions.push(`EXTRACT(YEAR FROM date) = $${idx++}`);
        params.push(Number(year));
    }
    if (commerce) {
        conditions.push(`LOWER(commerce) LIKE $${idx++}`);
        params.push(`%${String(commerce).toLowerCase()}%`);
    }

    let sql = `SELECT * FROM expenses WHERE ${conditions.join(' AND ')} ORDER BY date DESC`;
    if (limit) {
        sql += ` LIMIT $${idx}`;
        params.push(Number(limit));
    }

    const { rows } = await pool.query(sql, params);
    res.json(rows.map(mapExpense));
};

const createExpense = async (req, res) => {
    const { commerce, date, amount, category, description, imageUrl = null } = req.body;

    if (!commerce || !date || amount === undefined || !category) {
        res.status(400).json({ statusCode: 400, message: 'Comercio, fecha, monto y categoria son obligatorios.' });
        return;
    }

    if (!CATEGORIES.includes(category)) {
        res.status(400).json({ statusCode: 400, message: 'La categoria no es valida.' });
        return;
    }

    const parsedAmount = toNumber(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto debe ser mayor a cero.' });
        return;
    }

    const now = new Date();
    const expenseDate = new Date(date);
    if (expenseDate > now) {
        res.status(400).json({ statusCode: 400, message: 'La fecha no puede ser futura.' });
        return;
    }

    const { rows } = await pool.query(
        `INSERT INTO expenses (user_id, commerce, date, amount, category, description, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [req.auth.userId, String(commerce).trim(), date, parsedAmount, category, description ? String(description).trim() : '', imageUrl]
    );

    res.status(201).json(mapExpense(rows[0]));
};

const updateExpense = async (req, res) => {
    const id = Number(req.params.id);
    const { commerce, date, amount, category, description } = req.body;

    if (!commerce || !date || amount === undefined || !category) {
        res.status(400).json({ statusCode: 400, message: 'Comercio, fecha, monto y categoria son obligatorios.' });
        return;
    }

    if (!CATEGORIES.includes(category)) {
        res.status(400).json({ statusCode: 400, message: 'La categoria no es valida.' });
        return;
    }

    const parsedAmount = toNumber(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto debe ser mayor a cero.' });
        return;
    }

    const { rows } = await pool.query(
        `UPDATE expenses SET commerce = $1, date = $2, amount = $3, category = $4, description = $5
         WHERE id = $6 AND user_id = $7 RETURNING *`,
        [String(commerce).trim(), date, parsedAmount, category, description ? String(description).trim() : '', id, req.auth.userId]
    );

    if (rows.length === 0) {
        res.status(404).json({ statusCode: 404, message: 'Gasto no encontrado.' });
        return;
    }

    res.json(mapExpense(rows[0]));
};

const deleteExpense = async (req, res) => {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, req.auth.userId]);

    if (rowCount === 0) {
        res.status(404).json({ statusCode: 404, message: 'Gasto no encontrado.' });
        return;
    }

    res.json({ statusCode: 200, message: 'Gasto eliminado.' });
};

const getExpenseStats = async (req, res) => {
    const ownerId = getExpenseOwnerId(req);
    const { rows } = await pool.query('SELECT * FROM expenses WHERE user_id = $1', [ownerId]);
    res.json(buildExpenseStats(rows.map(mapExpense)));
};

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats
};
