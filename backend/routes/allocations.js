// backend/routes/allocations.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM allocations ORDER BY date DESC');
    res.json(rows.map(r => ({
      id: String(r.id), assetId: r.asset_id, assetName: r.asset_name,
      fromLocation: r.from_location, toLocation: r.to_location,
      fromAssignee: r.from_assignee, toAssignee: r.to_assignee,
      transferredBy: r.transferred_by, date: r.date, reason: r.reason
    })));
  } catch (err) {
    console.error('Error fetching allocations:', err);
    res.status(500).json({ message: 'Server error fetching allocations' });
  }
});

router.post('/', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { assetId, assetName, fromLocation, toLocation, fromAssignee, toAssignee, transferredBy, date, reason } = req.body;
  try {
    const { rows } = await getDB().query(
      'INSERT INTO allocations (asset_id,asset_name,from_location,to_location,from_assignee,to_assignee,transferred_by,date,reason) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [assetId, assetName, fromLocation, toLocation, fromAssignee, toAssignee, transferredBy, date || new Date().toISOString(), reason]
    );
    const row = rows[0];
    res.status(201).json({ id: String(row.id), assetId, assetName, fromLocation, toLocation, fromAssignee, toAssignee, transferredBy, date: row.date, reason });
  } catch (err) {
    console.error('Error creating allocation:', err);
    res.status(500).json({ message: 'Server error creating allocation' });
  }
});

module.exports = router;
