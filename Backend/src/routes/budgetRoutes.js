const express = require('express');
const {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress
} = require('../controllers/budgetController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/budgets', requireAuth, asyncHandler(getBudgets));
router.get('/budgets/progress', requireAuth, asyncHandler(getBudgetProgress));
router.post('/budgets', requireAuth, asyncHandler(createBudget));
router.put('/budgets/:id', requireAuth, asyncHandler(updateBudget));
router.delete('/budgets/:id', requireAuth, asyncHandler(deleteBudget));

module.exports = router;
