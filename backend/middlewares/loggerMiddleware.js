const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const { method, originalUrl, body } = req;
  const safeBody = { ...body };

  if (safeBody.password) {
    safeBody.password = '*****';
  }

  logger.info('%s %s - body: %s', method, originalUrl, JSON.stringify(safeBody));
  next();
};

module.exports = requestLogger;
