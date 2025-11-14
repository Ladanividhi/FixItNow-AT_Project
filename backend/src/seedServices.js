const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Service = require('./models/Service');

const servicesData = [
  {
    name: "Plumber",
    subservices: [
      { name: "Tap Installation", basePrice: 200 },
      { name: "Leakage Repair", basePrice: 150 },
      { name: "Pipe Fitting", basePrice: 250 },
      { name: "Bathroom Fitting", basePrice: 500 },
      { name: "Shower Installation", basePrice: 350 },
      { name: "Toilet Repair", basePrice: 300 },
      { name: "Sink Installation", basePrice: 400 },
      { name: "Drain Unclogging", basePrice: 180 },
      { name: "Water Tank Cleaning", basePrice: 600 },
      { name: "Geyser Fitting", basePrice: 550 },
      { name: "Bathroom Renovation", basePrice: 1200 }
    ]
  },

  {
    name: "Electrician",
    subservices: [
        { name: "Fan Repair", basePrice: 250 },
        { name: "Light Fitting", basePrice: 300 },
        { name: "Wiring", basePrice: 700 },
        { name: "Switch Replacement", basePrice: 150 },
        { name: "Inverter Installation", basePrice: 800 },
        { name: "Power Backup Setup", basePrice: 1200 },
        { name: "Tube Light Repair", basePrice: 200 },
        { name: "Choke Repair", basePrice: 180 },
        { name: "Circuit Breaker Fix", basePrice: 400 },
        { name: "AC Point Installation", basePrice: 350 },
        { name: "Meter Installation", basePrice: 500 }
   ]
  },

  {
    name: "Carpenter",
    subservices: [
        { name: "Sofa Making", basePrice: 500 },
        { name: "Table Assembly", basePrice: 300 },
        { name: "Door Repair", basePrice: 400 },
        { name: "Cupboard Installation", basePrice: 800 },
        { name: "Bed Repair", basePrice: 450 },
        { name: "Modular Kitchen Setup", basePrice: 1500 },
        { name: "Bookshelf Making", basePrice: 600 },
        { name: "Window Frame Repair", basePrice: 350 },
        { name: "Wooden Partition", basePrice: 1000 },
        { name: "Chair Repair", basePrice: 200 },
        { name: "TV Unit Setup", basePrice: 700 }
    ]
  },

  {
    name: "Painter",
    subservices: [
        { name: "Wall Painting", basePrice: 600 },
        { name: "Oil Painting", basePrice: 800 },
        { name: "Ceiling Painting", basePrice: 500 },
        { name: "Texture Painting", basePrice: 1000 },
        { name: "Metal Painting", basePrice: 750 },
        { name: "Wood Polish", basePrice: 650 },
        { name: "Waterproof Coating", basePrice: 900 },
        { name: "Exterior Painting", basePrice: 1500 },
        { name: "Interior Painting", basePrice: 1200 },
        { name: "Furniture Painting", basePrice: 450 },
        { name: "Primer Coating", basePrice: 400 }
    ]
  },

  {
    name: "Appliance Repair",
    subservices: [
        { name: "TV Repair", basePrice: 400 },
        { name: "Fridge Repair", basePrice: 500 },
        { name: "Microwave Repair", basePrice: 350 },
        { name: "Washing Machine Repair", basePrice: 600 },
        { name: "Mixer Grinder Repair", basePrice: 250 },
        { name: "Water Purifier Repair", basePrice: 450 },
        { name: "Oven Repair", basePrice: 500 },
        { name: "Iron Repair", basePrice: 200 },
        { name: "Heater Repair", basePrice: 300 },
        { name: "Ceiling Fan Repair", basePrice: 250 },
        { name: "Air Cooler Repair", basePrice: 350 },
        { name: "Geyser Repair", basePrice: 400 },
        { name: "Electric Kettle Repair", basePrice: 180 },
        { name: "Toaster Repair", basePrice: 150 },
        { name: "Induction Cooktop Repair", basePrice: 350 },
        { name: "Vacuum Cleaner Repair", basePrice: 450 },
        { name: "Blender Repair", basePrice: 220 },
        { name: "Chimney Cleaning & Repair", basePrice: 600 },
        { name: "Coffee Maker Repair", basePrice: 300 },
        { name: "Electric Stove Repair", basePrice: 400 }
   ]
  },
  
 {
  name: "Mechanic",
  subservices: [
        { name: "Bike Service", basePrice: 300 },
        { name: "Car Service", basePrice: 800 },
        { name: "Battery Replacement", basePrice: 1000 },
        { name: "Brake Check", basePrice: 400 },
        { name: "Engine Tune-Up", basePrice: 1200 },
        { name: "Oil Change", basePrice: 500 },
        { name: "Tyre Replacement", basePrice: 700 },
        { name: "Clutch Repair", basePrice: 900 },
        { name: "Suspension Work", basePrice: 1100 },
        { name: "Exhaust Repair", basePrice: 600 },
        { name: "Wiper Blade Change", basePrice: 200 },
        { name: "Coolant Refill", basePrice: 250 },
        { name: "Radiator Repair", basePrice: 850 },
        { name: "AC Gas Refill", basePrice: 750 },
        { name: "Headlight/Indicator Fix", basePrice: 300 }
    ]
  },
  {
    name: "Barber at Home",
    subservices: [
        { name: "Hair Cut", basePrice: 150 },
        { name: "Beard Trim", basePrice: 100 },
        { name: "Head Massage", basePrice: 200 },
        { name: "Hair Coloring", basePrice: 400 },
        { name: "Hair Styling", basePrice: 300 },
        { name: "Shaving", basePrice: 100 },
        { name: "Beard Shaping", basePrice: 120 },
        { name: "Kids Haircut", basePrice: 130 },
        { name: "Hair Wash", basePrice: 110 },
        { name: "Eyebrow Trimming", basePrice: 80 },
        { name: "Neck Cleanup", basePrice: 90 },
        { name: "Grey Hair Touch-up", basePrice: 200 },
        { name: "Scalp Treatment", basePrice: 350 },
        { name: "Facial Hair Wax", basePrice: 180 },
        { name: "Hot Towel Shave", basePrice: 160 }
    ]
  },

  {
    name: "Barber at Home",
    subservices: [
        { name: "Hair Cut", basePrice: 150 },
        { name: "Beard Trim", basePrice: 100 },
        { name: "Head Massage", basePrice: 200 },
        { name: "Hair Coloring", basePrice: 400 },
        { name: "Hair Styling", basePrice: 300 },
        { name: "Shaving", basePrice: 100 },
        { name: "Beard Shaping", basePrice: 120 },
        { name: "Kids Haircut", basePrice: 130 },
        { name: "Hair Wash", basePrice: 110 },
        { name: "Eyebrow Trimming", basePrice: 80 },
        { name: "Neck Cleanup", basePrice: 90 },
        { name: "Grey Hair Touch-up", basePrice: 200 },
        { name: "Scalp Treatment", basePrice: 350 },
        { name: "Facial Hair Wax", basePrice: 180 },
        { name: "Hot Towel Shave", basePrice: 160 }
    ]
  },

  {
    name: "Computer Repair",
    subservices: [
        { name: "OS Installation", basePrice: 250 },
        { name: "Hardware Issue Diagnosis", basePrice: 400 },
        { name: "RAM Upgrade", basePrice: 300 },
        { name: "Motherboard Repair", basePrice: 700 },
        { name: "Laptop Screen Replacement", basePrice: 1000 },
        { name: "Virus Removal", basePrice: 200 },
        { name: "Software Installation", basePrice: 150 },
        { name: "Keyboard Replacement", basePrice: 250 },
        { name: "WiFi Issue Fix", basePrice: 300 },
        { name: "SSD Upgrade", basePrice: 350 },
        { name: "Power Issue Fix", basePrice: 400 },
        { name: "Data Recovery", basePrice: 600 }
    ]
  },
 {
    name: "Wedding Photographer",
    subservices: [
        { name: "Full Day Shoot", basePrice: 8000 },
        { name: "Pre-wedding Shoot", basePrice: 10000 },
        { name: "Candid Photography", basePrice: 9000 },
        { name: "Drone Shoot", basePrice: 15000 },
        { name: "Album Printing", basePrice: 3000 },
        { name: "Engagement Coverage", basePrice: 7000 },
        { name: "Bride Photoshoot", basePrice: 6000 },
        { name: "Reception Coverage", basePrice: 7500 },
        { name: "Short Wedding Film", basePrice: 9500 },
        { name: "Video Editing", basePrice: 4000 }
    ]
  },

  {
    name: "Pest Control",
    subservices: [
        { name: "Termite Control", basePrice: 1000 },
        { name: "Cockroach Treatment", basePrice: 700 },
        { name: "Rodent Control", basePrice: 800 },
        { name: "Bed Bug Treatment", basePrice: 900 },
        { name: "Mosquito Control", basePrice: 600 },
        { name: "Ant Control", basePrice: 500 }
    ]
  },

 {
    name: "Home Cleaning",
    subservices: [
        { name: "Kitchen Deep Cleaning", basePrice: 1000 },
        { name: "Bathroom Cleaning", basePrice: 600 },
        { name: "Sofa Cleaning", basePrice: 500 },
        { name: "Carpet Cleaning", basePrice: 700 },
        { name: "Full Home Deep Cleaning", basePrice: 2500 }
    ]
 },

 {
    name: "Laundry Services",
    subservices: [
        { name: "Wash & Iron", basePrice: 25 },
        { name: "Dry Cleaning", basePrice: 100 },
        { name: "Curtain Cleaning", basePrice: 200 },
        { name: "Shoe Cleaning", basePrice: 150 },
        { name: "Blanket Cleaning", basePrice: 250 }
    ]
  },
 { 
    name: "Interior Design",
    subservices: [
        { name: "Modular Kitchen Design", basePrice: 15000 },
        { name: "Living Room Interior", basePrice: 20000 },
        { name: "False Ceiling", basePrice: 10000 },
        { name: "Bedroom Design", basePrice: 18000 },
        { name: "2D/3D Layout Plan", basePrice: 5000 }
    ]
 },
  {
    name: "Car Wash",
    subservices: [
        { name: "Exterior Wash", basePrice: 300 },
        { name: "Interior Cleaning", basePrice: 400 },
        { name: "Foam Wash", basePrice: 450 },
        { name: "Dashboard Polishing", basePrice: 250 },
        { name: "AC Vent Cleaning", basePrice: 400 }
    ]
}

];

// Connect to DB and insert
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("📦 Connected to MongoDB. Seeding services...");
    await Service.deleteMany(); // Optional: clears old data
    await Service.insertMany(servicesData);
    console.log("✅ Services inserted successfully!");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error seeding services:", err);
    process.exit(1);
  });
