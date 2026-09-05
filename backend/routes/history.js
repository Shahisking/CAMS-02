// backend/routes/history.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM asset_history ORDER BY date DESC');
    res.json(rows.map(r => ({
      id: String(r.id), assetId: r.asset_id, type: r.type,
      title: r.title, description: r.description,
      performedBy: r.performed_by, date: r.date,
      cost: r.cost ? Number(r.cost) : null
    })));
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

router.post('/', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { assetId, type, title, description, performedBy, date, cost } = req.body;
  try {
    const { rows } = await getDB().query(
      'INSERT INTO asset_history (asset_id,type,title,description,performed_by,date,cost) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [assetId, type, title, description, performedBy, date || new Date().toISOString(), cost || null]
    );
    res.status(201).json({ id: String(rows[0].id), assetId, type, title, description, performedBy, date, cost });
  } catch (err) {
    console.error('Error creating history event:', err);
    res.status(500).json({ message: 'Server error creating history event' });
  }
});

module.exports = router;
