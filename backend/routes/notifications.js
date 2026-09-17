// backend/routes/notifications.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

// GET notifications (filtered by role if recipient_role is set)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    let query, params;
    if (userRole === 'Monitor') {
      query = 'SELECT * FROM notifications ORDER BY timestamp DESC';
      params = [];
    } else {
      query = 'SELECT * FROM notifications WHERE recipient_role IS NULL OR recipient_role = $1 ORDER BY timestamp DESC';
      params = [userRole];
    }
    const { rows } = await getDB().query(query, params);
    res.json(rows.map(r => ({
      id: String(r.id), title: r.title || 'System Notification',
      message: r.message, type: r.type || 'info',
      category: r.category || 'General', timestamp: r.timestamp,
      read: Boolean(r.is_read), assetId: r.asset_id,
      recipientRole: r.recipient_role || null,
    })));
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// POST create notification (any authenticated user - for report submissions)
router.post('/', verifyToken, async (req, res) => {
  const { title, message, type, category, assetId, recipientRole } = req.body;
  try {
    const { rows } = await getDB().query(
      `INSERT INTO notifications (title, message, type, category, asset_id, recipient_role, is_read, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW()) RETURNING id`,
      [title || 'System Notification', message, type || 'info', category || 'General', assetId || null, recipientRole || null]
    );
    res.status(201).json({
      id: String(rows[0].id), title, message, type, category, assetId,
      read: false, recipientRole: recipientRole || null,
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Server error creating notification' });
  }
});

// PATCH mark notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    await getDB().query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE all notifications (Monitor only)
router.delete('/all', verifyToken, requireRole(['Monitor']), async (req, res) => {
  try {
    await getDB().query('DELETE FROM notifications');
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).json({ message: 'Server error clearing notifications' });
  }
});

module.exports = router;
