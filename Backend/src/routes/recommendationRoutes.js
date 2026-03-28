const express = require('express');
const { getRecommendations, createRecommendation } = require('../controllers/recommendationController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/recommendations', requireAuth, asyncHandler(getRecommendations));
router.post('/recommendations', requireAuth, asyncHandler(createRecommendation));

module.exports = router;
