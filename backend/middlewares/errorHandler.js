const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error('%s %s %s', req.method, req.originalUrl, err.stack || err.message || err);

  const status = err.status || 500;
  const message = err.isJoi ? err.details.map((detail) => detail.message).join(', ') : err.message || 'Internal server error';

  res.status(status).json({ message });
};
