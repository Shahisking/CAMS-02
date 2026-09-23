const { handler } = require('@netlify/functions');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('../backend/config/db');
const authRoutes = require('../backend/routes/auth');
const assetRoutes = require('../backend/routes/assets');
const allocationRoutes = require('../backend/routes/allocations');
const historyRoutes = require('../backend/routes/history');
const notificationRoutes = require('../backend/routes/notifications');
const userRoutes = require('../backend/routes/users');
const blockRoutes = require('../backend/routes/blocks');
const roomRoutes = require('../backend/routes/rooms');
const requestRoutes = require('../backend/routes/requests');
const vendorRoutes = require('../backend/routes/vendors');
const maintenanceRoutes = require('../backend/routes/maintenance');

const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});

app.get('/api/health', async (req, res) => {
  const health = { status: 'ok', message: 'CAMS API is running', db: 'PostgreSQL (Neon)', timestamp: new Date().toISOString() };
  try { const client = await getDB().connect(); await client.query('SELECT 1'); client.release(); health.dbStatus = 'connected'; } catch (err) { health.status = 'degraded'; health.dbStatus = 'disconnected'; health.dbError = err.message; }
  res.json(health);
});

app.get('/api/system/stats', async (req, res) => {
  try {
    const db = getDB();
    const [usersRes, assetsRes, blocksRes, roomsRes, deptsRes, maintRes, requestsRes] = await Promise.all([
      db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $1) as active FROM users', ['Active']),
      db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN ($1, $2)) as active FROM assets', ['Active', 'In Use']),
      db.query('SELECT COUNT(*) as total FROM blocks'),
      db.query('SELECT COUNT(*) as total FROM rooms'),
      db.query('SELECT COUNT(*) as total FROM departments'),
      db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'Pending') as pending, COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress FROM maintenance"),
      db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'Pending') as pending FROM asset_requests"),
    ]);
    res.json({
      users: { total: Number(usersRes.rows[0]?.total || 0), active: Number(usersRes.rows[0]?.active || 0) },
      assets: { total: Number(assetsRes.rows[0]?.total || 0), active: Number(assetsRes.rows[0]?.active || 0) },
      blocks: { total: Number(blocksRes.rows[0]?.total || 0) },
      rooms: { total: Number(roomsRes.rows[0]?.total || 0) },
      departments: { total: Number(deptsRes.rows[0]?.total || 0) },
      maintenance: { total: Number(maintRes.rows[0]?.total || 0), pending: Number(maintRes.rows[0]?.pending || 0), inProgress: Number(maintRes.rows[0]?.in_progress || 0) },
      requests: { total: Number(requestsRes.rows[0]?.total || 0), pending: Number(requestsRes.rows[0]?.pending || 0) },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching system stats' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/maintenance', maintenanceRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

const server = http.createServer(app);
let PORT = null;
const serverReady = new Promise((resolve) => {
  server.listen(0, '127.0.0.1', () => {
    PORT = server.address().port;
    resolve();
  });
});

const camsHandler = async (event, context) => {
  await serverReady;
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: event.path,
      method: event.httpMethod,
      headers: { ...event.headers, 'Content-Length': event.body ? Buffer.byteLength(typeof event.body === 'string' ? event.body : JSON.stringify(event.body)) : 0 },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
          headers: res.headers,
        });
      });
    });
    req.on('error', reject);
    if (event.body) {
      req.write(typeof event.body === 'string' ? event.body : JSON.stringify(event.body));
    }
    req.end();
  });
};

module.exports = { handler: handler(camsHandler) };
