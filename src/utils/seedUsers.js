const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Default users data
const defaultUsers = [
  {
    name: 'System Administrator',
    email: 'anuraopticians.ims@gmail.com',
    password: 'admin@123',
    role: 'Admin'
  },
  {
    name: 'Sales Manager',
    email: 'sales.anuraopticians@gmail.com',
    password: 'sales@123',
    role: 'Sale'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding...');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    // Create default users
    for (let userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    console.log('🎉 User seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('================================');
    console.log('🔐 Admin Account:');
    console.log('   Email: anuraopticians.ims@gmail.com');
    console.log('   Password: admin@123');
    console.log('   Role: Admin');
    console.log('\n🛒 Sales Account:');
    console.log('   Email: sales.anuraopticians@gmail.com');
    console.log('   Password: sales@123');
    console.log('   Role: Sale');
    console.log('================================\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedUsers();
};

// Check if this script is being run directly
if (require.main === module) {
  runSeeder();
}

module.exports = {
  seedUsers,
  defaultUsers
}; 