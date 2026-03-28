const express = require('express');
const {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats
} = require('../controllers/expenseController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/expenses', requireAuth, asyncHandler(getExpenses));
router.get('/expenses/stats', requireAuth, asyncHandler(getExpenseStats));
router.post('/expenses', requireAuth, asyncHandler(createExpense));
router.put('/expenses/:id', requireAuth, asyncHandler(updateExpense));
router.delete('/expenses/:id', requireAuth, asyncHandler(deleteExpense));

module.exports = router;
