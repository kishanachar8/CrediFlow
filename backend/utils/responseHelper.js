const setResponseHeaders = (res, message, status = 'success') => {
  res.set('X-Operation-Status', status);
  res.set('X-Response-Message', message);
};

const sendSuccess = (res, message, payload = {}, statusCode = 200) => {
  setResponseHeaders(res, message, 'success');
  return res.status(statusCode).json({ success: true, message, ...payload });
};

module.exports = {
  sendSuccess,
  setResponseHeaders,
};
