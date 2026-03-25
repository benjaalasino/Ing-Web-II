const express = require('express');
const { getRecommendations, createRecommendation } = require('../controllers/recommendationController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/recommendations', requireAuth, getRecommendations);
router.post('/recommendations', requireAuth, createRecommendation);

module.exports = router;
