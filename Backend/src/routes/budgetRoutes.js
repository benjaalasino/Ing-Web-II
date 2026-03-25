const express = require('express');
const {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress
} = require('../controllers/budgetController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/budgets', requireAuth, getBudgets);
router.get('/budgets/progress', requireAuth, getBudgetProgress);
router.post('/budgets', requireAuth, createBudget);
router.put('/budgets/:id', requireAuth, updateBudget);
router.delete('/budgets/:id', requireAuth, deleteBudget);

module.exports = router;
