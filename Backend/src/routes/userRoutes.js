const express = require('express');
const { getUsers, getUserById, getUserStats } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/users', requireAuth, requireRole('advisor'), asyncHandler(getUsers));
router.get('/users/:id', requireAuth, requireRole('advisor'), asyncHandler(getUserById));
router.get('/users/:id/stats', requireAuth, requireRole('advisor'), asyncHandler(getUserStats));

module.exports = router;
