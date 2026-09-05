// backend/routes/blocks.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM blocks ORDER BY name');
    res.json(rows.map(r => ({
      id: r.id, name: r.name, code: r.code,
      description: r.description, lastUpdated: r.last_updated
    })));
  } catch (err) {
    console.error('Error fetching blocks:', err);
    res.status(500).json({ message: 'Server error fetching blocks' });
  }
});

router.post('/', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Block name is required' });
  }
  try {
    const id = `BLK-${Date.now()}`;
    const { rows } = await getDB().query(
      'INSERT INTO blocks (id, name, code, description, last_updated) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [id, name.trim(), code || null, description || null]
    );
    const r = rows[0];
    res.status(201).json({ id: r.id, name: r.name, code: r.code, description: r.description, lastUpdated: r.last_updated });
  } catch (err) {
    console.error('Error creating block:', err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A block with this name already exists' });
    }
    res.status(500).json({ message: 'Server error creating block' });
  }
});

router.put('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Block name is required' });
  }
  try {
    const { rowCount } = await getDB().query(
      'UPDATE blocks SET name = $1, description = $2, last_updated = NOW() WHERE id = $3',
      [name.trim(), description || null, req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Block not found' });
    res.json({ message: 'Block updated' });
  } catch (err) {
    console.error('Error updating block:', err);
    res.status(500).json({ message: 'Server error updating block' });
  }
});

router.delete('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  try {
    const { rowCount } = await getDB().query('DELETE FROM blocks WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Block not found' });
    res.json({ message: 'Block deleted' });
  } catch (err) {
    console.error('Error deleting block:', err);
    res.status(500).json({ message: 'Server error deleting block' });
  }
});

module.exports = router;
