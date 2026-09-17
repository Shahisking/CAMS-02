const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

function mapRow(r) {
  return {
    id: String(r.id),
    assetId: r.asset_id || '',
    assetName: r.asset_name || '',
    department: r.department || '',
    problem: r.problem || r.description || '',
    priority: r.priority || 'Medium',
    assignedTechnician: r.assigned_technician || '',
    estimatedCost: r.estimated_cost ? Number(r.estimated_cost) : 0,
    actualCost: r.actual_cost ? Number(r.actual_cost) : null,
    status: r.status || 'Pending',
    requestedBy: r.requested_by || '',
    requestDate: r.request_date || r.created_at,
    completedDate: r.completed_date || null,
    remarks: r.remarks || '',
  };
}

// GET all maintenance tickets
router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM maintenance_tickets ORDER BY created_at DESC');
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error('Error fetching maintenance tickets:', err);
    res.status(500).json({ message: 'Server error fetching maintenance tickets' });
  }
});

// POST create maintenance ticket (any authenticated user)
router.post('/', verifyToken, async (req, res) => {
  const a = req.body;
  try {
    const { rows } = await getDB().query(
      `INSERT INTO maintenance_tickets
        (asset_id, asset_name, department, problem, priority, assigned_technician,
         estimated_cost, status, requested_by, request_date, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        a.assetId || null,
        a.assetName || 'Unknown Asset',
        a.department || 'General',
        a.problem || '',
        a.priority || 'Medium',
        a.assignedTechnician || 'Pending Monitor Assignment',
        a.estimatedCost || 0,
        a.status || 'Pending',
        a.requestedBy || '',
        a.requestDate || new Date().toISOString(),
        a.remarks || null,
      ]
    );
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('Error creating maintenance ticket:', err);
    res.status(500).json({ message: 'Server error creating maintenance ticket' });
  }
});

// PATCH update maintenance ticket (Monitor only)
router.patch('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fieldMapping = {
    status: 'status',
    assignedTechnician: 'assigned_technician',
    actualCost: 'actual_cost',
    completedDate: 'completed_date',
    remarks: 'remarks',
  };
  const fields = [];
  const values = [];
  let index = 1;
  for (const key in updates) {
    if (fieldMapping[key] && updates[key] !== undefined) {
      fields.push(`${fieldMapping[key]} = $${index++}`);
      values.push(updates[key]);
    }
  }
  if (!fields.length) return res.status(400).json({ message: 'No valid fields to update' });
  try {
    values.push(id);
    const { rows } = await getDB().query(
      `UPDATE maintenance_tickets SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ message: 'Ticket not found' });
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error('Error updating maintenance ticket:', err);
    res.status(500).json({ message: 'Server error updating maintenance ticket' });
  }
});

module.exports = router;
