const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

const ACCESS_TOKEN_EXPIRY = config.accessTokenExpiry || '15m';
const REFRESH_TOKEN_EXPIRY = config.refreshTokenExpiry || '7d';

exports.createAccessToken = (payload) =>
  jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

exports.createRefreshToken = (payload) =>
  jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

exports.verifyAccessToken = (token) => jwt.verify(token, config.accessTokenSecret);
exports.verifyRefreshToken = (token) => jwt.verify(token, config.refreshTokenSecret);

exports.createTokenId = () => crypto.randomUUID();

exports.refreshTokenExpiryDate = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
