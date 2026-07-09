const { getDBStatus } = require('./db');
const mockData = require('../mockData');

// Models
const User = require('../models/User');
const Builder = require('../models/Builder');
const RERAProject = require('../models/RERAProject');
const LandRecord = require('../models/LandRecord');
const PropertyTransaction = require('../models/PropertyTransaction');
const AreaAnalytics = require('../models/AreaAnalytics');
const InfrastructureProject = require('../models/InfrastructureProject');
const HistoricalMarketData = require('../models/HistoricalMarketData');
const PriceForecast = require('../models/PriceForecast');
const FraudReport = require('../models/FraudReport');
const GovernmentDataset = require('../models/GovernmentDataset');
const Notification = require('../models/Notification');
const SystemLog = require('../models/SystemLog');
const Watchlist = require('../models/Watchlist');

// In-memory clones
const bcrypt = require('bcryptjs');
let memoryDB = { 
  ...mockData,
  users: [
    {
      _id: "60c72b2f9b1d8b2a3c8e4a99",
      username: "admin",
      email: "admin@propertyintel.com",
      password: bcrypt.hashSync('password123', 10),
      role: "admin",
      isVerified: true,
      createdAt: new Date()
    },
    {
      _id: "60c72b2f9b1d8b2a3c8e4a98",
      username: "investor",
      email: "investor@propertyintel.com",
      password: bcrypt.hashSync('password123', 10),
      role: "investor",
      isVerified: true,
      createdAt: new Date()
    }
  ]
};
let memoryWatchlists = [];

const dataService = {
  // Check if we should use mock fallbacks
  isMock: () => {
    return !getDBStatus();
  },

  // Users
  users: {
    find: async (query) => {
      if (!dataService.isMock()) return User.find(query);
      return memoryDB.users || [];
    },
    findOne: async (query) => {
      if (!dataService.isMock()) return User.findOne(query);
      const list = memoryDB.users || [];
      return list.find(u => {
        if (query.username && u.username !== query.username) return false;
        if (query.email && u.email !== query.email) return false;
        if (query._id && u._id !== query._id) return false;
        return true;
      }) || null;
    },
    create: async (userData) => {
      if (!dataService.isMock()) {
        const u = new User(userData);
        return u.save();
      }
      if (!memoryDB.users) memoryDB.users = [];
      const newU = { 
        _id: `user_${Date.now()}`, 
        isVerified: false, 
        ...userData, 
        createdAt: new Date() 
      };
      memoryDB.users.push(newU);
      return newU;
    },
    save: async (userObj) => {
      if (!dataService.isMock()) {
        if (typeof userObj.save === 'function') {
          return userObj.save();
        }
        return User.findByIdAndUpdate(userObj._id, userObj, { new: true });
      }
      const idx = memoryDB.users.findIndex(u => u._id === userObj._id);
      if (idx !== -1) {
        memoryDB.users[idx] = { ...memoryDB.users[idx], ...userObj };
        return memoryDB.users[idx];
      }
      return userObj;
    }
  },

  // Builders
  builders: {
    find: async (query) => {
      if (!dataService.isMock()) return Builder.find(query);
      let list = memoryDB.builders;
      if (query && query.state) {
        list = list.filter(b => b.state === query.state || b.state === 'Both');
      }
      return list;
    },
    findOne: async (query) => {
      if (!dataService.isMock()) return Builder.findOne(query);
      return memoryDB.builders.find(b => {
        if (query._id && b._id !== query._id) return false;
        if (query.builderName && b.builderName.toLowerCase() !== query.builderName.toLowerCase()) return false;
        return true;
      }) || null;
    }
  },

  // RERA Projects
  reraProjects: {
    find: async (query) => {
      if (!dataService.isMock()) return RERAProject.find(query);
      let list = memoryDB.reraProjects;
      if (query) {
        if (query.state) list = list.filter(p => p.state === query.state);
        if (query.city) list = list.filter(p => p.city.toLowerCase() === query.city.toLowerCase());
        if (query.completionStatus) list = list.filter(p => p.completionStatus === query.completionStatus);
        if (query.search) {
          const s = query.search.toLowerCase();
          list = list.filter(p => p.projectName.toLowerCase().includes(s) || p.registrationNumber.toLowerCase().includes(s) || p.builderName.toLowerCase().includes(s));
        }
      }
      return list;
    },
    findOne: async (query) => {
      if (!dataService.isMock()) return RERAProject.findOne(query);
      return memoryDB.reraProjects.find(p => {
        if (query._id && p._id !== query._id) return false;
        if (query.registrationNumber && p.registrationNumber.toLowerCase() !== query.registrationNumber.toLowerCase()) return false;
        return true;
      }) || null;
    }
  },

  // Land Records
  landRecords: {
    find: async (query) => {
      if (!dataService.isMock()) return LandRecord.find(query);
      let list = memoryDB.landRecords;
      if (query) {
        if (query.state) list = list.filter(l => l.state === query.state);
        if (query.district) list = list.filter(l => l.district.toLowerCase() === query.district.toLowerCase());
        if (query.surveyNumber) list = list.filter(l => l.surveyNumber === query.surveyNumber);
      }
      return list;
    },
    findOne: async (query) => {
      if (!dataService.isMock()) return LandRecord.findOne(query);
      return memoryDB.landRecords.find(l => {
        if (query.surveyNumber && l.surveyNumber !== query.surveyNumber) return false;
        if (query.state && l.state !== query.state) return false;
        if (query.district && l.district.toLowerCase() !== query.district.toLowerCase()) return false;
        if (query.taluka && l.taluka.toLowerCase() !== query.taluka.toLowerCase()) return false;
        if (query.village && l.village.toLowerCase() !== query.village.toLowerCase()) return false;
        return true;
      }) || null;
    }
  },

  // Property Transactions
  propertyTransactions: {
    find: async (query) => {
      if (!dataService.isMock()) return PropertyTransaction.find(query);
      let list = memoryDB.propertyTransactions;
      if (query) {
        if (query.city) list = list.filter(t => t.city.toLowerCase() === query.city.toLowerCase());
        if (query.locality) list = list.filter(t => t.locality.toLowerCase() === query.locality.toLowerCase());
        if (query.propertyType) list = list.filter(t => t.propertyType === query.propertyType);
      }
      return list;
    }
  },

  // Area Analytics
  areaAnalytics: {
    find: async (query) => {
      if (!dataService.isMock()) return AreaAnalytics.find(query);
      let list = memoryDB.areaAnalytics;
      if (query) {
        if (query.city) list = list.filter(a => a.city.toLowerCase() === query.city.toLowerCase());
      }
      return list;
    },
    findOne: async (query) => {
      if (!dataService.isMock()) return AreaAnalytics.findOne(query);
      return memoryDB.areaAnalytics.find(a => {
        if (query.city && a.city.toLowerCase() !== query.city.toLowerCase()) return false;
        if (query.locality && a.locality.toLowerCase() !== query.locality.toLowerCase()) return false;
        return true;
      }) || null;
    }
  },

  // Infrastructure Projects
  infrastructureProjects: {
    find: async (query) => {
      if (!dataService.isMock()) return InfrastructureProject.find(query);
      let list = memoryDB.infrastructureProjects;
      if (query) {
        if (query.city) list = list.filter(i => i.city.toLowerCase() === query.city.toLowerCase());
        if (query.status) list = list.filter(i => i.status === query.status);
      }
      return list;
    }
  },

  // Historical Market Data
  historicalMarketData: {
    find: async (query) => {
      if (!dataService.isMock()) return HistoricalMarketData.find(query);
      let list = memoryDB.historicalMarketData;
      if (query) {
        if (query.city) list = list.filter(h => h.city.toLowerCase() === query.city.toLowerCase());
        if (query.locality) list = list.filter(h => h.locality.toLowerCase() === query.locality.toLowerCase());
      }
      return list;
    }
  },

  // Price Forecast
  priceForecasts: {
    find: async (query) => {
      if (!dataService.isMock()) return PriceForecast.find(query);
      let list = memoryDB.priceForecasts;
      if (query) {
        if (query.city) list = list.filter(f => f.city.toLowerCase() === query.city.toLowerCase());
        if (query.locality) list = list.filter(f => f.locality.toLowerCase() === query.locality.toLowerCase());
      }
      return list;
    },
    findOne: async (query) => {
      if (!dataService.isMock()) return PriceForecast.findOne(query);
      return memoryDB.priceForecasts.find(f => {
        if (query.city && f.city.toLowerCase() !== query.city.toLowerCase()) return false;
        if (query.locality && f.locality.toLowerCase() !== query.locality.toLowerCase()) return false;
        return true;
      }) || null;
    }
  },

  // Fraud Reports
  fraudReports: {
    find: async (query) => {
      if (!dataService.isMock()) return FraudReport.find(query);
      let list = memoryDB.fraudReports;
      if (query) {
        if (query.city) list = list.filter(f => f.city.toLowerCase() === query.city.toLowerCase());
        if (query.riskLevel) list = list.filter(f => f.riskLevel === query.riskLevel);
      }
      return list;
    }
  },

  // Government Datasets (Crawler Status)
  governmentDatasets: {
    find: async (query) => {
      if (!dataService.isMock()) return GovernmentDataset.find(query);
      return memoryDB.governmentDatasets;
    },
    findOneAndUpdate: async (query, update) => {
      if (!dataService.isMock()) return GovernmentDataset.findOneAndUpdate(query, update, { new: true });
      const ds = memoryDB.governmentDatasets.find(d => d.datasetName === query.datasetName);
      if (ds) {
        Object.assign(ds, update);
        return ds;
      }
      return null;
    }
  },

  // Notifications
  notifications: {
    find: async (query) => {
      if (!dataService.isMock()) return Notification.find(query).sort({ createdAt: -1 });
      return [...memoryDB.notifications].sort((a, b) => b.createdAt - a.createdAt);
    },
    create: async (notifData) => {
      if (!dataService.isMock()) {
        const notif = new Notification(notifData);
        return notif.save();
      }
      const newNotif = { _id: `notif_${Date.now()}`, ...notifData, isRead: false, createdAt: new Date() };
      memoryDB.notifications.unshift(newNotif);
      return newNotif;
    },
    updateMany: async (query, update) => {
      if (!dataService.isMock()) return Notification.updateMany(query, update);
      memoryDB.notifications.forEach(n => {
        if (query.isRead !== undefined && n.isRead === query.isRead) {
          Object.assign(n, update);
        }
      });
      return { modifiedCount: memoryDB.notifications.length };
    }
  },

  // System Logs
  systemLogs: {
    find: async (query) => {
      if (!dataService.isMock()) return SystemLog.find(query).sort({ timestamp: -1 }).limit(100);
      return [...memoryDB.systemLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    },
    create: async (logData) => {
      if (!dataService.isMock()) {
        const log = new SystemLog(logData);
        return log.save();
      }
      const newLog = { _id: `log_${Date.now()}`, ...logData, timestamp: new Date() };
      memoryDB.systemLogs.unshift(newLog);
      return newLog;
    }
  },

  // Watchlists
  watchlists: {
    findOne: async (query) => {
      if (!dataService.isMock()) {
        return Watchlist.findOne(query)
          .populate('savedBuilders')
          .populate('savedProjects');
      }
      let wl = memoryWatchlists.find(w => w.userId.toString() === query.userId.toString());
      if (!wl) {
        wl = {
          userId: query.userId,
          savedCities: [],
          savedLocalities: [],
          savedBuilders: [],
          savedProjects: []
        };
        memoryWatchlists.push(wl);
      }
      // Simulate populate by resolving references
      const populated = { ...wl };
      populated.savedBuilders = wl.savedBuilders.map(id => memoryDB.builders.find(b => b._id === id.toString())).filter(Boolean);
      populated.savedProjects = wl.savedProjects.map(id => memoryDB.reraProjects.find(p => p._id === id.toString())).filter(Boolean);
      return populated;
    },
    findOneAndUpdate: async (query, update, options) => {
      if (!dataService.isMock()) return Watchlist.findOneAndUpdate(query, update, options);
      let wl = memoryWatchlists.find(w => w.userId.toString() === query.userId.toString());
      if (!wl) {
        wl = {
          userId: query.userId,
          savedCities: [],
          savedLocalities: [],
          savedBuilders: [],
          savedProjects: []
        };
        memoryWatchlists.push(wl);
      }
      if (update.$set) {
        Object.assign(wl, update.$set);
      }
      if (update.$addToSet) {
        for (const [key, val] of Object.entries(update.$addToSet)) {
          if (Array.isArray(wl[key])) {
            if (typeof val === 'object' && val.city) {
              // Localities unique check
              const exists = wl[key].some(item => item.city === val.city && item.locality === val.locality);
              if (!exists) wl[key].push(val);
            } else {
              if (!wl[key].includes(val)) wl[key].push(val);
            }
          }
        }
      }
      if (update.$pull) {
        for (const [key, val] of Object.entries(update.$pull)) {
          if (Array.isArray(wl[key])) {
            if (typeof val === 'object' && val.city) {
              wl[key] = wl[key].filter(item => !(item.city === val.city && item.locality === val.locality));
            } else {
              wl[key] = wl[key].filter(item => item.toString() !== val.toString());
            }
          }
        }
      }
      return wl;
    }
  }
};

module.exports = dataService;
