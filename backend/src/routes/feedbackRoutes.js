const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// GET /feedback
// Query: userId (ratings given by user) or providerId (ratings received by provider)
router.get('/', async (req, res) => {
  try {
    const { userId, providerId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (providerId) filter.providerId = providerId;
    if (!userId && !providerId) {
      return res.status(400).json({ message: 'userId or providerId is required' });
    }

    const items = await Feedback.find(filter)
      .populate('userId', 'name email')
      .populate('providerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = items.map(f => ({
      _id: f._id,
      rating: f.rating,
      comment: f.comment || '',
      userId: f.userId?._id || null,
      userName: f.userId?.name || '',
      providerId: f.providerId?._id || null,
      providerName: f.providerId?.name || '',
      createdAt: f.createdAt
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ message: 'Failed to load feedback' });
  }
});

module.exports = router;
