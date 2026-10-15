const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Sign a JWT valid for 30 days */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user, return JWT
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, error: 'An account with that email already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate user, return JWT
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Explicitly select password since schema has select: false
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route  GET /api/auth/me
 * @desc   Get current logged-in user
 * @access Private
 */
const getMe = async (req, res) => {
  const { _id, name, email, createdAt } = req.user;
  res.json({ success: true, data: { _id, name, email, createdAt } });
};

module.exports = { register, login, getMe };
