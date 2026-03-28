const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/profile', requireAuth, asyncHandler(getProfile));
router.put('/profile', requireAuth, asyncHandler(updateProfile));

module.exports = router;
