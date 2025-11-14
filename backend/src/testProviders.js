const mongoose = require('mongoose');
require('dotenv').config();

const ServiceProvider = require('./models/ServiceProvider');

async function testProviders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get all providers
    const allProviders = await ServiceProvider.find({});
    console.log('Total providers:', allProviders.length);
    
    if (allProviders.length > 0) {
      console.log('First provider structure:');
      console.log(JSON.stringify(allProviders[0], null, 2));
      
      // Check what services exist
      allProviders.forEach((provider, index) => {
        console.log(`\nProvider ${index + 1}: ${provider.name}`);
        console.log('Services:', provider.services);
      });
    } else {
      console.log('No providers found in database');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testProviders();
