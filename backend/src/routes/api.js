const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const reraController = require('../controllers/reraController');
const builderController = require('../controllers/builderController');
const transactionController = require('../controllers/transactionController');
const analyticsController = require('../controllers/analyticsController');
const fraudController = require('../controllers/fraudController');
const adminController = require('../controllers/adminController');
const watchlistController = require('../controllers/watchlistController');

// 1. Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/resend-otp', authController.resendOtp);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', auth, authController.getMe);

// 2. RERA Routes
router.get('/rera/verify', reraController.verifyProject);
router.get('/rera/projects', reraController.getProjects);
router.get('/rera/projects/:id', reraController.getProjectById);

// 3. Builder Routes
router.get('/builders', builderController.getBuilders);
router.get('/builders/:id', builderController.getBuilderProfile);


// 5. Transaction & Circle Rates
router.get('/transactions', transactionController.getTransactions);
router.get('/transactions/circle-rates', transactionController.getCircleRates);

// 6. Analytics, Forecast, and Growth
router.get('/analytics/city-comparison', analyticsController.getCityComparison);
router.get('/analytics/area-growth', analyticsController.getAreaGrowth);
router.get('/analytics/forecast', analyticsController.getForecast);
router.get('/analytics/opportunities', analyticsController.getInvestmentOpportunities);

// 7. Fraud Detection
router.get('/fraud/reports', fraudController.getFraudReports);
router.get('/fraud/scan', fraudController.scanForAnomalies);

// 8. Watchlist
router.get('/watchlist', auth, watchlistController.getWatchlist);
router.post('/watchlist/add', auth, watchlistController.addToWatchlist);
router.post('/watchlist/remove', auth, watchlistController.removeFromWatchlist);

// 9. Admin Control
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied. Admin privileges required.' });
  }
};

router.get('/admin/health', auth, adminOnly, adminController.getSystemHealth);
router.post('/admin/sync', auth, adminOnly, adminController.triggerCrawlerSync);

module.exports = router;
