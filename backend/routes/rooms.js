// backend/routes/rooms.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

function mapRow(r) {
  return {
    id: String(r.id),
    roomNumber: r.room_number,
    roomName: r.room_name,
    block: r.block,
    floor: r.floor,
    department: r.department || 'General',
    capacity: r.capacity ? Number(r.capacity) : 0,
    roomType: r.room_type,
    status: r.status,
    description: r.description,
  };
}

// GET all rooms
router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM rooms ORDER BY block, floor, room_number');
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
});

// GET rooms by block
router.get('/block/:block', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query(
      'SELECT * FROM rooms WHERE block = $1 ORDER BY floor, room_number',
      [req.params.block]
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error('Error fetching rooms by block:', err);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
});

// POST create room (Monitor only)
router.post('/', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const b = req.body;
  const room_number = b.room_number || b.roomNumber;
  const room_name = b.room_name || b.roomName;
  const block = b.block;
  const floor = b.floor;
  const department = b.department;
  const room_type = b.room_type || b.roomType;
  const capacity = b.capacity;
  const status = b.status;
  const description = b.description;
  if (!room_number || !block || !floor) {
    return res.status(400).json({ message: 'room_number, block, and floor are required' });
  }
  try {
    const { rows } = await getDB().query(
      `INSERT INTO rooms (room_number, room_name, block, floor, department, room_type, capacity, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [room_number, room_name || room_number, block, floor, department || null, room_type || 'Classroom', capacity || 0, status || 'Active', description || null]
    );
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('Error creating room:', err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Room number already exists in this block' });
    }
    res.status(500).json({ message: 'Server error creating room' });
  }
});

// PUT update room (Monitor only)
router.put('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fieldMapping = {
    room_number: 'room_number', roomNumber: 'room_number',
    room_name: 'room_name', roomName: 'room_name',
    block: 'block',
    floor: 'floor', department: 'department',
    room_type: 'room_type', roomType: 'room_type',
    capacity: 'capacity', status: 'status', description: 'description'
  };
  const fields = [], values = [];
  let index = 1;
  for (const key in updates) {
    if (fieldMapping[key]) {
      fields.push(`${fieldMapping[key]} = $${index++}`);
      values.push(updates[key]);
    }
  }
  if (!fields.length) return res.status(400).json({ message: 'No valid fields to update' });
  try {
    values.push(id);
    await getDB().query(`UPDATE rooms SET ${fields.join(', ')} WHERE id = $${index}`, values);
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ message: 'Server error updating room' });
  }
});

// DELETE room (Monitor only)
router.delete('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  try {
    await getDB().query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ message: 'Server error deleting room' });
  }
});

module.exports = router;
