// models/ServiceProvider.js
const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  services: [
    {
      category: String,  
      subservices: [
        {
          name: String,
          price: Number
        }
      ]
    }
  ],
  experience: { type: String },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  role: { type: String, enum: ['provider'], default: 'provider' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
