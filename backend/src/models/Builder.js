const mongoose = require('mongoose');

const BuilderSchema = new mongoose.Schema({
  builderName: { type: String, required: true, unique: true },
  panNumber: { type: String },
  registrationCount: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  ongoingProjects: { type: Number, default: 0 },
  delayedProjects: { type: Number, default: 0 },
  averageDelayMonths: { type: Number, default: 0 },
  trustScore: { type: Number, default: 100, min: 0, max: 100 },
  state: { type: String, enum: ['Gujarat', 'Maharashtra', 'Both'], default: 'Gujarat' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Builder', BuilderSchema);
