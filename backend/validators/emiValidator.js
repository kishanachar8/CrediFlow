const Joi = require('joi');

exports.emiIdParamSchema = Joi.object({
  emiId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

exports.loanIdParamSchema = Joi.object({
  loanId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});
