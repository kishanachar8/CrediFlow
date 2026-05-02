const User = require('../models/User');

exports.findByEmail = (email) => User.findOne({ email });
exports.findById = (id) => User.findById(id);
exports.createUser = (userData) => User.create(userData);
