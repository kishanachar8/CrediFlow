const authService = require('../services/authService');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const tokenService = require('../services/tokenService');

const sendRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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
    res.clearCookie('refreshToken', { path: '/api/auth' });
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
