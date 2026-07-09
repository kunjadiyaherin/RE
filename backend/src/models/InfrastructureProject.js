const mongoose = require('mongoose');

const InfrastructureProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectType: { type: String, enum: ['Metro Line', 'Expressway', 'Airport', 'Industrial Corridor', 'Smart City Development', 'Railway Upgrade'], required: true },
  city: { type: String, required: true },
  state: { type: String, enum: ['Gujarat', 'Maharashtra', 'National'], required: true },
  status: { type: String, enum: ['Planned', 'Under Construction', 'Completed'], default: 'Planned' },
  expectedCompletionYear: { type: Number },
  estimatedCostINR_Crores: { type: Number },
  impactRadiusKm: { type: Number, default: 5 },
  affectedLocalities: [{ type: String }],
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InfrastructureProject', InfrastructureProjectSchema);
