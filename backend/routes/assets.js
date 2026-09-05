// backend/routes/assets.js
const express = require('express');
const { getDB } = require('../config/db');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

function mapRow(r) {
  return {
    id: r.id, name: r.name, category: r.category,
    chair_type_id: r.chair_type_id, department: r.department,
    building: r.building, floor: r.floor,
    roomNumber: r.room_number, location: r.room_number,
    purchaseDate: r.purchase_date, purchaseCost: r.purchase_cost ? Number(r.purchase_cost) : 0,
    vendor: r.vendor, warrantyExpiry: r.warranty_expiry,
    condition: r.condition, status: r.status,
    assignedTo: r.assigned_to, assignedType: r.assigned_type,
    qrCodeUrl: r.qr_code_url, imageUrl: r.image_url,
    specifications: r.specifications, lastInspected: r.last_inspected
  };
}

// GET all assets
router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM assets');
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ message: 'Server error fetching assets' });
  }
});

// GET asset by id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Asset not found' });
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const crypto = require('crypto');

// POST create asset (Monitor only)
router.post('/', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const a = req.body;
  const uniqueSuffix = crypto.randomUUID().split('-')[0].toUpperCase();
  const id = a.id || `AIT-${(a.category || 'AST').substring(0, 3).toUpperCase()}-${uniqueSuffix}`;
  try {
    await getDB().query(
      `INSERT INTO assets (id,name,category,chair_type_id,department,building,floor,room_number,
        purchase_date,purchase_cost,vendor,warranty_expiry,condition,status,
        assigned_to,assigned_type,qr_code_url,image_url,specifications,last_inspected)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [id, a.name, a.category||null, a.chair_type_id||null, a.department||null, a.building||null,
       a.floor||null, a.roomNumber||a.location||null, a.purchaseDate||null, a.purchaseCost||0,
       a.vendor||null, a.warrantyExpiry||null, a.condition||'Good', a.status||'Active',
       a.assignedTo||null, a.assignedType||null, a.qrCodeUrl||null, a.imageUrl||null,
       a.specifications||null, a.lastInspected||null]
    );
    res.status(201).json({ ...a, id });
  } catch (err) {
    console.error('Error creating asset:', err);
    res.status(500).json({ message: 'Server error creating asset' });
  }
});

// PUT update asset (Monitor only)
router.put('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fieldMapping = {
    name:'name', category:'category', chair_type_id:'chair_type_id',
    department:'department', building:'building', floor:'floor',
    roomNumber:'room_number', location:'room_number',
    purchaseDate:'purchase_date', purchaseCost:'purchase_cost',
    vendor:'vendor', warrantyExpiry:'warranty_expiry',
    condition:'condition', status:'status',
    assignedTo:'assigned_to', assignedType:'assigned_type',
    qrCodeUrl:'qr_code_url', imageUrl:'image_url',
    specifications:'specifications', lastInspected:'last_inspected'
  };
  const fields = [], values = [];
  let index = 1;
  for (const key in updates) {
    if (fieldMapping[key]) { fields.push(`${fieldMapping[key]} = $${index++}`); values.push(updates[key]); }
  }
  if (!fields.length) return res.status(400).json({ message: 'No valid fields to update' });
  try {
    values.push(id);
    await getDB().query(`UPDATE assets SET ${fields.join(', ')} WHERE id = $${index}`, values);
    res.json({ message: 'Asset updated successfully' });
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).json({ message: 'Server error updating asset' });
  }
});

// DELETE asset (Monitor only)
router.delete('/:id', verifyToken, requireRole(['Monitor']), async (req, res) => {
  try {
    await getDB().query('DELETE FROM assets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).json({ message: 'Server error deleting asset' });
  }
});

// POST bulk import assets (Monitor only)
router.post('/import', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { assets } = req.body;
  if (!Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({ message: 'assets array is required and must not be empty' });
  }
  const crypto = require('crypto');
  const client = await getDB().connect();
  let importedCount = 0;
  const errors = [];
  try {
    await client.query('BEGIN');
    for (let i = 0; i < assets.length; i++) {
      const a = assets[i];
      try {
        const uniqueSuffix = crypto.randomUUID().split('-')[0].toUpperCase();
        const id = `AIT-${(a.category || 'AST').substring(0, 3).toUpperCase()}-${uniqueSuffix}`;
        await client.query(
          `INSERT INTO assets (id,name,category,chair_type_id,department,building,floor,room_number,
            purchase_date,purchase_cost,vendor,warranty_expiry,condition,status,
            assigned_to,assigned_type,qr_code_url,image_url,specifications,last_inspected)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
          [id, a.name || 'Imported Asset', a.category || null, a.chair_type_id || null,
           a.department || null, a.building || null, a.floor || null, a.roomNumber || null,
           a.purchaseDate || null, a.purchaseCost || 0, a.vendor || null, a.warrantyExpiry || null,
           a.condition || 'Good', a.status || 'Active', a.assignedTo || null, a.assignedType || null,
           a.qrCodeUrl || null, a.imageUrl || null, a.specifications || null, a.lastInspected || null]
        );
        importedCount++;
      } catch (rowErr) {
        errors.push(`Row ${i + 1}: ${rowErr.message}`);
      }
    }
    await client.query('COMMIT');
    res.status(201).json({
      message: `Import completed. ${importedCount} assets created.`,
      imported: importedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bulk import error:', err);
    res.status(500).json({ message: 'Server error during bulk import' });
  } finally {
    client.release();
  }
});

module.exports = router;
