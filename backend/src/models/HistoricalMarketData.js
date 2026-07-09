const mongoose = require('mongoose');

const HistoricalMarketDataSchema = new mongoose.Schema({
  city: { type: String, required: true },
  locality: { type: String, required: true },
  year: { type: Number, required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  averagePricePerSqm: { type: Number, required: true },
  transactionVolume: { type: Number, default: 0 },
  newLaunchCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

HistoricalMarketDataSchema.index({ city: 1, locality: 1, year: 1, quarter: 1 }, { unique: true });

module.exports = mongoose.model('HistoricalMarketData', HistoricalMarketDataSchema);
