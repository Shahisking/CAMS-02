// backend/routes/requests.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

// GET all requests (Monitor sees all, others see own)
router.get('/', verifyToken, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'Monitor') {
      query = 'SELECT * FROM asset_requests ORDER BY created_at DESC';
      params = [];
    } else {
      query = 'SELECT * FROM asset_requests WHERE submitted_by = $1 ORDER BY created_at DESC';
      params = [req.user.userId || req.user.email];
    }
    const { rows } = await getDB().query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// GET single request
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM asset_requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Request not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create request (any authenticated user)
router.post('/', verifyToken, async (req, res) => {
  const { request_type, title, description, asset_id, priority, details } = req.body;
  if (!request_type || !title) {
    return res.status(400).json({ message: 'request_type and title are required' });
  }
  const submitted_by = req.user.userId || req.user.email;
  const submitted_by_role = req.user.role;
  try {
    const { rows } = await getDB().query(
      `INSERT INTO asset_requests (request_type, title, description, asset_id, priority, details, submitted_by, submitted_by_role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending')
       RETURNING *`,
      [request_type, title, description || null, asset_id || null, priority || 'Medium', details ? JSON.stringify(details) : null, submitted_by, submitted_by_role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ message: 'Server error creating request' });
  }
});

// PATCH update request status (Monitor only)
router.patch('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { status, notes } = req.body;
  if (!status) return res.status(400).json({ message: 'status is required' });
  try {
    const fields = ['status = $1'];
    const values = [status];
    let index = 2;
    if (notes !== undefined) {
      fields.push(`notes = $${index++}`);
      values.push(notes);
    }
    if (status === 'Approved' || status === 'Completed') {
      fields.push(`processed_by = $${index++}`);
      values.push(req.user.userId || req.user.email);
      fields.push(`processed_at = NOW()`);
    }
    values.push(req.params.id);
    await getDB().query(`UPDATE asset_requests SET ${fields.join(', ')} WHERE id = $${index}`, values);
    res.json({ message: 'Request updated' });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ message: 'Server error updating request' });
  }
});

// DELETE request (Monitor only or own pending request)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM asset_requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Request not found' });
    const request = rows[0];
    if (req.user.role !== 'Monitor' && request.submitted_by !== (req.user.userId || req.user.email)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role !== 'Monitor' && request.status !== 'Pending') {
      return res.status(403).json({ message: 'Can only delete pending requests' });
    }
    await getDB().query('DELETE FROM asset_requests WHERE id = $1', [req.params.id]);
    res.json({ message: 'Request deleted' });
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ message: 'Server error deleting request' });
  }
});

module.exports = router;
