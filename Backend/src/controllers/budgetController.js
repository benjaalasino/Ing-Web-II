const { db, getNextId } = require('../data/db');
const { CATEGORIES } = require('../constants/categories');
const { getMonthYear } = require('../utils/dateUtils');

const getBudgets = (req, res) => {
    const fallback = getMonthYear();
    const month = Number(req.query.month || fallback.month);
    const year = Number(req.query.year || fallback.year);

    const items = db.budgets.filter((item) => item.userId === req.auth.userId && item.month === month && item.year === year);
    res.json(items);
};

const createBudget = (req, res) => {
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

    const duplicated = db.budgets.some((item) => (
        item.userId === req.auth.userId
        && item.category === category
        && item.month === Number(month)
        && item.year === Number(year)
    ));

    if (duplicated) {
        res.status(400).json({ statusCode: 400, message: 'Ya tenes un presupuesto para esa categoria en este mes.' });
        return;
    }

    const newBudget = {
        id: getNextId('budgets'),
        userId: req.auth.userId,
        category,
        amount: parsedAmount,
        month: Number(month),
        year: Number(year),
        createdAt: new Date().toISOString()
    };

    db.budgets.push(newBudget);
    res.status(201).json(newBudget);
};

const updateBudget = (req, res) => {
    const budgetId = Number(req.params.id);
    const budget = db.budgets.find((item) => item.id === budgetId && item.userId === req.auth.userId);

    if (!budget) {
        res.status(404).json({ statusCode: 404, message: 'Presupuesto no encontrado.' });
        return;
    }

    const parsedAmount = Number(req.body.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ statusCode: 400, message: 'El monto debe ser mayor a cero.' });
        return;
    }

    budget.amount = parsedAmount;
    res.json(budget);
};

const deleteBudget = (req, res) => {
    const budgetId = Number(req.params.id);
    const index = db.budgets.findIndex((item) => item.id === budgetId && item.userId === req.auth.userId);

    if (index < 0) {
        res.status(404).json({ statusCode: 404, message: 'Presupuesto no encontrado.' });
        return;
    }

    db.budgets.splice(index, 1);
    res.json({ statusCode: 200, message: 'Presupuesto eliminado.' });
};

const getBudgetProgress = (req, res) => {
    const fallback = getMonthYear();
    const month = Number(req.query.month || fallback.month);
    const year = Number(req.query.year || fallback.year);

    const userBudgets = db.budgets.filter((item) => item.userId === req.auth.userId && item.month === month && item.year === year);

    const result = userBudgets.map((budget) => {
        const spent = db.expenses
            .filter((expense) => (
                expense.userId === req.auth.userId
                && expense.category === budget.category
                && new Date(expense.date).getMonth() + 1 === month
                && new Date(expense.date).getFullYear() === year
            ))
            .reduce((sum, expense) => sum + Number(expense.amount), 0);

        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
            budgetId: budget.id,
            category: budget.category,
            budgetAmount: budget.amount,
            spent,
            percentage
        };
    });

    res.json(result);
};

module.exports = {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress
};
