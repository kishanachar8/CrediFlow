const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const dbConfig = require('./config/db');
require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loanRoutes');
const emiRoutes = require('./routes/emiRoutes');

const app = express();
const PORT = process.env.PORT || 6000;

dbConfig();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const loggerMiddleware = require('./middlewares/loggerMiddleware');
app.use(loggerMiddleware);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'crediflow-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'lax',   
      secure: false,     
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
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

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other process or set a different PORT.`);
    process.exit(1);
  }
  console.error('Server error:', error);
  process.exit(1);
});
