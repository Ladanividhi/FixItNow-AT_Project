const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON requests

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const serviceRoutes = require('./routes/serviceRoutes');
app.use('/services', serviceRoutes);

const providerRoutes = require('./routes/providerRoutes');
app.use('/provider', providerRoutes);
 
const requestRoutes = require('./routes/requestRoutes');
app.use('/requests', requestRoutes);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/feedback', feedbackRoutes);

// const feedbackRoutes = require('./routes/feedbackRoutes');
// app.use('/feedback', feedbackRoutes);



const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fixitnow';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Explicitly create the serviceproviders collection if it does not exist
    const ServiceProvider = require('./models/ServiceProvider');
    try {
      await mongoose.connection.db.createCollection('serviceproviders');
      console.log('serviceproviders collection created or already exists');
    } catch (err) {
      if (err.codeName === 'NamespaceExists') {
        console.log('serviceproviders collection already exists');
      } else {
        console.error('Error creating serviceproviders collection:', err);
      }
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
