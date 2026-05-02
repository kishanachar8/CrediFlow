const express = require('express');
const csrf = require('csurf');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validationMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const config = require('../config/env');

const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: false,
    secure: config.env === 'production',
    sameSite: 'strict',
  },
});

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', csrfProtection, asyncHandler(authController.refresh));
router.post('/logout', csrfProtection, asyncHandler(authController.logout));
router.get('/profile', authMiddleware.ensureAuthenticated, asyncHandler(authController.profile));
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;
