const mongoose = require('mongoose');

const FraudReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  targetType: { type: String, enum: ['Project', 'Builder', 'Transaction', 'Land Record'], required: true },
  identifier: { type: String, required: true }, // e.g. RERA Reg Num, Deed Num, Survey Num
  city: { type: String, required: true },
  anomalyType: { type: String, enum: ['Repeated Delays', 'Unregistered Project Detect', 'Circle Rate Discrepancy', 'Duplicate Survey Registration', 'Legal Dispute Masking'], required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  description: { type: String, required: true },
  evidence: { type: mongoose.Schema.Types.Mixed },
  flaggedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FraudReport', FraudReportSchema);
