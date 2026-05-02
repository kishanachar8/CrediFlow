const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 6000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crediflow',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'crediflow-access-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'crediflow-refresh-secret',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  csrfCookieName: process.env.CSRF_COOKIE_NAME || 'XSRF-TOKEN',
  logLevel: process.env.LOG_LEVEL || 'info',
};
