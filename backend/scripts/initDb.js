// backend/scripts/initDb.js
// Full schema init + seed using PostgreSQL (Neon)
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  console.log(`Connecting to PostgreSQL Database...\n`);
  const client = await pool.connect();
  
  try {
    // ── Drop existing tables ──────────────────────────────────────────────────
    console.log('Dropping existing tables for clean init...');
    await client.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS maintenance CASCADE;
      DROP TABLE IF EXISTS asset_history CASCADE;
      DROP TABLE IF EXISTS allocations CASCADE;
      DROP TABLE IF EXISTS asset_requests CASCADE;
      DROP TABLE IF EXISTS rooms CASCADE;
      DROP TABLE IF EXISTS assets CASCADE;
      DROP TABLE IF EXISTS vendors CASCADE;
      DROP TABLE IF EXISTS blocks CASCADE;
      DROP TABLE IF EXISTS departments CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // ── Create Tables ──────────────────────────────────────────────────────────
    const tables = [
      `CREATE TABLE users (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name          VARCHAR(255),
        role          VARCHAR(50) DEFAULT 'Staff',
        department    VARCHAR(255) DEFAULT 'Administrative Office',
        staff_id      VARCHAR(50) UNIQUE,
        mobile        VARCHAR(50),
        avatar        TEXT,
        status        VARCHAR(50) DEFAULT 'Active',
        last_login    TIMESTAMPTZ,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE departments (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE blocks (
        id           VARCHAR(50) PRIMARY KEY,
        name         VARCHAR(255) UNIQUE NOT NULL,
        code         VARCHAR(50),
        description  TEXT,
        last_updated TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE vendors (
        id             VARCHAR(50) PRIMARY KEY,
        name           VARCHAR(255) NOT NULL,
        category       VARCHAR(255),
        contact_person VARCHAR(255),
        phone          VARCHAR(50),
        email          VARCHAR(255),
        gstin          VARCHAR(50),
        location       TEXT,
        rating         NUMERIC,
        status         VARCHAR(50)
      )`,
      `CREATE TABLE assets (
        id              VARCHAR(50) PRIMARY KEY,
        name            VARCHAR(255) NOT NULL,
        category        VARCHAR(255),
        chair_type_id   VARCHAR(50),
        department      VARCHAR(255),
        building        VARCHAR(255),
        floor           VARCHAR(50),
        room_number     VARCHAR(50),
        purchase_date   DATE,
        purchase_cost   NUMERIC,
        vendor          VARCHAR(255),
        warranty_expiry DATE,
        condition       VARCHAR(50),
        status          VARCHAR(50),
        assigned_to     VARCHAR(255),
        assigned_type   VARCHAR(50),
        qr_code_url     TEXT,
        image_url       TEXT,
        specifications  TEXT,
        last_inspected  TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE rooms (
        id             SERIAL PRIMARY KEY,
        room_number    VARCHAR(50) NOT NULL,
        room_name      VARCHAR(255),
        block          VARCHAR(255) NOT NULL,
        floor          VARCHAR(50) NOT NULL,
        department     VARCHAR(255),
        room_type      VARCHAR(100) DEFAULT 'Classroom',
        capacity       INTEGER DEFAULT 0,
        status         VARCHAR(50) DEFAULT 'Active',
        description    TEXT,
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        updated_at     TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(room_number, block)
      )`,
      `CREATE TABLE asset_requests (
        id               SERIAL PRIMARY KEY,
        request_type     VARCHAR(100) NOT NULL,
        title            VARCHAR(255) NOT NULL,
        description      TEXT,
        asset_id         VARCHAR(50),
        priority         VARCHAR(50) DEFAULT 'Medium',
        details          JSONB,
        submitted_by     VARCHAR(255) NOT NULL,
        submitted_by_role VARCHAR(50) NOT NULL,
        status           VARCHAR(50) DEFAULT 'Pending',
        notes            TEXT,
        processed_by     VARCHAR(255),
        processed_at     TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE allocations (
        id             SERIAL PRIMARY KEY,
        asset_id       VARCHAR(50),
        asset_name     VARCHAR(255),
        from_location  VARCHAR(255),
        to_location    VARCHAR(255),
        from_assignee  VARCHAR(255),
        to_assignee    VARCHAR(255),
        transferred_by VARCHAR(255),
        date           TIMESTAMPTZ DEFAULT NOW(),
        reason         TEXT
      )`,
      `CREATE TABLE asset_history (
        id           SERIAL PRIMARY KEY,
        asset_id     VARCHAR(50),
        type         VARCHAR(100),
        title        VARCHAR(255),
        description  TEXT,
        performed_by VARCHAR(255),
        date         TIMESTAMPTZ DEFAULT NOW(),
        cost         NUMERIC
      )`,
      `CREATE TABLE maintenance (
        id           SERIAL PRIMARY KEY,
        asset_id     VARCHAR(50),
        description  TEXT,
        scheduled_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        status       VARCHAR(50) DEFAULT 'Scheduled'
      )`,
      `CREATE TABLE notifications (
        id        SERIAL PRIMARY KEY,
        title     VARCHAR(255),
        message   TEXT,
        type      VARCHAR(50) DEFAULT 'info',
        category  VARCHAR(100) DEFAULT 'General',
        asset_id  VARCHAR(50),
        is_read   BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE audit_logs (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER,
        action     TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    ];

    for (const sql of tables) {
      await client.query(sql);
    }
    console.log('All 10 tables created.\n');

    // ── Seed Users ─────────────────────────────────────────────────────────────
    const usersToSeed = [
      { name: 'System Administrator', email: 'admin@ait.edu.in',      password: 'Admin@123',     role: 'Admin',       staffId: 'AIT-ADM-001', dept: 'Administrative Office' },
      { name: 'Dr. S.K. Sundararajan',email: 'principal@ait.edu.in',  password: 'Principal@123', role: 'Principal',   staffId: 'AIT-PRI-001', dept: 'Administrative Office' },
      { name: 'Dr. M. Jayakumar',     email: 'dean@ait.edu.in',       password: 'Dean@123',      role: 'Dean',        staffId: 'AIT-DEN-001', dept: 'Administrative Office' },
      { name: 'Dr. R. Sundaram',      email: 'hod@ait.edu.in',        password: 'Hod@123',       role: 'HOD',         staffId: 'AIT-HOD-001', dept: 'Computer Science & Engineering' },
      { name: 'Priya Sharma',         email: 'staff@ait.edu.in',      password: 'Staff@123',     role: 'Staff',       staffId: 'AIT-STF-001', dept: 'Computer Science & Engineering' },
      { name: 'Ravi Kumar',           email: 'technician@ait.edu.in', password: 'Technician@123',role: 'Technician',  staffId: 'AIT-TEC-001', dept: 'Computer Science & Engineering' },
      { name: 'System Monitor',       email: 'monitor@ait.edu.in',    password: 'Monitor@123',   role: 'Monitor',     staffId: 'AIT-MON-001', dept: 'Administrative Office' }
    ];

    console.log('Hashing passwords and seeding users...');
    for (const u of usersToSeed) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      await client.query(
        'INSERT INTO users (email, password_hash, name, role, staff_id, department, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [u.email, hash, u.name, u.role, u.staffId, u.dept, 'Active']
      );
      console.log(`  ✓ ${u.role.padEnd(15)} ${u.email}`);
    }
    console.log('');

    // ── Seed Departments ───────────────────────────────────────────────────────
    const depts = [
      'Computer Science & Engineering', 'Information Technology',
      'Electronics & Communication', 'Electrical & Electronics',
      'Mechanical Engineering', 'Civil Engineering',
      'Artificial Intelligence & Data Science', 'Administrative Office',
      'Central Library', 'Hostel Management', 'Physical Education', 'General'
    ];
    for (const d of depts) {
      await client.query('INSERT INTO departments (name) VALUES ($1)', [d]);
    }
    console.log(`${depts.length} departments seeded.`);

    // ── Seed Blocks ────────────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const blocks = [
      { id: 'BLK-001', name: 'S Block', code: 'S-BLK', desc: 'School of Computing — CSE & IT Laboratories' },
      { id: 'BLK-002', name: 'N Block', code: 'N-BLK', desc: 'School of Electrical & AI Innovation Hub' },
      { id: 'BLK-003', name: 'W Block', code: 'W-BLK', desc: 'Indoor Sports Complex & Gymnasium' }
    ];
    for (const b of blocks) {
      await client.query('INSERT INTO blocks (id, name, code, description, last_updated) VALUES ($1, $2, $3, $4, $5)', [b.id, b.name, b.code, b.desc, today]);
    }
    console.log(`${blocks.length} blocks seeded.`);

    // ── Seed Vendors ───────────────────────────────────────────────────────────
    const vendors = [
      { id: 'VND-001', name: 'Dell Technologies India',  cat: 'IT Hardware & Workstations',   contact: 'Ananth Kumar',  phone: '+91 80 6620 4000', email: 'corporate.sales@dell.com', gstin: '29AAAAA1111A1Z1', loc: 'Bangalore, Karnataka', rating: 4.8, status: 'Preferred Supplier' },
      { id: 'VND-002', name: 'Supreme Furniture Ltd',    cat: 'Classroom & Office Furniture', contact: 'Rajesh Sharma', phone: '+91 22 2580 5000', email: 'sales@supreme.co.in',      gstin: '27BBBBB2222B2Z2', loc: 'Mumbai, Maharashtra',  rating: 4.5, status: 'Verified Partner' },
      { id: 'VND-003', name: 'HP India Sales Pvt. Ltd.', cat: 'Printing & Computing',         contact: 'Priya Mehta',   phone: '+91 80 2559 2000', email: 'hp.support@hp.com',        gstin: '29CCCCC3333C3Z3', loc: 'Bangalore, Karnataka', rating: 4.3, status: 'Active' }
    ];
    for (const v of vendors) {
      await client.query('INSERT INTO vendors (id, name, category, contact_person, phone, email, gstin, location, rating, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [v.id, v.name, v.cat, v.contact, v.phone, v.email, v.gstin, v.loc, v.rating, v.status]);
    }
    console.log(`${vendors.length} vendors seeded.`);

    // ── Seed Sample Assets ─────────────────────────────────────────────────────
    const assets = [
      { id: 'AIT-CSE-101', name: 'Dell OptiPlex 7090 Tower',   cat: 'Computer',  dept: 'Computer Science & Engineering', bld: 'S Block', room: 'S102', pd: '2026-01-15', cost: 65000, v: 'Dell Technologies India',   we: '2029-01-15', cond: 'New',  status: 'In Use', at: 'Programming Lab 1',   aty: 'Lab' },
      { id: 'AIT-CSE-102', name: 'Epson EB-E01 XGA Projector', cat: 'Projector', dept: 'Computer Science & Engineering', bld: 'S Block', room: 'S101', pd: '2026-02-10', cost: 38000, v: 'Dell Technologies India',   we: '2028-02-10', cond: 'Good', status: 'In Use', at: 'Smart Classroom 101', aty: 'Classroom' },
      { id: 'AIT-ADM-001', name: 'HP LaserJet Pro MFP M428dw', cat: 'Printer',   dept: 'Administrative Office',          bld: 'N Block', room: 'N001', pd: '2025-06-01', cost: 22000, v: 'HP India Sales Pvt. Ltd.', we: '2027-06-01', cond: 'Good', status: 'In Use', at: 'Admin Office',        aty: 'Office' },
      { id: 'AIT-CSE-110', name: 'Cisco Catalyst 2960 Switch', cat: 'Communication', dept: 'Computer Science & Engineering', bld: 'S Block', room: 'S110', pd: '2025-09-20', cost: 120000, v: 'Cisco Systems', we: '2028-09-20', cond: 'New', status: 'In Use', at: 'Network Lab', aty: 'Lab' },
      { id: 'AIT-CSE-104', name: 'Dell Latitude 5420 Laptop', cat: 'Computer', dept: 'Computer Science & Engineering', bld: 'S Block', room: 'S104', pd: '2026-03-12', cost: 85000, v: 'Dell Technologies India', we: '2029-03-12', cond: 'New', status: 'In Use', at: 'Student Lab', aty: 'Lab' },
      { id: 'AIT-CSE-103', name: 'Departmental Whiteboard', cat: 'Department', dept: 'Computer Science & Engineering', bld: 'S Block', room: 'S103', pd: '2024-07-01', cost: 15000, v: 'Office Supplies Co.', we: '2027-07-01', cond: 'Good', status: 'In Use', at: 'Dept Office', aty: 'Office' }
    ];
    for (const a of assets) {
      await client.query(
        'INSERT INTO assets (id, name, category, department, building, room_number, purchase_date, purchase_cost, vendor, warranty_expiry, condition, status, assigned_to, assigned_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
        [a.id, a.name, a.cat, a.dept, a.bld, a.room, a.pd, a.cost, a.v, a.we, a.cond, a.status, a.at, a.aty]
      );
    }
    console.log(`${assets.length} sample assets seeded.\n`);
    
    console.log('✅ Database initialization complete!\n');
    console.log('Default login credentials:');
    console.log('─'.repeat(55));
    usersToSeed.forEach(u => console.log(`  ${u.email.padEnd(28)} ${u.password}`));
    console.log('─'.repeat(55));

  } catch (err) {
    console.error('\n❌ Init failed:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    pool.end();
  }
}

initDb();
