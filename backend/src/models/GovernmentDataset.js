const mongoose = require('mongoose');

const GovernmentDatasetSchema = new mongoose.Schema({
  datasetName: { type: String, required: true, unique: true },
  sourcePortal: { type: String, required: true }, // MahaRERA, GujRERA, smartcities.gov.in, state land portal
  dataType: { type: String, required: true }, // RERA Projects, Stamp Duty Transactions, Land Survey Records, Smart City Projects
  refreshFrequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Realtime'], default: 'Weekly' },
  lastSyncTime: { type: Date, default: Date.now },
  syncStatus: { type: String, enum: ['Operational', 'Degraded', 'Maintenance', 'Down'], default: 'Operational' },
  recordCount: { type: Number, default: 0 },
  errorLogsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GovernmentDataset', GovernmentDatasetSchema);
