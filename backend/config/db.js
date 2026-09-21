// backend/config/db.js
const { Pool } = require('pg');
const { MockDatabase } = require('./mockDb');
require('dotenv').config();

let poolInstance = null;
let isMockActive = false;

const mockDb = new MockDatabase();

if (process.env.DATABASE_URL) {
  try {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    poolInstance.on('error', (err) => {
      console.warn('PostgreSQL idle client error, falling back to mock:', err.message);
      isMockActive = true;
    });
  } catch (err) {
    console.warn('Failed to initialize PostgreSQL pool, using mock:', err.message);
    isMockActive = true;
  }
} else {
  console.log('ℹ️ DATABASE_URL not provided — active mock database initialized.');
  isMockActive = true;
}

async function connectDB() {
  if (isMockActive || !poolInstance) {
    console.log('✅ In-memory mock database active and ready with seeded college records.');
    return;
  }

  try {
    const client = await poolInstance.connect();
    console.log('✅ PostgreSQL connected successfully to database');
    client.release();
  } catch (err) {
    console.warn('⚠️ Could not connect to PostgreSQL database (' + err.message + '). Falling back to mock database.');
    isMockActive = true;
  }
}

function getDB() {
  if (isMockActive || !poolInstance) {
    return mockDb;
  }
  return poolInstance;
}

// Proxy pool for backward compatibility
const pool = new Proxy({}, {
  get(target, prop) {
    const active = getDB();
    if (typeof active[prop] === 'function') {
      return active[prop].bind(active);
    }
    return active[prop];
  }
});

module.exports = { connectDB, getDB, pool };
