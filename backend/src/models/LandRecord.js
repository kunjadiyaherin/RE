const mongoose = require('mongoose');

const MutationEventSchema = new mongoose.Schema({
  mutationNumber: { type: String },
  date: { type: Date },
  buyer: { type: String },
  seller: { type: String },
  mutationType: { type: String }, // Sale, Inheritance, Gift, Mortgage Release
  remarks: { type: String }
});

const LandRecordSchema = new mongoose.Schema({
  surveyNumber: { type: String, required: true },
  state: { type: String, enum: ['Gujarat', 'Maharashtra'], required: true },
  district: { type: String, required: true },
  taluka: { type: String, required: true },
  village: { type: String, required: true },
  ownerName: { type: String },
  landCategory: { type: String, enum: ['Agricultural', 'Non-Agricultural (NA)', 'Residential', 'Commercial', 'Industrial', 'Forestry'], default: 'Agricultural' },
  areaHectares: { type: Number, required: true },
  mutationHistory: [MutationEventSchema],
  governmentRestrictions: [{ type: String }], // CRZ, Wetland, Forest, NHAI Buffer, None
  createdAt: { type: Date, default: Date.now }
});

// Compound unique key for land records
LandRecordSchema.index({ surveyNumber: 1, state: 1, district: 1, taluka: 1, village: 1 }, { unique: true });

module.exports = mongoose.model('LandRecord', LandRecordSchema);
