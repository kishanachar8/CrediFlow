const passport = require('passport');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = new User({ name, email, password });
    await user.save();

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Registration succeeded but login failed' });
      }
      res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.json({ user: { id: user.id, name: user.name, email: user.email } });
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
};

exports.profile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
};
