const express = require('express');
const {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats
} = require('../controllers/expenseController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/expenses', requireAuth, getExpenses);
router.get('/expenses/stats', requireAuth, getExpenseStats);
router.post('/expenses', requireAuth, createExpense);
router.put('/expenses/:id', requireAuth, updateExpense);
router.delete('/expenses/:id', requireAuth, deleteExpense);

module.exports = router;
