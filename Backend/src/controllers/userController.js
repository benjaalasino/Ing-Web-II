const { db } = require('../data/db');
const { buildExpenseStats } = require('../utils/expenseStats');

const getUsers = (req, res) => {
    const users = db.users
        .filter((user) => user.role === 'user')
        .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }));

    res.json(users);
};

const getUserById = (req, res) => {
    const userId = Number(req.params.id);
    const user = db.users.find((item) => item.id === userId && item.role === 'user');

    if (!user) {
        res.status(404).json({ statusCode: 404, message: 'Usuario no encontrado.' });
        return;
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    });
};

const getUserStats = (req, res) => {
    const userId = Number(req.params.id);
    const user = db.users.find((item) => item.id === userId && item.role === 'user');

    if (!user) {
        res.status(404).json({ statusCode: 404, message: 'Usuario no encontrado.' });
        return;
    }

    const expenses = db.expenses
        .filter((item) => item.userId === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        },
        stats: buildExpenseStats(expenses),
        expenses
    });
};

module.exports = {
    getUsers,
    getUserById,
    getUserStats
};
