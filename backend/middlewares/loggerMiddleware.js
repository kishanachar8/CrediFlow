const logger = (req, res, next) => {
  const { method, originalUrl, body } = req;
  const timestamp = new Date().toISOString();
  const safeBody = { ...body };

  if (safeBody.password) {
    safeBody.password = '*****';
  }

  console.log(`[${timestamp}] ${method} ${originalUrl} - body: ${JSON.stringify(safeBody)}`);
  next();
};

module.exports = logger;
