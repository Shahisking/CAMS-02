// backend/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'alert', 'success'], default: 'info' },
  category: { type: String },
  timestamp: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false },
  assetId: { type: String }
});

module.exports = mongoose.model('Notification', NotificationSchema);
