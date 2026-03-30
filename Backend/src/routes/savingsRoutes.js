const express = require('express');
const {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    depositToGoal,
    deleteSavingsGoal
} = require('../controllers/savingsController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/savings', requireAuth, asyncHandler(getSavingsGoals));
router.post('/savings', requireAuth, asyncHandler(createSavingsGoal));
router.put('/savings/:id', requireAuth, asyncHandler(updateSavingsGoal));
router.patch('/savings/:id/deposit', requireAuth, asyncHandler(depositToGoal));
router.delete('/savings/:id', requireAuth, asyncHandler(deleteSavingsGoal));

module.exports = router;
