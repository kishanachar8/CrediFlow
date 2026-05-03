const User = require('../models/User');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

exports.findByEmail = (email) => User.findOne({ email: normalizeEmail(email) });
exports.findById = (id) => User.findById(id);
exports.createUser = (userData) => User.create({
  ...userData,
  email: normalizeEmail(userData.email),
});
