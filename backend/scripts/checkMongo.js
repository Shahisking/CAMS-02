// backend/scripts/checkMongo.js
require('dotenv').config();
const { connectMongo } = require('../config/db');

(async () => {
  try {
    await connectMongo();
    console.log('MongoDB connection test successful');
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection test failed', err);
    process.exit(1);
  }
})();
