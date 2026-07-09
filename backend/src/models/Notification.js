const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, null for public global news
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['CrawlerAlert', 'FraudWarning', 'GrowthInsight', 'SystemUpdate'], default: 'GrowthInsight' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
