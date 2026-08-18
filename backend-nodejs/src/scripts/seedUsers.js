require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../domain/models/User');

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // MongoDB Connected
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();
    // Users cleared

    // Create users
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@university.edu',
        names: 'Administrator User',
        role: 'admin'
      },
      {
        username: 'analyst',
        password: 'analyst123',
        email: 'analyst@university.edu',
        names: 'Data Analyst',
        role: 'analyst'
      },
      {
        username: 'viewer',
        password: 'viewer123',
        email: 'viewer@university.edu',
        names: 'Report Viewer',
        role: 'viewer'
      }
    ];

    // Create users one by one to trigger the pre('save') middleware for password hashing
    for (const userData of users) {
      await User.create(userData);
    }
    // Users created successfully

    // Default users created:
    // Admin - username: admin, password: admin123
    // Analyst - username: analyst, password: analyst123
    // Viewer - username: viewer, password: viewer123

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
connectDB().then(() => {
  seedUsers();
});
