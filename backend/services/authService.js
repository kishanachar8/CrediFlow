const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const tokenService = require('./tokenService');

exports.register = async ({ name, email, password }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error(
      existingUser.provider === 'google'
        ? 'Email already registered with Google. Please log in using Google.'
        : 'Email already in use'
    );
    error.status = 409;
    throw error;
  }

  const user = await userRepository.createUser({ name, email, password });
  return user;
};

exports.authenticate = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  if (user.provider === 'google') {
    const error = new Error('This email is registered with Google. Please sign in with Google.');
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return user;
};

exports.issueTokens = async (user) => {
  const tokenId = tokenService.createTokenId();
  const payload = { userId: user.id, name: user.name, email: user.email, tokenId };
  const refreshToken = tokenService.createRefreshToken(payload);
  const accessToken = tokenService.createAccessToken({ userId: user.id, name: user.name, email: user.email });
  await refreshTokenRepository.create({
    tokenId,
    user: user.id,
    expiresAt: tokenService.refreshTokenExpiryDate(),
  });
  return { accessToken, refreshToken, tokenId };
};

exports.rotateRefreshToken = async (oldTokenId, user) => {
  const replacedByToken = tokenService.createTokenId();
  const payload = { userId: user.id, name: user.name, email: user.email, tokenId: replacedByToken };
  const refreshToken = tokenService.createRefreshToken(payload);
  await refreshTokenRepository.revokeByTokenId(oldTokenId, replacedByToken);
  await refreshTokenRepository.create({
    tokenId: replacedByToken,
    user: user.id,
    expiresAt: tokenService.refreshTokenExpiryDate(),
  });
  return { refreshToken, replacedByToken };
};

exports.authenticateOAuth = async (user) => {
  // User is already created or updated by the Google strategy in passport.js
  // Just return the user as-is
  return user;
};
