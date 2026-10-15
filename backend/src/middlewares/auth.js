const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT protect middleware.
 * Reads Bearer token from Authorization header, verifies it,
 * and attaches the user object to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized — token invalid' });
  }
};

module.exports = { protect };
