const express = require('express');
const bcrypt = require('bcryptjs');
const ServiceProvider = require('../models/ServiceProvider');
const router = express.Router();

// Register provider
router.post('/register', async (req, res) => {
  try {
    console.log('Incoming provider registration:', req.body);
    const { name, email, password, phone, address, services, experience } = req.body;

    const existingProvider = await ServiceProvider.findOne({ email });
    console.log('Existing provider found:', existingProvider);
    if (existingProvider) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const provider = new ServiceProvider({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      services,
      experience
    });

    await provider.save();
    console.log('Provider saved:', provider);
    res.status(201).json({ message: 'Provider registered successfully', provider });

  } catch (err) {
    console.error('Provider registration error:', err);
    res.status(500).json({ message: 'Failed to register provider' });
  }
});

// Update provider profile
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, experience, services } = req.body || {};
    const update = {};
    if (typeof name !== 'undefined') update.name = name;
    if (typeof phone !== 'undefined') update.phone = phone;
    if (typeof address !== 'undefined') update.address = address;
    if (typeof experience !== 'undefined') update.experience = experience;
    if (typeof services !== 'undefined') update.services = services;
    const provider = await ServiceProvider.findByIdAndUpdate(id, { $set: update }, { new: true }).select('-password');
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    console.error('Update provider error:', err);
    res.status(500).json({ message: 'Failed to update provider' });
  }
});

// GET /provider/:id - fetch provider profile (sanitized)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await ServiceProvider.findById(id).select('-password');
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    // Ensure rating fields are in sync with feedback
    const mongoose = require('mongoose');
    const provObjId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
    const Feedback = require('../models/Feedback');
    const agg = await Feedback.aggregate([
      { $match: { providerId: provObjId } },
      { $group: { _id: '$providerId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avg = agg[0]?.avg || 0;
    const count = agg[0]?.count || 0;
    if (Number(provider.rating)?.toFixed?.(2) !== Number(avg).toFixed(2) || (provider.ratingCount || 0) !== count) {
      provider.rating = Number(avg.toFixed(2));
      provider.ratingCount = count;
      await provider.save();
    }

    const out = provider.toObject();
    delete out.password;
    res.json(out);
  } catch (err) {
    console.error('Fetch provider error:', err);
    res.status(500).json({ message: 'Failed to fetch provider' });
  }
});

module.exports = router;
