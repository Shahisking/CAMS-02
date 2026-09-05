// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('\n❌ Unexpected error on idle PostgreSQL client:', err.message);
  console.error('The backend will attempt to auto-reconnect when the next query is made.\n');
});

function connectDB() {
  pool.connect()
    .then((client) => {
      console.log('✅ PostgreSQL connected to Neon');
      client.release();
    })
    .catch((err) => {
      console.error('\n❌ CRITICAL: Failed to connect to the Database on startup.');
      console.error('Error Details:', err.message);
      console.error('Please check your DATABASE_URL in the backend/.env file and ensure your database is running.\n');
    });
}

function getDB() {
  return pool;
}

module.exports = { connectDB, getDB, pool };
