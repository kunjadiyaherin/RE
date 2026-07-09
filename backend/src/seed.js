const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

// Import models
const User = require('./models/User');
const Builder = require('./models/Builder');
const RERAProject = require('./models/RERAProject');
const LandRecord = require('./models/LandRecord');
const PropertyTransaction = require('./models/PropertyTransaction');
const AreaAnalytics = require('./models/AreaAnalytics');
const InfrastructureProject = require('./models/InfrastructureProject');
const HistoricalMarketData = require('./models/HistoricalMarketData');
const PriceForecast = require('./models/PriceForecast');
const FraudReport = require('./models/FraudReport');
const GovernmentDataset = require('./models/GovernmentDataset');
const Notification = require('./models/Notification');
const SystemLog = require('./models/SystemLog');

// Import mock data
const mockData = require('./mockData');

const seedDB = async () => {
  // Connect to DB
  await connectDB();

  if (!mongoose.connection.readyState) {
    console.error('[Seeder ERROR] MongoDB not connected. Cannot run seed script.');
    process.exit(1);
  }

  try {
    console.log('[Seeder] Cleaning existing collections...');
    await User.deleteMany({});
    await Builder.deleteMany({});
    await RERAProject.deleteMany({});
    await LandRecord.deleteMany({});
    await PropertyTransaction.deleteMany({});
    await AreaAnalytics.deleteMany({});
    await InfrastructureProject.deleteMany({});
    await HistoricalMarketData.deleteMany({});
    await PriceForecast.deleteMany({});
    await FraudReport.deleteMany({});
    await GovernmentDataset.deleteMany({});
    await Notification.deleteMany({});
    await SystemLog.deleteMany({});

    console.log('[Seeder] Seeding Users...');
    const bcrypt = require('bcryptjs');
    const hashedAdminPassword = await bcrypt.hash('password123', 10);
    await User.insertMany([
      {
        username: 'admin',
        email: 'admin@propertyintel.com',
        password: hashedAdminPassword,
        role: 'admin',
        isVerified: true,
        createdAt: new Date()
      },
      {
        username: 'investor',
        email: 'investor@propertyintel.com',
        password: hashedAdminPassword,
        role: 'investor',
        isVerified: true,
        createdAt: new Date()
      }
    ]);

    console.log('[Seeder] Seeding Builders...');
    await Builder.insertMany(mockData.builders);

    console.log('[Seeder] Seeding RERAProjects...');
    await RERAProject.insertMany(mockData.reraProjects);

    console.log('[Seeder] Seeding LandRecords...');
    await LandRecord.insertMany(mockData.landRecords);

    console.log('[Seeder] Seeding PropertyTransactions...');
    await PropertyTransaction.insertMany(mockData.propertyTransactions);

    console.log('[Seeder] Seeding AreaAnalytics...');
    await AreaAnalytics.insertMany(mockData.areaAnalytics);

    console.log('[Seeder] Seeding InfrastructureProjects...');
    await InfrastructureProject.insertMany(mockData.infrastructureProjects);

    console.log('[Seeder] Seeding HistoricalMarketData...');
    await HistoricalMarketData.insertMany(mockData.historicalMarketData);

    console.log('[Seeder] Seeding PriceForecasts...');
    await PriceForecast.insertMany(mockData.priceForecasts);

    console.log('[Seeder] Seeding FraudReports...');
    await FraudReport.insertMany(mockData.fraudReports);

    console.log('[Seeder] Seeding GovernmentDatasets...');
    await GovernmentDataset.insertMany(mockData.governmentDatasets);

    console.log('[Seeder] Seeding Notifications...');
    await Notification.insertMany(mockData.notifications);

    console.log('[Seeder] Seeding SystemLogs...');
    await SystemLog.insertMany(mockData.systemLogs);

    console.log('[Seeder] Database Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder ERROR] Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
