const mongoose = require('mongoose');

const PropertyTransactionSchema = new mongoose.Schema({
  deedNumber: { type: String, required: true, unique: true },
  deedDate: { type: Date, required: true },
  state: { type: String, enum: ['Gujarat', 'Maharashtra'], required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  locality: { type: String, required: true },
  propertyType: { type: String, enum: ['Residential Apartment', 'Commercial Office', 'Retail Shop', 'Plot', 'Industrial Shed'], required: true },
  builtUpAreaSqm: { type: Number, required: true },
  transactionAmountINR: { type: Number, required: true },
  calculatedRatePerSqm: { type: Number, required: true },
  circleRatePerSqm: { type: Number, required: true },
  variancePercentage: { type: Number }, // ((Transaction rate - Circle rate) / Circle rate) * 100
  buyerName: { type: String },
  sellerName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PropertyTransaction', PropertyTransactionSchema);
