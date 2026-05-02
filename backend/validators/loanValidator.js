const Joi = require('joi');

exports.createLoanSchema = Joi.object({
  principal: Joi.number().min(0).allow(null),
  monthlyEmi: Joi.number().min(0).allow(null),
  termMonths: Joi.number().integer().min(1).required(),
  startDate: Joi.date().optional().allow(null, ''),
}).or('principal', 'monthlyEmi');
