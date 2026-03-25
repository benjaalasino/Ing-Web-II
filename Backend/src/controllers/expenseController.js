const { db, getNextId } = require('../data/db');
const { CATEGORIES } = require('../constants/categories');
const { buildExpenseStats } = require('../utils/expenseStats');

const toNumber = (value) => Number.parseFloat(value);

const getExpenseOwnerId = (req) => {
    if (req.auth.role === 'advisor' && req.query.userId) {
        return Number(req.query.userId);
    }
    return req.auth.userId;
};

const getExpenses = (req, res) => {
    const ownerId = getExpenseOwnerId(req);
    const { category, month, year, commerce, limit } = req.query;

    let items = db.expenses.filter((expense) => expense.userId === ownerId);

    if (category) {
        items = items.filter((expense) => expense.category === category);
    }

    if (month) {
        items = items.filter((expense) => new Date(expense.date).getMonth() + 1 === Number(month));
    }

    if (year) {
        items = items.filter((expense) => new Date(expense.date).getFullYear() === Number(year));
    }

    if (commerce) {
        const search = String(commerce).toLowerCase();
        items = items.filter((expense) => expense.commerce.toLowerCase().includes(search));
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (limit) {
        items = items.slice(0, Number(limit));
    }

    res.json(items);
};

const createExpense = (req, res) => {
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

    const newExpense = {
        id: getNextId('expenses'),
        userId: req.auth.userId,
        commerce: String(commerce).trim(),
        date,
        amount: parsedAmount,
        category,
        description: description ? String(description).trim() : '',
        imageUrl,
        createdAt: new Date().toISOString()
    };

    db.expenses.push(newExpense);
    res.status(201).json(newExpense);
};

const updateExpense = (req, res) => {
    const id = Number(req.params.id);
    const expense = db.expenses.find((item) => item.id === id && item.userId === req.auth.userId);

    if (!expense) {
        res.status(404).json({ statusCode: 404, message: 'Gasto no encontrado.' });
        return;
    }

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

    expense.commerce = String(commerce).trim();
    expense.date = date;
    expense.amount = parsedAmount;
    expense.category = category;
    expense.description = description ? String(description).trim() : '';

    res.json(expense);
};

const deleteExpense = (req, res) => {
    const id = Number(req.params.id);
    const index = db.expenses.findIndex((item) => item.id === id && item.userId === req.auth.userId);

    if (index < 0) {
        res.status(404).json({ statusCode: 404, message: 'Gasto no encontrado.' });
        return;
    }

    db.expenses.splice(index, 1);
    res.json({ statusCode: 200, message: 'Gasto eliminado.' });
};

const getExpenseStats = (req, res) => {
    const ownerId = getExpenseOwnerId(req);
    const items = db.expenses.filter((expense) => expense.userId === ownerId);
    res.json(buildExpenseStats(items));
};

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats
};
