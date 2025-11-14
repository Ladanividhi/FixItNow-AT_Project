const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const { registerProvider, register } = require("../controllers/authController");

// Provider Registration
router.post("/provider-register", registerProvider);

// User Registration
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
], register);

// User Login (including provider login fallback)
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    // Try User first
    let user = await User.findOne({ email });
    let role = 'user';

    if (!user) {
      // Try ServiceProvider
      user = await ServiceProvider.findOne({ email });
      role = 'provider';
    }

    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;
    userObj.role = role;

    res.json({ token, user: userObj });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Provider Login (if you want a separate endpoint)
router.post('/provider-login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const provider = await ServiceProvider.findOne({ email });
    if (!provider) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: provider._id, email: provider.email, role: 'provider' },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '7d' }
    );

    const providerObj = provider.toObject();
    delete providerObj.password;
    providerObj.role = 'provider';

    res.json({ token, user: providerObj });
  } catch (error) {
    console.error('Provider Login Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// PATCH /auth/user/:id - update user profile (name, phone, address)
router.patch('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body || {};
    const update = {};
    if (typeof name !== 'undefined') update.name = name;
    if (typeof phone !== 'undefined') update.phone = phone;
    if (typeof address !== 'undefined') update.address = address;

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const obj = user.toObject();
    delete obj.password;
    res.json(obj);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

module.exports = router;
