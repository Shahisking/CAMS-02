// backend/routes/users.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const router = express.Router();

const ROLE_MAP = { 'System Monitor': 'Monitor' };
const normalizeRole = (r) => ROLE_MAP[r] || r;

const mapUser = r => ({
  id: String(r.id), fullName: r.name || '',
  email: r.email, department: r.department || 'Administrative Office',
  staffId: r.staff_id || `AIT-USR-${r.id}`, mobile: r.mobile || '',
  role: normalizeRole(r.role) || 'Staff', avatar: r.avatar || '',
  status: r.status || 'Active', lastLogin: r.last_login || ''
});

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

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM users');
    res.json(rows.map(mapUser));
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(mapUser(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', verifyToken, requireRole(['Monitor', 'Admin']), async (req, res) => {
  const { email, password, name, role, department, staffId } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ message: 'Email, password and role are required' });

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = (await getDB().query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail])).rows;
    if (existing.length > 0)
      return res.status(409).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await getDB().query(
      'INSERT INTO users (email, password_hash, name, role, department, staff_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [normalizedEmail, hash, name || null, role, department || null, staffId || null, 'Active']
    );

    // Audit log: USER_REGISTERED (admin-created)
    await insertAuditLog(getDB(), {
      userId: rows[0].id, userEmail: rows[0].email, role: req.user.role, department: req.user.department || '',
      action: 'USER_REGISTERED', details: `Admin ${req.user.email} registered new user: ${rows[0].name} (${rows[0].email}) as ${role}`,
      ipAddress: req.ip,
    });

    res.status(201).json(mapUser(rows[0]));
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error during user creation' });
  }
});

router.patch('/:id', verifyToken, requireRole(['Monitor', 'Admin']), async (req, res) => {
  const { name, department, avatar, status, role } = req.body;
  try {
    const fields = [], values = [];
    let index = 1;
    if (name !== undefined) { fields.push(`name = $${index++}`); values.push(name); }
    if (department !== undefined) { fields.push(`department = $${index++}`); values.push(department); }
    if (avatar !== undefined) { fields.push(`avatar = $${index++}`); values.push(avatar); }
    if (status !== undefined) { fields.push(`status = $${index++}`); values.push(status); }
    if (role !== undefined) { fields.push(`role = $${index++}`); values.push(role); }
    
    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });
    
    values.push(req.params.id);
    await getDB().query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${index}`, values);

    // Audit log: USER_UPDATED
    const updatedFields = Object.keys(req.body).filter(k => req.body[k] !== undefined).join(', ');
    await insertAuditLog(getDB(), {
      userId: req.params.id, userEmail: req.user.email, role: req.user.role, department: req.user.department || '',
      action: 'USER_UPDATED', details: `User #${req.params.id} updated: ${updatedFields}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
