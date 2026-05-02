const RefreshToken = require('../models/RefreshToken');

exports.create = (refreshTokenData) => RefreshToken.create(refreshTokenData);
exports.findByTokenId = (tokenId) => RefreshToken.findOne({ tokenId });
exports.revokeByTokenId = (tokenId, replacedByToken = null) =>
  RefreshToken.findOneAndUpdate({ tokenId }, { revoked: true, replacedByToken }, { new: true });
exports.deleteByUser = (userId) => RefreshToken.deleteMany({ user: userId });
