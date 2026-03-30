const { pool } = require('../data/db');

const mapGoal = (row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline ? row.deadline.toISOString().split('T')[0] : null,
    createdAt: row.created_at
});

const getSavingsGoals = async (req, res) => {
    const { rows } = await pool.query(
        'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
        [req.auth.userId]
    );
    res.json(rows.map(mapGoal));
};

const createSavingsGoal = async (req, res) => {
    const { title, targetAmount, deadline } = req.body;

    if (!title || !title.trim()) {
        res.status(400).json({ statusCode: 400, message: 'El titulo es obligatorio.' });
        return;
    }

    const parsedAmount = Number(targetAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto objetivo debe ser mayor a cero.' });
        return;
    }

    if (deadline) {
        const parsedDate = new Date(deadline);
        if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
            res.status(400).json({ statusCode: 400, message: 'La fecha limite debe ser una fecha futura.' });
            return;
        }
    }

    const { rows } = await pool.query(
        `INSERT INTO savings_goals (user_id, title, target_amount, deadline)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.auth.userId, title.trim(), parsedAmount, deadline || null]
    );

    res.status(201).json(mapGoal(rows[0]));
};

const updateSavingsGoal = async (req, res) => {
    const goalId = Number(req.params.id);
    const { title, targetAmount, deadline } = req.body;

    const { rows: existing } = await pool.query(
        'SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2',
        [goalId, req.auth.userId]
    );

    if (existing.length === 0) {
        res.status(404).json({ statusCode: 404, message: 'Meta no encontrada.' });
        return;
    }

    const newTitle = title !== undefined ? title.trim() : existing[0].title;
    const newAmount = targetAmount !== undefined ? Number(targetAmount) : Number(existing[0].target_amount);
    const newDeadline = deadline !== undefined ? deadline || null : existing[0].deadline;

    if (!newTitle) {
        res.status(400).json({ statusCode: 400, message: 'El titulo es obligatorio.' });
        return;
    }

    if (!Number.isFinite(newAmount) || newAmount <= 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto objetivo debe ser mayor a cero.' });
        return;
    }

    const { rows } = await pool.query(
        `UPDATE savings_goals SET title = $1, target_amount = $2, deadline = $3
         WHERE id = $4 AND user_id = $5 RETURNING *`,
        [newTitle, newAmount, newDeadline, goalId, req.auth.userId]
    );

    res.json(mapGoal(rows[0]));
};

const depositToGoal = async (req, res) => {
    const goalId = Number(req.params.id);
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount === 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto debe ser distinto de cero.' });
        return;
    }

    const { rows } = await pool.query(
        `UPDATE savings_goals
         SET current_amount = GREATEST(0, current_amount + $1)
         WHERE id = $2 AND user_id = $3 RETURNING *`,
        [amount, goalId, req.auth.userId]
    );

    if (rows.length === 0) {
        res.status(404).json({ statusCode: 404, message: 'Meta no encontrada.' });
        return;
    }

    res.json(mapGoal(rows[0]));
};

const deleteSavingsGoal = async (req, res) => {
    const goalId = Number(req.params.id);
    const { rowCount } = await pool.query(
        'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2',
        [goalId, req.auth.userId]
    );

    if (rowCount === 0) {
        res.status(404).json({ statusCode: 404, message: 'Meta no encontrada.' });
        return;
    }

    res.json({ statusCode: 200, message: 'Meta eliminada.' });
};

module.exports = {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    depositToGoal,
    deleteSavingsGoal
};
