const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.warn(`Backend .env file not found at ${envPath}. Create one or copy backend/.env.example.`);
}
dotenv.config({ path: envPath });

const rawGoogleClientId = process.env.GOOGLE_CLIENT_ID || '';
const rawGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const googleClientId = rawGoogleClientId.includes('YOUR_GOOGLE_CLIENT_ID') ? '' : rawGoogleClientId;
const googleClientSecret = rawGoogleClientSecret.includes('YOUR_GOOGLE_CLIENT_SECRET') ? '' : rawGoogleClientSecret;

if (!googleClientId) {
  console.warn('Google OAuth disabled: GOOGLE_CLIENT_ID is not set or still a placeholder.');
} else if (!googleClientSecret) {
  console.warn('Google OAuth redirect flow disabled: GOOGLE_CLIENT_SECRET is not set or still a placeholder. Direct token exchange may still work if the client ID is valid.');
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crediflow',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' || 'https://blptr6v0-5173.inc1.devtunnels.ms',
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'crediflow-access-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'crediflow-refresh-secret',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  csrfCookieName: process.env.CSRF_COOKIE_NAME || 'XSRF-TOKEN',
  logLevel: process.env.LOG_LEVEL || 'info',
  googleClientId,
  googleClientSecret,
};
