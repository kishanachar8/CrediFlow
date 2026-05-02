const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const config = require('./config/env');
const dbConfig = require('./config/db');

const loggerMiddleware = require('./middlewares/loggerMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const { sanitizeRequest } = require('./middlewares/securityMiddleware');
const { authLimiter } = require('./middlewares/rateLimiter');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loanRoutes');
const emiRoutes = require('./routes/emiRoutes');

const app = express();
const PORT = config.port;

app.use(morgan(config.env === 'production' ? 'combined' : 'dev', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(loggerMiddleware);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/emis', emiRoutes);

const clientDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.get('/', (req, res) => {
  res.json({ message: 'CrediFlow API is running' });
});

dbConfig();

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please stop the other process or set a different PORT.`);
    process.exit(1);
  }
  logger.error('Server error:', error);
  process.exit(1);
});
