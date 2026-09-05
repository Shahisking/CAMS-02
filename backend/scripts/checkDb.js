// scripts/checkDb.js
require('dotenv').config();
const { connectMySQL, getMySQLPool } = require('../config/db');

(async () => {
  try {
    connectMySQL();
    const pool = getMySQLPool();
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL connection successful, test query result:', rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error('MySQL connection failed:', err);
    process.exit(1);
  }
})();

