const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  savedCities: [{ type: String }],
  savedLocalities: [{
    city: { type: String },
    locality: { type: String }
  }],
  savedBuilders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Builder' }],
  savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RERAProject' }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
