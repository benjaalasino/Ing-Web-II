const express = require('express');
const { login, register, verifyEmail, resendVerification } = require('../controllers/authController');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/auth/register', asyncHandler(register));
router.post('/auth/login', asyncHandler(login));
router.post('/auth/verify-email', asyncHandler(verifyEmail));
router.post('/auth/resend-verification', asyncHandler(resendVerification));

module.exports = router;
