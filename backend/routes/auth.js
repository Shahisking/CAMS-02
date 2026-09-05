// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getDB } = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cams_jwt_secret_key_2024';

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
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const insertSql = `INSERT INTO users (name, email, password_hash, role, department, staff_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Active')
      RETURNING *`;
    const { rows } = await pool.query(insertSql, [full_name, email, hashed, role, department || 'Administrative Office', staff_id || null]);
    const user = rows[0];
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
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
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
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

module.exports = router;


