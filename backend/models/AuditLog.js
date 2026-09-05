// backend/models/AuditLog.js
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userEmail: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
