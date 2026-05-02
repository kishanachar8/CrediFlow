const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');

module.exports = {
  sanitizeRequest: [mongoSanitize(), xssClean()],
};
