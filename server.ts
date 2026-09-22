// server.ts
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';

// Resolve backend CJS modules from the project root (works under tsx dev
// and the bundled dist/server.cjs — import.meta.url is not available in CJS).
const require = createRequire(path.join(process.cwd(), 'package.json'));
const { connectDB, getDB } = require('./backend/config/db');

// ─── Table Ensure Helpers ────────────────────────────────────────────────────
async function ensureLoginHistoryTable(db: any) {
  try {
    await db.query(`
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
    console.log('✅ Verified login_history table exists');
  } catch (err: any) {
    console.error('❌ Failed to ensure login_history table:', err.message);
  }
}

async function ensureAssetHistoryTable(db: any) {
  try {
    await db.query(`
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
    console.log('✅ Verified asset_history table exists');
  } catch (err: any) {
    console.error('❌ Failed to ensure asset_history table:', err.message);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  app.use(express.json());

  // Middleware to catch malformed JSON bodies
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
      console.error('Bad JSON payload:', err.message);
      return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    next(err);
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    const health: Record<string, any> = {
      status: 'ok',
      message: 'Backend is running',
      db: 'PostgreSQL (Neon)',
      timestamp: new Date().toISOString(),
    };

    try {
      const client = await getDB().connect();
      await client.query('SELECT 1');
      client.release();
      health.dbStatus = 'connected';
    } catch (err: any) {
      health.status = 'degraded';
      health.dbStatus = 'disconnected';
      health.dbError = err?.message;
    }

    res.json(health);
  });

  // System stats endpoint
  app.get('/api/system/stats', async (req, res) => {
    try {
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
        users: { total: Number(usersRes.rows[0]?.total || 0), active: Number(usersRes.rows[0]?.active || 0) },
        assets: { total: Number(assetsRes.rows[0]?.total || 0), active: Number(assetsRes.rows[0]?.active || 0) },
        blocks: { total: Number(blocksRes.rows[0]?.total || 0) },
        rooms: { total: Number(roomsRes.rows[0]?.total || 0) },
        departments: { total: Number(deptsRes.rows[0]?.total || 0) },
        maintenance: {
          total: Number(maintRes.rows[0]?.total || 0),
          pending: Number(maintRes.rows[0]?.pending || 0),
          inProgress: Number(maintRes.rows[0]?.in_progress || 0),
        },
        requests: { total: Number(requestsRes.rows[0]?.total || 0), pending: Number(requestsRes.rows[0]?.pending || 0) },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
      res.status(500).json({ message: 'Server error fetching system stats' });
    }
  });

  // Mount API route modules
  app.use('/api/auth',          require('./backend/routes/auth'));
  app.use('/api/assets',        require('./backend/routes/assets'));
  app.use('/api/allocations',   require('./backend/routes/allocations'));
  app.use('/api/history',       require('./backend/routes/history'));
  app.use('/api/notifications', require('./backend/routes/notifications'));
  app.use('/api/users',         require('./backend/routes/users'));
  app.use('/api/blocks',        require('./backend/routes/blocks'));
  app.use('/api/rooms',         require('./backend/routes/rooms'));
  app.use('/api/requests',      require('./backend/routes/requests'));
  app.use('/api/vendors',       require('./backend/routes/vendors'));
  app.use('/api/maintenance',   require('./backend/routes/maintenance'));

  // Database initialization
  await connectDB();

  // Ensure critical tables that may not be present in older migrations
  await ensureLoginHistoryTable(getDB());
  await ensureAssetHistoryTable(getDB());

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err?.message || err);
    res.status(500).json({ message: 'Internal Server Error' });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });

  const cleanup = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

startServer();
