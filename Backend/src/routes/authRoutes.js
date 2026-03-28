const express = require('express');
const { login, register } = require('../controllers/authController');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/auth/register', asyncHandler(register));
router.post('/auth/login', asyncHandler(login));

module.exports = router;
