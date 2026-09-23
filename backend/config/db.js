// backend/config/db.js
// ALWAYS uses the real Neon PostgreSQL database.
// There is intentionally no mock/in-memory fallback here: authentication,
// registration, and login-history must only ever touch the real database.
const { Pool } = require('pg');

// Load environment variables. In local dev, looks for .env in cwd.
// On Vercel/Netlify, environment variables come from the platform dashboard.
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error(
    '❌ DATABASE_URL is not set. Configure backend/.env for local dev, or Vercel → Settings → Environment Variables for production.'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5, // keep pool small for serverless
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 15000,
});

// The pool emits an error on behalf of any idle clients it contains
// if a backend error or network partition happens.
pool.on('error', (err) => {
  console.error('❌ Unexpected idle PostgreSQL client error:', err.message);
});

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected to Neon');
    client.release();
  } catch (err) {
    // Never fall back to a mock database — requests will fail with a
    // clear 500 until DATABASE_URL is set / the database is reachable.
    console.error('❌ Failed to connect to the Neon database:', err.message);
  }
}

function getDB() {
  return pool;
}

module.exports = { connectDB, getDB, pool };
