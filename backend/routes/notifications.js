// backend/routes/notifications.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM notifications ORDER BY timestamp DESC');
    res.json(rows.map(r => ({
      id: String(r.id), title: r.title || 'System Notification',
      message: r.message, type: r.type || 'info',
      category: r.category || 'General', timestamp: r.timestamp,
      read: Boolean(r.is_read), assetId: r.asset_id
    })));
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

router.post('/', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { title, message, type, category, assetId } = req.body;
  try {
    const { rows } = await getDB().query(
      "INSERT INTO notifications (title,message,type,category,asset_id,is_read,timestamp) VALUES ($1,$2,$3,$4,$5,FALSE,NOW()) RETURNING id",
      [title || 'System Notification', message, type || 'info', category || 'General', assetId || null]
    );
    res.status(201).json({ id: String(rows[0].id), title, message, type, category, assetId, read: false });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Server error creating notification' });
  }
});

router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    await getDB().query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
