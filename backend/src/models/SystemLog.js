const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  message: { type: String, required: true },
  component: { type: String, required: true }, // 'Crawler-MahaRERA', 'Crawler-GujRERA', 'API-Server', 'AI-Engine', 'DB-Sync'
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemLog', SystemLogSchema);
