const authService = require('../services/authService');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const tokenService = require('../services/tokenService');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');
const User = require('../models/User');

const googleClient = new OAuth2Client(config.googleClientId);

const sendRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'none',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    const { accessToken, refreshToken } = await authService.issueTokens(user);
    sendRefreshTokenCookie(res, refreshToken);
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, accessToken });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.authenticate(req.body);
    const { accessToken, refreshToken } = await authService.issueTokens(user);
    sendRefreshTokenCookie(res, refreshToken);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, accessToken });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      const error = new Error('Refresh token missing');
      error.status = 401;
      throw error;
    }

    const payload = tokenService.verifyRefreshToken(oldRefreshToken);
    const storedToken = await refreshTokenRepository.findByTokenId(payload.tokenId);
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      const error = new Error('Refresh token invalid or revoked');
      error.status = 401;
      throw error;
    }

    const user = { id: payload.userId, name: payload.name, email: payload.email };
    const { refreshToken } = await authService.rotateRefreshToken(payload.tokenId, user);
    const accessToken = tokenService.createAccessToken({ userId: user.id, name: user.name, email: user.email });
    sendRefreshTokenCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      error.status = 401;
    }
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const payload = tokenService.verifyRefreshToken(refreshToken);
      await refreshTokenRepository.revokeByTokenId(payload.tokenId);
    }
    res.clearCookie('refreshToken', {
      path: '/api/auth',
      sameSite: 'none',
      secure: config.env === 'production',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      error.status = 401;
    }
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }
    res.json({ user: { id: req.user.userId, name: req.user.name, email: req.user.email } });
  } catch (error) {
    next(error);
  }
};

exports.googleCallback = async (req, res, next) => {
  try {
    // User is already authenticated by Passport
    // This handler is called after successful Google OAuth authentication
    res.redirect('/oauth-success');
  } catch (error) {
    next(error);
  }
};

exports.googleCallbackRedirect = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      const error = new Error('Google authentication failed');
      error.status = 401;
      throw error;
    }

    const { accessToken, refreshToken } = await authService.issueTokens(user);
    sendRefreshTokenCookie(res, refreshToken);
    
    // Redirect to frontend with token (for SPA)
    const redirectUrl = `${config.clientOrigin || 'http://localhost:5173'}?accessToken=${accessToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

exports.getGoogleCallbackToken = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      const error = new Error('User not authenticated');
      error.status = 401;
      throw error;
    }

    const { accessToken, refreshToken } = await authService.issueTokens(user);
    sendRefreshTokenCookie(res, refreshToken);
    
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture },
      accessToken 
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyGoogleToken = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      const error = new Error('Google credential missing');
      error.status = 400;
      throw error;
    }

    // Verify the Google JWT token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      const error = new Error('Google credential payload does not contain an email.');
      error.status = 400;
      throw error;
    }

    // Find or create user
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // Check if user exists by email
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = payload.sub;
        user.provider = 'google';
        if (!user.profilePicture && payload.picture) {
          user.profilePicture = payload.picture;
        }
      } else {
        // Create new user
        user = new User({
          googleId: payload.sub,
          name: payload.name,
          email,
          provider: 'google',
          profilePicture: payload.picture,
        });
      }
      await user.save();
    }

    // Issue tokens
    const { accessToken, refreshToken } = await authService.issueTokens(user);
    sendRefreshTokenCookie(res, refreshToken);

    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture },
      accessToken 
    });
  } catch (error) {
    if (error.message.includes('Token used too late')) {
      error.message = 'Google token expired. Please try again.';
      error.status = 401;
    } else if (error.message.includes('Token used too early') || error.message.includes('Unexpected token')) {
      error.message = 'Invalid Google token';
      error.status = 401;
    } else if (error.message.includes('invalid_client')) {
      error.message = 'Google OAuth client ID is invalid. Check GOOGLE_CLIENT_ID and make sure it matches the configured OAuth client.';
      error.status = 401;
    }
    next(error);
  }
};
