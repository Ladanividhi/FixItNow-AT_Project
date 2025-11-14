// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  subservices: [
    {
      name: { type: String },
      basePrice: { type: Number }
    }
  ]
});

module.exports = mongoose.model('Service', serviceSchema);
