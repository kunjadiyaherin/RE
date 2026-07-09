const mongoose = require('mongoose');

const PriceForecastSchema = new mongoose.Schema({
  city: { type: String, required: true },
  locality: { type: String, required: true },
  forecastModel: { type: String, default: 'Linear Regression' },
  currentPricePerSqm: { type: Number, required: true },
  forecast_6m: { type: Number },
  forecast_1y: { type: Number },
  forecast_5y: { type: Number },
  growthProbability: { type: Number, min: 0, max: 1 }, // 0 to 1
  rentalYieldPercent: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
});

PriceForecastSchema.index({ city: 1, locality: 1 }, { unique: true });

module.exports = mongoose.model('PriceForecast', PriceForecastSchema);
