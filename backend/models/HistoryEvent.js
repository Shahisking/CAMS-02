// backend/models/HistoryEvent.js
const mongoose = require('mongoose');

const HistoryEventSchema = new mongoose.Schema({
  assetId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
  cost: { type: Number }
});

module.exports = mongoose.model('HistoryEvent', HistoryEventSchema);
