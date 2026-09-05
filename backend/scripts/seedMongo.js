// backend/scripts/seedMongo.js
require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const AllocationHistory = require('../models/AllocationHistory');
const HistoryEvent = require('../models/HistoryEvent');
const { connectMongo } = require('../config/db');

async function seedMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_assets';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding...');

  // Clean
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});
  await AllocationHistory.deleteMany({});
  await HistoryEvent.deleteMany({});
  console.log('Cleared existing MongoDB collections');

  // Seed Notifications
  await Notification.insertMany([
    {
      title: 'New Asset Registered',
      message: 'Dell OptiPlex 7090 Tower has been registered under CSE department.',
      type: 'success',
      category: 'Asset Added',
      timestamp: new Date().toISOString(),
      read: false,
      assetId: 'AIT-CSE-101'
    },
    {
      title: 'Maintenance Alert',
      message: 'Epson Projector in smart classroom S101 requires lamp replacement check.',
      type: 'warning',
      category: 'Maintenance Due',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false,
      assetId: 'AIT-CSE-102'
    }
  ]);
  console.log('Notifications seeded in MongoDB');

  // Seed Audit Logs
  await AuditLog.insertMany([
    {
      user: 'Dasarathan Ravi',
      userEmail: 'admin@ait.edu.in',
      role: 'Admin',
      department: 'Administrative Office',
      action: 'Asset Creation',
      details: 'Created asset AIT-CSE-101 (Dell OptiPlex 7090 Tower)',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    },
    {
      user: 'Dasarathan Ravi',
      userEmail: 'admin@ait.edu.in',
      role: 'Admin',
      department: 'Administrative Office',
      action: 'Login',
      details: 'Administrator logged in from console',
      ipAddress: '127.0.0.1',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]);
  console.log('Audit logs seeded in MongoDB');

  // Seed Allocations
  await AllocationHistory.insertMany([
    {
      assetId: 'AIT-CSE-101',
      assetName: 'Dell OptiPlex 7090 Tower',
      fromLocation: 'Store Room',
      toLocation: 'S102',
      fromAssignee: 'Store Custodian',
      toAssignee: 'Programming Lab 1',
      transferredBy: 'Dasarathan Ravi',
      date: new Date().toISOString(),
      reason: 'Allocated to Programming Lab 1 for CSE students'
    }
  ]);
  console.log('Allocations seeded in MongoDB');

  // Seed History Events
  await HistoryEvent.insertMany([
    {
      assetId: 'AIT-CSE-101',
      type: 'Purchase',
      title: 'Asset Purchased',
      description: 'Dell OptiPlex 7090 Tower purchased for Rs. 65,000.',
      performedBy: 'Dasarathan Ravi',
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      cost: 65000
    },
    {
      assetId: 'AIT-CSE-101',
      type: 'Allocation',
      title: 'Initial Allocation',
      description: 'Dell OptiPlex 7090 Tower assigned to Programming Lab 1.',
      performedBy: 'Dasarathan Ravi',
      date: new Date().toISOString()
    }
  ]);
  console.log('History events seeded in MongoDB');

  console.log('MongoDB Seeding complete!');
  process.exit(0);
}

seedMongo().catch(err => {
  console.error('Error seeding MongoDB:', err);
  process.exit(1);
});
