const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/real_estate_db';
  console.log(`[Database] Attempting connection to MongoDB at: ${mongoURI}`);
  
  try {
    // Set connection timeout to 3 seconds so it doesn't hang forever if MongoDB is offline
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log('[Database] MongoDB Connected Successfully.');
  } catch (err) {
    isConnected = false;
    console.warn('====================================================================');
    console.warn('[Database WARNING] Could not connect to local MongoDB database.');
    console.warn('[Database WARNING] Please check if MongoDB Service is running or update MONGODB_URI.');
    console.warn('[Database WARNING] The application will automatically fall back to');
    console.warn('[Database WARNING] high-fidelity in-memory database simulation for testing.');
    console.warn('====================================================================');
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
