// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider' },
  service: { type: String },        
  subservice: { type: String },     
  address: { type: String },
  decription: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled', 'Declined'],
    default: 'Pending'
  },
  acceptedAt: { type: Date },
  declinedAt: { type: Date },
  cancelReason: { type: String }, // e.g., 'provider_declined', 'admin_declined'
  scheduledFor: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
