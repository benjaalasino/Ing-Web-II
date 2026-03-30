const { pool } = require('../data/db');
const { CATEGORIES } = require('../constants/categories');
const { getMonthYear } = require('../utils/dateUtils');

const mapBudget = (row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    amount: Number(row.amount),
    month: row.month,
    year: row.year,
    createdAt: row.created_at
});

const getBudgets = async (req, res) => {
    const fallback = getMonthYear();
    const month = Number(req.query.month || fallback.month);
    const year = Number(req.query.year || fallback.year);

    const { rows } = await pool.query(
        'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
        [req.auth.userId, month, year]
    );
    res.json(rows.map(mapBudget));
};

const createBudget = async (req, res) => {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
        res.status(400).json({ statusCode: 400, message: 'Categoria, monto, mes y ano son obligatorios.' });
        return;
    }

    if (!CATEGORIES.includes(category)) {
        res.status(400).json({ statusCode: 400, message: 'Categoria invalida.' });
        return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto debe ser mayor a cero.' });
        return;
    }

    const { rows: dup } = await pool.query(
        'SELECT id FROM budgets WHERE user_id = $1 AND category = $2 AND month = $3 AND year = $4',
        [req.auth.userId, category, Number(month), Number(year)]
    );

    if (dup.length > 0) {
        res.status(400).json({ statusCode: 400, message: 'Ya tenes un presupuesto para esa categoria en este mes.' });
        return;
    }

    const { rows } = await pool.query(
        `INSERT INTO budgets (user_id, category, amount, month, year) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.auth.userId, category, parsedAmount, Number(month), Number(year)]
    );

    res.status(201).json(mapBudget(rows[0]));
};

const updateBudget = async (req, res) => {
    const budgetId = Number(req.params.id);
    const parsedAmount = Number(req.body.amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto debe ser mayor a cero.' });
        return;
    }

    const { rows } = await pool.query(
        'UPDATE budgets SET amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [parsedAmount, budgetId, req.auth.userId]
    );

    if (rows.length === 0) {
        res.status(404).json({ statusCode: 404, message: 'Presupuesto no encontrado.' });
        return;
    }

    res.json(mapBudget(rows[0]));
};

const deleteBudget = async (req, res) => {
    const budgetId = Number(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [budgetId, req.auth.userId]);

    if (rowCount === 0) {
        res.status(404).json({ statusCode: 404, message: 'Presupuesto no encontrado.' });
        return;
    }

    res.json({ statusCode: 200, message: 'Presupuesto eliminado.' });
};

const getBudgetProgress = async (req, res) => {
    const fallback = getMonthYear();
    const month = Number(req.query.month || fallback.month);
    const year = Number(req.query.year || fallback.year);

    const { rows: userBudgets } = await pool.query(
        'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
        [req.auth.userId, month, year]
    );

    const result = [];
    for (const budget of userBudgets) {
        const { rows: spentRows } = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS spent FROM expenses
             WHERE user_id = $1 AND category = $2 AND EXTRACT(MONTH FROM date) = $3 AND EXTRACT(YEAR FROM date) = $4`,
            [req.auth.userId, budget.category, month, year]
        );
        const spent = Number(spentRows[0].spent);
        const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0;

        result.push({
            budgetId: budget.id,
            category: budget.category,
            budgetAmount: Number(budget.amount),
            spent,
            percentage
        });
    }

    res.json(result);
};

const getBudgetPredictions = async (req, res) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const month = Number(req.query.month || currentMonth);
    const year = Number(req.query.year || currentYear);

    if (month !== currentMonth || year !== currentYear) {
        res.json([]);
        return;
    }

    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const { rows: userBudgets } = await pool.query(
        'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
        [req.auth.userId, month, year]
    );

    const predictions = [];
    for (const budget of userBudgets) {
        const { rows: spentRows } = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS spent FROM expenses
             WHERE user_id = $1 AND category = $2 AND EXTRACT(MONTH FROM date) = $3 AND EXTRACT(YEAR FROM date) = $4`,
            [req.auth.userId, budget.category, month, year]
        );

        const spent = Number(spentRows[0].spent);
        const budgetAmount = Number(budget.amount);
        const dailyRate = dayOfMonth > 0 ? spent / dayOfMonth : 0;
        const projectedTotal = dailyRate * totalDaysInMonth;
        const daysUntilOver = dailyRate > 0 ? (budgetAmount - spent) / dailyRate : null;

        let status = 'on_track';
        if (projectedTotal > budgetAmount) {
            status = 'danger';
        } else if (projectedTotal > budgetAmount * 0.85) {
            status = 'warning';
        }

        if (daysUntilOver !== null && daysUntilOver < 5 && daysUntilOver >= 0) {
            status = 'danger';
        }

        predictions.push({
            budgetId: budget.id,
            category: budget.category,
            budgetAmount,
            spent,
            dailyRate: Math.round(dailyRate),
            projectedTotal: Math.round(projectedTotal),
            daysUntilOver: daysUntilOver !== null ? Math.max(0, Math.round(daysUntilOver)) : null,
            daysRemaining: totalDaysInMonth - dayOfMonth,
            status
        });
    }

    res.json(predictions.filter((p) => p.status !== 'on_track' || p.projectedTotal > 0));
};

module.exports = {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress,
    getBudgetPredictions
};
