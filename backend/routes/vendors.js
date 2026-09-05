// backend/routes/vendors.js
const express = require('express');
const { getDB } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await getDB().query('SELECT * FROM vendors');
    res.json(rows.map(r => ({
      id: r.id, name: r.name, category: r.category,
      contactPerson: r.contact_person, phone: r.phone, email: r.email,
      gstin: r.gstin, location: r.location,
      rating: r.rating ? Number(r.rating) : 0, status: r.status
    })));
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ message: 'Server error fetching vendors' });
  }
});

router.post('/', verifyToken, requireRole(['Monitor']), async (req, res) => {
  const { id, name, category, contactPerson, phone, email, gstin, location, rating, status } = req.body;
  const vendorId = id || `VND-${Date.now()}`;
  try {
    await getDB().query(
      'INSERT INTO vendors (id,name,category,contact_person,phone,email,gstin,location,rating,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [vendorId, name, category, contactPerson, phone, email, gstin, location, rating, status]
    );
    res.status(201).json({ id: vendorId, name, category, contactPerson, phone, email, gstin, location, rating, status });
  } catch (err) {
    console.error('Error creating vendor:', err);
    res.status(500).json({ message: 'Server error creating vendor' });
  }
});

module.exports = router;
