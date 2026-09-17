// backend/server.js
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB, getDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Secure CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
// Middleware to catch malformed JSON bodies and return a clear error
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON payload:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});


// Rate Limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow up to 100 login requests per 15 minutes to prevent dev lockout
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check with DB verification
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    message: 'Backend is running',
    db: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  };

  try {
    const { getDB } = require('./config/db');
    const client = await getDB().connect();
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

// System stats endpoint
app.get('/api/system/stats', async (req, res) => {
  try {
    const { getDB } = require('./config/db');
    const db = getDB();

    const [usersRes, assetsRes, blocksRes, roomsRes, deptsRes, maintRes, requestsRes] =
      await Promise.all([
        db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $1) as active FROM users', ['Active']),
        db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN ($1, $2)) as active FROM assets', ['Active', 'In Use']),
        db.query('SELECT COUNT(*) as total FROM blocks'),
        db.query('SELECT COUNT(*) as total FROM rooms'),
        db.query('SELECT COUNT(*) as total FROM departments'),
        db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'Pending') as pending, COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress FROM maintenance"),
        db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'Pending') as pending FROM asset_requests"),
      ]);

    res.json({
      users: { total: Number(usersRes.rows[0].total), active: Number(usersRes.rows[0].active) },
      assets: { total: Number(assetsRes.rows[0].total), active: Number(assetsRes.rows[0].active) },
      blocks: { total: Number(blocksRes.rows[0].total) },
      rooms: { total: Number(roomsRes.rows[0].total) },
      departments: { total: Number(deptsRes.rows[0].total) },
      maintenance: {
        total: Number(maintRes.rows[0].total),
        pending: Number(maintRes.rows[0].pending),
        inProgress: Number(maintRes.rows[0].in_progress),
      },
      requests: { total: Number(requestsRes.rows[0].total), pending: Number(requestsRes.rows[0].pending) },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error fetching system stats:', err);
    res.status(500).json({ message: 'Server error fetching system stats' });
  }
});

// Routes
app.use('/api/auth/login', loginLimiter); // Apply rate limiter to login endpoint
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/assets',        require('./routes/assets'));
app.use('/api/allocations',   require('./routes/allocations'));
app.use('/api/history',       require('./routes/history'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/blocks',        require('./routes/blocks'));
app.use('/api/rooms',         require('./routes/rooms'));
app.use('/api/requests',      require('./routes/requests'));
app.use('/api/vendors',       require('./routes/vendors'));
app.use('/api/maintenance',   require('./routes/maintenance'));

// Global Error Handler to prevent leaking sensitive errors
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

async function ensureRoomsTable() {
  try {
    await getDB().query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(50) NOT NULL,
        room_name VARCHAR(255),
        block VARCHAR(255) NOT NULL,
        floor VARCHAR(50) NOT NULL,
        department VARCHAR(255),
        room_type VARCHAR(100) DEFAULT 'Classroom',
        capacity INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Active',
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS rooms_block_room_number_idx
      ON rooms (room_number, block);
    `);
    console.log('✅ Verified rooms table exists');
  } catch (err) {
    console.error('❌ Failed to ensure rooms table exists:', err.message);
  }
}

async function ensureMaintenanceTicketsTable() {
  try {
    await getDB().query(`
      CREATE TABLE IF NOT EXISTS maintenance_tickets (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(50),
        asset_name VARCHAR(255) DEFAULT 'Unknown Asset',
        department VARCHAR(255) DEFAULT 'General',
        problem TEXT DEFAULT '',
        priority VARCHAR(50) DEFAULT 'Medium',
        assigned_technician VARCHAR(255) DEFAULT 'Pending Monitor Assignment',
        estimated_cost NUMERIC DEFAULT 0,
        actual_cost NUMERIC,
        status VARCHAR(50) DEFAULT 'Pending',
        requested_by VARCHAR(255) DEFAULT '',
        request_date TIMESTAMPTZ DEFAULT NOW(),
        completed_date TIMESTAMPTZ,
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Verified maintenance_tickets table exists');
  } catch (err) {
    console.error('❌ Failed to ensure maintenance_tickets table exists:', err.message);
  }
}

async function ensureNotificationsRecipientRole() {
  try {
    await getDB().query(`
      DO $$ BEGIN
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_role VARCHAR(50);
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
    console.log('✅ Verified notifications.recipient_role column exists');
  } catch (err) {
    console.error('❌ Failed to ensure notifications.recipient_role column:', err.message);
  }
}

async function ensureAuditLogColumns() {
  try {
    await getDB().query(`
      DO $$ BEGIN
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
      DO $$ BEGIN
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS role VARCHAR(50);
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
      DO $$ BEGIN
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS department VARCHAR(255);
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
      DO $$ BEGIN
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
      DO $$ BEGIN
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW();
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
    console.log('✅ Verified audit_logs extended columns exist');
  } catch (err) {
    console.error('❌ Failed to ensure audit_logs columns:', err.message);
  }
}

// Connect to PostgreSQL
connectDB();
ensureRoomsTable();
ensureMaintenanceTicketsTable();
ensureNotificationsRecipientRole();
ensureAuditLogColumns();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
