require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');
const dataService = require('./config/dataService');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // Limit each IP to 1500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Simple logging middleware to simulate Redis Caching checks
app.use((req, res, next) => {
  const cacheKey = `cache:${req.originalUrl}`;
  // Simulated Redis Check
  const hit = Math.random() > 0.65; // Simulate 35% Cache Hit Ratio for static GET analytics
  if (req.method === 'GET' && hit && (req.originalUrl.includes('comparison') || req.originalUrl.includes('opportunities'))) {
    console.log(`[Redis Cache Cache HIT] Key: ${cacheKey}`);
    res.setHeader('X-Cache-Lookup', 'HIT from Redis In-Memory');
  } else {
    if (req.method === 'GET') {
      console.log(`[Redis Cache Cache MISS] Key: ${cacheKey}. Fetching from Mongoose DB.`);
    }
  }
  next();
});

// Mount Routes
app.use('/api', apiRoutes);

// Root Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'Healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    dbConnected: !dataService.isMock()
  });
});

// Start Server & Connect to DB
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(` PROPERTY INTELLIGENCE backend listening on port ${PORT}`);
    console.log(` Health Status: http://localhost:${PORT}/health`);
    console.log(` API Endpoint: http://localhost:${PORT}/api/`);
    console.log(`=============================================================`);
  });

  // Background worker simulation loop: runs every 60 seconds
  // Simulates real-time crawlers adding state logs or updating stats
  setInterval(async () => {
    const activeStates = ['Gujarat', 'Maharashtra'];
    const randomState = activeStates[Math.floor(Math.random() * activeStates.length)];
    const date = new Date().toLocaleTimeString();
    
    console.log(`[Background Worker Queue] [${date}] Scraping official ${randomState} RERA table records...`);
    
    try {
      // Fetch datasets meta to simulate update record counts
      const name = `${randomState === 'Gujarat' ? 'Gujarat RERA Developer Database' : 'MahaRERA Project Registrations API'}`;
      const dataset = await dataService.governmentDatasets.find({});
      const target = dataset.find(d => d.datasetName === name);
      if (target) {
        const addedRecords = Math.floor(Math.random() * 5);
        await dataService.governmentDatasets.findOneAndUpdate(
          { datasetName: name },
          { 
            recordCount: target.recordCount + addedRecords,
            lastSyncTime: new Date()
          }
        );
        if (addedRecords > 0) {
          await dataService.systemLogs.create({
            level: 'info',
            message: `Background scraper parsed ${addedRecords} new project submissions for ${randomState} state index.`,
            component: `Crawler-${randomState === 'Gujarat' ? 'GujRERA' : 'MahaRERA'}`
          });
        }
      }
    } catch (err) {
      console.error('[Background Worker Error]: Failed during crawler sync simulation:', err.message);
    }
  }, 60000);
};

startServer();
