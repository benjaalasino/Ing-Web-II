const { pool } = require('../data/db');
const { buildExpenseStats } = require('../utils/expenseStats');

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

const getUsers = async (req, res) => {
    const { rows } = await pool.query(
        "SELECT id, name, email, role, created_at FROM users WHERE role = 'user' ORDER BY id"
    );
    const users = rows.map((r) => ({ id: r.id, name: r.name, email: r.email, role: r.role, createdAt: r.created_at }));
    res.json(users);
};

const getUserById = async (req, res) => {
    const userId = Number(req.params.id);
    const { rows } = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = $1 AND role = 'user'", [userId]);

    if (rows.length === 0) {
        res.status(404).json({ statusCode: 404, message: 'Usuario no encontrado.' });
        return;
    }

    const u = rows[0];
    res.json({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at });
};

const getUserStats = async (req, res) => {
    const userId = Number(req.params.id);
    const { rows: userRows } = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = $1 AND role = 'user'", [userId]);

    if (userRows.length === 0) {
        res.status(404).json({ statusCode: 404, message: 'Usuario no encontrado.' });
        return;
    }

    const u = userRows[0];
    const { rows: expRows } = await pool.query('SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC', [userId]);
    const expenses = expRows.map(mapExpense);

    res.json({
        user: { id: u.id, name: u.name, email: u.email, createdAt: u.created_at },
        stats: buildExpenseStats(expenses),
        expenses
    });
};

module.exports = {
    getUsers,
    getUserById,
    getUserStats
};
