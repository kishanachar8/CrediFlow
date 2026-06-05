const Joi = require('joi');

exports.registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

exports.updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().required(),
});

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().allow('', null),
  newPassword: Joi.string().min(8).required(),
});
