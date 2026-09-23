// api/index.cjs
// Vercel Serverless Function entry point for the CAMS backend API.
// vercel.json rewrites /api/* → /api/index so the deployed frontend calls
// the API via the relative base URL '/api' (never a localhost URL).
//
// This file uses CommonJS (require/module.exports) to properly load
// backend modules that are also CommonJS. The root package.json has
// "type": "module", so .js files are ESM by default. By using .cjs,
// require() works correctly and Vercel's bundler handles it properly.
const express = require('express');
const cors = require('cors');

// Shared Neon pool from backend/config/db.js.
// Locally it loads backend/.env; on Vercel it uses environment variables.
const db = require('../backend/config/db.js');
const authRoutes = require('../backend/routes/auth.js');
const assetRoutes = require('../backend/routes/assets.js');
const allocationRoutes = require('../backend/routes/allocations.js');
const historyRoutes = require('../backend/routes/history.js');
const notificationRoutes = require('../backend/routes/notifications.js');
const userRoutes = require('../backend/routes/users.js');
const blockRoutes = require('../backend/routes/blocks.js');
const roomRoutes = require('../backend/routes/rooms.js');
const requestRoutes = require('../backend/routes/requests.js');
const vendorRoutes = require('../backend/routes/vendors.js');
const maintenanceRoutes = require('../backend/routes/maintenance.js');

const { getDB, connectDB } = db;
const pool = getDB();
connectDB();

// ─── Ensure critical tables exist (non-destructive) ──────────────────
async function ensureTablesExist() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_history (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER,
        email       VARCHAR(255),
        login_time  TIMESTAMPTZ DEFAULT NOW(),
        logout_time TIMESTAMPTZ,
        status      VARCHAR(50) DEFAULT 'SUCCESS',
        ip_address  VARCHAR(100)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS asset_history (
        id           SERIAL PRIMARY KEY,
        asset_id     VARCHAR(50),
        type         VARCHAR(100),
        title        VARCHAR(255),
        description  TEXT,
        performed_by VARCHAR(255),
        date         TIMESTAMPTZ DEFAULT NOW(),
        cost         NUMERIC
      );
    `);
  } catch (err) {
    console.error('Table ensure error:', err.message);
  }
}

ensureTablesExist();

// ─── Express App ─────────────────────────────────────────────────────
const app = express();

// Same-origin in production (frontend + API share the Vercel domain).
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// Catch malformed JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});

// ─── Health Check ────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    message: 'CAMS API is running',
    db: 'PostgreSQL (Neon)',
    timestamp: new Date().toISOString(),
  };
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    health.dbStatus = 'connected';
  } catch (err) {
    health.status = 'degraded';
    health.dbStatus = 'disconnected';
    health.dbError = err.message;
  }
  res.json(health);
});

// ─── System Stats ────────────────────────────────────────────────────
app.get('/api/system/stats', async (req, res) => {
  try {
    const [usersRes, assetsRes, blocksRes, roomsRes, deptsRes, maintRes, requestsRes] =
      await Promise.all([
        pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'Active') as active FROM users"),
        pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN ('Active','In Use')) as active FROM assets"),
        pool.query('SELECT COUNT(*) as total FROM blocks'),
        pool.query('SELECT COUNT(*) as total FROM rooms'),
        pool.query('SELECT COUNT(*) as total FROM departments'),
        pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='Pending') as pending, COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress FROM maintenance"),
        pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='Pending') as pending FROM asset_requests"),
      ]);

    res.json({
      users:       { total: Number(usersRes.rows[0].total),       active: Number(usersRes.rows[0].active) },
      assets:      { total: Number(assetsRes.rows[0].total),      active: Number(assetsRes.rows[0].active) },
      blocks:      { total: Number(blocksRes.rows[0].total) },
      rooms:       { total: Number(roomsRes.rows[0].total) },
      departments: { total: Number(deptsRes.rows[0].total) },
      maintenance: {
        total:      Number(maintRes.rows[0].total),
        pending:    Number(maintRes.rows[0].pending),
        inProgress: Number(maintRes.rows[0].in_progress),
      },
      requests: { total: Number(requestsRes.rows[0].total), pending: Number(requestsRes.rows[0].pending) },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('System stats error:', err.message);
    res.status(500).json({ message: 'Server error fetching system stats' });
  }
});

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/assets',        assetRoutes);
app.use('/api/allocations',   allocationRoutes);
app.use('/api/history',       historyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/blocks',        blockRoutes);
app.use('/api/rooms',         roomRoutes);
app.use('/api/requests',      requestRoutes);
app.use('/api/vendors',       vendorRoutes);
app.use('/api/maintenance',   maintenanceRoutes);

// ─── Global Error Handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;

// Local testing only: `node api/index.cjs`
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}
