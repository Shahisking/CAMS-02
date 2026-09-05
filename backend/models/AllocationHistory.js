// backend/models/AllocationHistory.js
const mongoose = require('mongoose');

const AllocationHistorySchema = new mongoose.Schema({
  assetId: { type: String, required: true },
  assetName: { type: String, required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  fromAssignee: { type: String, required: true },
  toAssignee: { type: String, required: true },
  transferredBy: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
  reason: { type: String, default: '' }
});

module.exports = mongoose.model('AllocationHistory', AllocationHistorySchema);
