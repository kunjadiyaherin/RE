const mongoose = require('mongoose');

const RERAProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  state: { type: String, enum: ['Gujarat', 'Maharashtra'], required: true },
  builderName: { type: String, required: true },
  builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder' },
  completionStatus: { type: String, enum: ['Completed', 'Ongoing', 'Delayed'], default: 'Ongoing' },
  registrationDate: { type: Date },
  completionDate: { type: Date },
  originalCompletionDate: { type: Date },
  legalApprovals: [{ type: String }],
  delayedMonths: { type: Number, default: 0 },
  legalDisputeFlags: { type: Boolean, default: false },
  disputeDetails: { type: String },
  locality: { type: String },
  city: { type: String, required: true },
  totalAreaSqm: { type: Number },
  projectType: { type: String, enum: ['Residential', 'Commercial', 'Mixed', 'Land Development'], default: 'Residential' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RERAProject', RERAProjectSchema);
