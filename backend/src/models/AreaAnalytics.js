const mongoose = require('mongoose');

const AreaAnalyticsSchema = new mongoose.Schema({
  city: { type: String, required: true },
  locality: { type: String, required: true },
  state: { type: String, enum: ['Gujarat', 'Maharashtra'], required: true },
  averageMarketRatePerSqm: { type: Number, required: true },
  averageCircleRatePerSqm: { type: Number, required: true },
  growthScore: { type: Number, default: 50, min: 0, max: 100 },
  demandTrend: { type: String, enum: ['High', 'Moderate', 'Low'], default: 'Moderate' },
  infrastructureImpactScore: { type: Number, default: 50 },
  populationDensityPerSqKm: { type: Number },
  householdIncomeTier: { type: String, enum: ['High', 'Upper-Middle', 'Middle', 'Low-Middle'], default: 'Middle' },
  metroProximityKm: { type: Number },
  highwayProximityKm: { type: Number },
  airportProximityKm: { type: Number },
  commercialDensityScore: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now }
});

AreaAnalyticsSchema.index({ city: 1, locality: 1 }, { unique: true });

module.exports = mongoose.model('AreaAnalytics', AreaAnalyticsSchema);
