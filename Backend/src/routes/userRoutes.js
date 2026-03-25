const express = require('express');
const { getUsers, getUserById, getUserStats } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/users', requireAuth, requireRole('advisor'), getUsers);
router.get('/users/:id', requireAuth, requireRole('advisor'), getUserById);
router.get('/users/:id/stats', requireAuth, requireRole('advisor'), getUserStats);

module.exports = router;
