// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getDB } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cams_jwt_secret_key_2024';

// Helper: insert audit log row
async function insertAuditLog(pool, { userId, userEmail, role, department, action, details, ipAddress }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, role, department, action, details, ip_address, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [userId || null, userEmail || '', role || '', department || '', action, details || '', ipAddress || '']
    );
  } catch (err) {
    console.error('Failed to insert audit log:', err.message);
  }
}

// Helper: insert login history row
async function insertLoginHistory(pool, { userId, email, status, ipAddress }) {
  try {
    await pool.query(
      `INSERT INTO login_history (user_id, email, login_time, status) VALUES ($1, $2, NOW(), $3)`,
      [userId || null, email, status]
    );
  } catch (err) {
    console.error('Failed to insert login history:', err.message);
  }
}

// Helper to format user response
function formatUser(user) {
  // Normalize role values: "System Monitor" → "Monitor" for frontend compatibility
  const roleMap = {
    'System Monitor': 'Monitor',
  };
  const normalizedRole = roleMap[user.role] || user.role;

  return {
    id: String(user.id),
    full_name: user.full_name || user.name,
    email: user.email,
    role: normalizedRole,
    department: user.department,
    staff_id: user.staff_id,
    mobile: user.mobile,
    avatar: user.avatar,
    status: user.status,
    created_at: user.created_at,
  };
}

// ---------- Register ----------
router.post('/register', async (req, res) => {
  const { full_name, email, password, role, department, staff_id } = req.body;
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const pool = getDB();
  try {
    // Check for duplicate email
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // Check for duplicate staff ID if provided
    if (staff_id) {
      const staffCheck = await pool.query('SELECT id FROM users WHERE staff_id = $1', [staff_id]);
      if (staffCheck.rowCount > 0) {
        return res.status(409).json({ message: 'Staff ID already registered' });
      }
    }
    const hashed = await bcrypt.hash(password, 10);
    const insertSql = `INSERT INTO users (name, email, password_hash, role, department, staff_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Active')
      RETURNING *`;
    const { rows } = await pool.query(insertSql, [full_name, email, hashed, role, department || 'Administrative Office', staff_id || null]);
    const user = rows[0];

    // Audit log: USER_REGISTERED
    await insertAuditLog(pool, {
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      department: user.department,
      action: 'USER_REGISTERED',
      details: `New user registered: ${user.name} (${user.email}) as ${user.role}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Registration successful', user: formatUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ---------- Login ----------
router.post('/login', async (req, res) => {
  const { email, password, role: selectedRole } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  const pool = getDB();
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (rows.length === 0) {
      // Log failed login attempt for unknown email
      await insertLoginHistory(pool, { userId: null, email, status: 'FAILED' });
      await insertAuditLog(pool, {
        userId: null, userEmail: email, role: '', department: '',
        action: 'USER_LOGIN', details: `Failed login attempt — unknown email: ${email}`,
        ipAddress: req.ip,
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      // Log failed login attempt
      await insertLoginHistory(pool, { userId: user.id, email, status: 'FAILED' });
      await insertAuditLog(pool, {
        userId: user.id, userEmail: user.email, role: user.role, department: user.department,
        action: 'USER_LOGIN', details: `Failed login attempt — wrong password for ${user.email}`,
        ipAddress: req.ip,
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate that the selected role matches the user's actual role
    if (selectedRole) {
      const roleMap = { 'System Monitor': 'Monitor' };
      const normalizedDbRole = roleMap[user.role] || user.role;
      const normalizedSelected = roleMap[selectedRole] || selectedRole;
      if (normalizedSelected !== normalizedDbRole) {
        return res.status(403).json({
          message: `This account is registered as ${normalizedDbRole}, not ${normalizedSelected}. Please select the correct role.`,
        });
      }
    }

    // Normalize role for JWT and response
    const ROLE_MAP = { 'System Monitor': 'Monitor' };
    const normalizedRole = ROLE_MAP[user.role] || user.role;

    const token = jwt.sign(
      { id: user.id, role: normalizedRole, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last_login timestamp
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Log successful login
    await insertLoginHistory(pool, { userId: user.id, email: user.email, status: 'SUCCESS' });
    await insertAuditLog(pool, {
      userId: user.id, userEmail: user.email, role: normalizedRole, department: user.department,
      action: 'USER_LOGIN', details: `${user.email} logged in successfully as ${normalizedRole}`,
      ipAddress: req.ip,
    });

    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ---------- Change password ----------
router.post('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const pool = getDB();
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) return res.status(401).json({ message: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);
    await insertAuditLog(pool, {
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      department: user.department,
      action: 'PASSWORD_CHANGED',
      details: 'User changed their password',
      ipAddress: req.ip,
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// ---------- Me (profile) ----------
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const pool = getDB();
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = rows[0];
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

// ---------- Logout ----------
router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(200).json({ message: 'Logged out' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const pool = getDB();
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = rows[0];

    // Update logout_time in most recent login_history for this user
    await pool.query(
      `UPDATE login_history SET logout_time = NOW()
       WHERE user_id = $1 AND logout_time IS NULL
       AND id = (SELECT id FROM login_history WHERE user_id = $1 ORDER BY login_time DESC LIMIT 1)`,
      [decoded.id]
    );

    // Audit log: USER_LOGOUT
    if (user) {
      await insertAuditLog(pool, {
        userId: user.id, userEmail: user.email, role: user.role, department: user.department,
        action: 'USER_LOGOUT', details: `${user.email} logged out`,
        ipAddress: req.ip,
      });
    }

    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(200).json({ message: 'Logged out' });
  }
});

// ---------- Login History (Admin/Monitor only) ----------
router.get('/login-history', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!['Admin', 'Monitor'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const pool = getDB();
    const { rows } = await pool.query(
      `SELECT lh.*, u.name as user_name FROM login_history lh
       LEFT JOIN users u ON lh.user_id = u.id
       ORDER BY lh.login_time DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching login history' });
  }
});

// ---------- Audit Logs (Admin/Monitor only) ----------
router.get('/audit-logs', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!['Admin', 'Monitor'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const pool = getDB();
    const { rows } = await pool.query(
      'SELECT * FROM audit_logs ORDER BY COALESCE(timestamp, created_at) DESC LIMIT 200'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
});

module.exports = router;


