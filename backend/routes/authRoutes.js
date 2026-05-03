const express = require('express');
const csrf = require('csurf');
const passport = require('passport');
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

const googleRedirectEnabled = Boolean(config.googleClientId && config.googleClientSecret);
const googleTokenEnabled = Boolean(config.googleClientId);
const googleNotConfigured = (req, res) => {
  res.status(503).json({ message: 'Google OAuth is not configured on this server.' });
};

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', csrfProtection, asyncHandler(authController.refresh));
router.post('/logout', csrfProtection, asyncHandler(authController.logout));
router.get('/profile', authMiddleware.ensureAuthenticated, asyncHandler(authController.profile));
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Google OAuth Routes (frontend credential exchange)
if (googleRedirectEnabled) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
    asyncHandler(authController.googleCallbackRedirect)
  );
} else {
  router.get('/google', googleNotConfigured);
  router.get('/google/callback', googleNotConfigured);
}

if (googleTokenEnabled) {
  router.post('/google/token', asyncHandler(authController.verifyGoogleToken));
} else {
  router.post('/google/token', googleNotConfigured);
}

router.get('/google/token', authMiddleware.ensureAuthenticated, asyncHandler(authController.getGoogleCallbackToken));

module.exports = router;
