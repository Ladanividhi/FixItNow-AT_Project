const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const ServiceProvider = require("../models/ServiceProvider");

exports.registerProvider = async (req, res) => {
  try {
    const { name, email, password, phone, address, services, experience } = req.body;

    const exists = await ServiceProvider.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const provider = await ServiceProvider.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      services,
      experience
    });

    res.status(201).json({ message: "Provider registered successfully", provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, address, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    console.log('Creating user with data:', { name, email, phone, address, role: role || 'USER' });
    const user = await User.create({ name, email, password: hashed, phone, address, role: role || 'USER' });
    console.log('User created successfully:', user);

    const token = signToken(user);
    console.log('Token generated successfully');
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
