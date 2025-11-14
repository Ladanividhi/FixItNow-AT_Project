const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Feedback = require('../models/Feedback');
const ServiceProvider = require('../models/ServiceProvider');

// Utility to normalize common status inputs
const normalizeStatus = (s) => {
  if (!s) return s;
  const map = {
    'pending': 'Pending',
    'accepted': 'Accepted',
    'in progress': 'In Progress',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled'
  };
  const key = String(s).toLowerCase();
  return map[key] || s;
};

// GET /requests
// Query params:
// - userId: filter by requesting user
// - status: single or multiple (e.g., status=Pending or status=Pending&status=Accepted)
// - q: search term (service, subservice, address, provider/user name)
router.get('/', async (req, res) => {
  try {
    const { userId, providerId, q } = req.query;
    let { status } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (providerId) filter.providerId = providerId;

    if (typeof status !== 'undefined') {
      const statuses = Array.isArray(status) ? status : [status];
      const normalized = statuses.map(normalizeStatus);
      filter.status = { $in: normalized };
    }

    if (q && String(q).trim().length > 0) {
      const re = new RegExp(String(q).trim(), 'i');
      filter.$or = [
        { service: re },
        { subservice: re },
        { address: re },
        // Note: provider/user names are filtered post-populate below
      ];
    }

    const requests = await Request.find(filter)
      .populate('providerId', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Map to frontend shape with providerName/userName derived from population
    let mapped = requests.map(r => ({
      _id: r._id,
      service: r.service,
      subservice: r.subservice,
      status: (r.status || '').toString(),
      providerId: r.providerId?._id || r.providerId || null,
      providerName: r.providerId?.name || '',
      userId: r.userId?._id || r.userId || null,
      userName: r.userId?.name || '',
      scheduledFor: r.scheduledFor,
      address: r.address,
      description: r.description || r.decription || '',
      cancelReason: r.cancelReason || ''
    }));

    // If q provided, also match against providerName and userName client-visible fields
    if (q && String(q).trim().length > 0) {
      const qLower = String(q).trim().toLowerCase();
      mapped = mapped.filter(r =>
        (r.providerName && r.providerName.toLowerCase().includes(qLower)) ||
        (r.userName && r.userName.toLowerCase().includes(qLower)) ||
        (r._id && String(r._id).toLowerCase().includes(qLower))
      );
    }

    res.json(mapped);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Failed to load requests' });
  }
});

// (Old duplicate accept/decline routes removed)

// PATCH /requests/:id/accept - provider accepts a request
router.patch('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Request.findByIdAndUpdate(
      id,
      { $set: { status: 'Accepted', acceptedAt: new Date(), declineReason: undefined, declinedAt: undefined } },
      { new: true }
    ).populate('providerId', 'name').populate('userId', 'name');
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request accepted', request: updated });
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ message: 'Failed to accept request' });
  }
});

// PATCH /requests/:id/decline - provider/admin declines a request
router.patch('/:id/decline', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'provider_declined' } = req.body || {};
    const updated = await Request.findByIdAndUpdate(
      id,
      { $set: { status: 'Declined', cancelReason: reason, declinedAt: new Date() } },
      { new: true }
    ).populate('providerId', 'name').populate('userId', 'name');
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request declined', request: updated });
  } catch (err) {
    console.error('Decline request error:', err);
    res.status(500).json({ message: 'Failed to decline request' });
  }
});

// GET /requests/notifications?userId=
// Returns recent acceptance/decline notifications for a user
router.get('/notifications', async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const notifs = await Request.find({ userId, status: { $in: ['Accepted', 'Declined'] } })
      .populate('providerId', 'name')
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const mapped = notifs.map(r => ({
      requestId: r._id,
      service: r.service,
      subservice: r.subservice,
      providerName: r.providerId?.name || 'Provider',
      status: r.status,
      reason: r.cancelReason || '',
      at: r.acceptedAt || r.declinedAt || r.updatedAt || r.createdAt
    }));

    res.json({ notifications: mapped });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PATCH /requests/:id/complete - user marks request as completed; optional rating
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, userId, providerId } = req.body || {};

    const updated = await Request.findByIdAndUpdate(
      id,
      { $set: { status: 'Completed' } },
      { new: true }
    ).populate('providerId', 'name').populate('userId', 'name');

    if (!updated) return res.status(404).json({ message: 'Request not found' });

    let feedback = null;
    if (rating && userId && (providerId || updated.providerId)) {
      const provIdRaw = providerId || (updated.providerId && updated.providerId._id) || updated.providerId;
      const mongoose = require('mongoose');
      const provObjId = typeof provIdRaw === 'string' ? new mongoose.Types.ObjectId(provIdRaw) : provIdRaw;
      feedback = await Feedback.create({
        userId,
        providerId: provObjId,
        rating: Math.max(1, Math.min(5, Number(rating))),
        comment: comment || ''
      });

      // Recompute provider average and count
      const agg = await Feedback.aggregate([
        { $match: { providerId: provObjId } },
        { $group: { _id: '$providerId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      const avg = agg[0]?.avg || 0;
      const count = agg[0]?.count || 0;
      await ServiceProvider.findByIdAndUpdate(provObjId, { $set: { rating: Number(avg.toFixed(2)), ratingCount: count } });
    }

    res.json({ message: 'Request marked as completed', request: updated, feedback });
  } catch (err) {
    console.error('Complete request error:', err);
    res.status(500).json({ message: 'Failed to complete request' });
  }
});

module.exports = router;
