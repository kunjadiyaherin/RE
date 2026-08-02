import * as mockData from './mockFrontendData';

const BASE_URL = 'http://localhost:5000/api';

// Pre-seed default mock users in client storage for local fallback
const initMockUsers = () => {
  try {
    const users = localStorage.getItem('mock_users');
    if (!users) {
      localStorage.setItem('mock_users', JSON.stringify([
        { username: 'admin', email: 'admin@propertyintel.com', password: 'password123', role: 'admin', isVerified: true },
        { username: 'investor', email: 'investor@propertyintel.com', password: 'password123', role: 'investor', isVerified: true },
        { username: 'analyst', email: 'analyst@propertyintel.com', password: 'password123', role: 'analyst', isVerified: true }
      ]));
    }
  } catch (err) {
    console.warn('[API Service] Failed to initialize mock users in localStorage:', err);
  }
};
initMockUsers();

// Helper to make API calls with fallback
const apiCall = async (endpoint, options = {}, mockFallbackFn) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      
      // If unverified login, propagate the payload so frontend can route to OTP
      if (res.status === 403 && errData.unverified) {
        const customErr = new Error(errData.error || 'Account unverified');
        customErr.unverified = true;
        customErr.email = errData.email;
        throw customErr;
      }
      
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.unverified) {
      throw err; // Do not failover unverified state, let frontend handle it
    }
    console.warn(`[API Failover] Endpoint ${endpoint} failed: ${err.message}. Invoking local mock fallback.`);
    return mockFallbackFn();
  }
};

export const apiService = {
  // RERA Projects
  getProjects: async (params = {}) => {
    return apiCall(`/rera/projects?city=${params.city || ''}&state=${params.state || ''}&status=${params.status || ''}&search=${params.search || ''}`, {}, () => {
      let list = mockData.reraProjects;
      if (params.state) list = list.filter(p => p.state === params.state);
      if (params.city) list = list.filter(p => p.city.toLowerCase() === params.city.toLowerCase());
      if (params.status) list = list.filter(p => p.completionStatus === params.status);
      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter(p => p.projectName.toLowerCase().includes(s) || p.registrationNumber.toLowerCase().includes(s) || p.builderName.toLowerCase().includes(s));
      }
      return list;
    });
  },

  verifyProject: async (regNumber) => {
    return apiCall(`/rera/verify?regNumber=${encodeURIComponent(regNumber)}`, {}, () => {
      const project = mockData.reraProjects.find(p => p.registrationNumber.toLowerCase() === regNumber.toLowerCase());
      if (!project) {
        return {
          status: 'Unverified',
          message: 'No record found in Gujarat or Maharashtra RERA public index with this registration number.',
          details: null
        };
      }
      let status = 'Verified';
      let message = 'Project registration details are successfully verified with the official state regulatory database.';
      if (project.legalDisputeFlags) {
        status = 'Risky';
        message = 'Project verified, but active legal disputes or regulatory warnings have been flagged.';
      } else if (project.completionStatus === 'Delayed' || project.delayedMonths > 12) {
        status = 'Risky';
        message = 'Project verified, but construction timeline exhibits severe delays exceeding 12 months.';
      }
      return { status, message, details: project };
    });
  },

  // Builders
  getBuilders: async (params = {}) => {
    return apiCall(`/builders?state=${params.state || ''}`, {}, () => {
      let list = mockData.builders;
      if (params.state) list = list.filter(b => b.state === params.state || b.state === 'Both');
      return list.map(b => {
        const ratio = b.registrationCount > 0 ? (b.delayedProjects / b.registrationCount) : 0;
        let score = 100 - Math.round((ratio * 45) + (b.averageDelayMonths * 2.5));
        score = Math.max(1, Math.min(100, score));
        return {
          ...b,
          calculatedTrustScore: score,
          ratingTier: score >= 90 ? 'Institutional Grade (A)' : score >= 80 ? 'Investment Grade (B)' : score >= 70 ? 'Speculative (C)' : 'High Risk (D)'
        };
      });
    });
  },

  getBuilderProfile: async (id) => {
    return apiCall(`/builders/${id}`, {}, () => {
      const builder = mockData.builders.find(b => b._id === id);
      if (!builder) throw new Error('Builder not found');
      const projects = mockData.reraProjects.filter(p => p.builderName === builder.builderName);
      
      const ratio = builder.registrationCount > 0 ? (builder.delayedProjects / builder.registrationCount) : 0;
      let score = 100 - Math.round((ratio * 45) + (builder.averageDelayMonths * 2.5));
      score = Math.max(1, Math.min(100, score));

      return {
        builderDetails: {
          ...builder,
          trustScore: score,
          ratingTier: score >= 90 ? 'Institutional Grade (A)' : score >= 80 ? 'Investment Grade (B)' : score >= 70 ? 'Speculative (C)' : 'High Risk (D)'
        },
        projects
      };
    });
  },


  // Transactions
  getTransactions: async (params = {}) => {
    return apiCall(`/transactions?city=${params.city || ''}&locality=${params.locality || ''}`, {}, () => {
      let list = mockData.propertyTransactions;
      if (params.city) list = list.filter(t => t.city.toLowerCase() === params.city.toLowerCase());
      if (params.locality) list = list.filter(t => t.locality.toLowerCase() === params.locality.toLowerCase());
      return list;
    });
  },

  getCircleRates: async (params = {}) => {
    return apiCall(`/transactions/circle-rates?city=${params.city || ''}`, {}, () => {
      let list = mockData.areaAnalytics;
      if (params.city) list = list.filter(a => a.city.toLowerCase() === params.city.toLowerCase());
      return list.map(a => ({
        locality: a.locality,
        city: a.city,
        state: a.state,
        circleRatePerSqm: a.averageCircleRatePerSqm,
        marketRatePerSqm: a.averageMarketRatePerSqm,
        variancePercent: Math.round(((a.averageMarketRatePerSqm - a.averageCircleRatePerSqm) / a.averageCircleRatePerSqm) * 100),
        classification: a.averageMarketRatePerSqm > a.averageCircleRatePerSqm * 1.25 ? 'Premium Gap' : 'Aligned'
      }));
    });
  },

  // Analytics Comparison
  getCityComparison: async () => {
    return apiCall('/analytics/city-comparison', {}, () => {
      return mockData.cityComparisons;
    });
  },

  // Area Growth
  getAreaGrowth: async (params = {}) => {
    return apiCall(`/analytics/area-growth?city=${params.city || ''}`, {}, () => {
      let list = mockData.areaAnalytics;
      if (params.city) list = list.filter(a => a.city.toLowerCase() === params.city.toLowerCase());
      return list.map(a => {
        const impacting = mockData.infrastructureProjects.filter(p => 
          p.city.toLowerCase() === a.city.toLowerCase() &&
          (p.affectedLocalities.some(loc => loc.toLowerCase() === a.locality.toLowerCase()) || a.metroProximityKm <= p.impactRadiusKm)
        );
        let boost = impacting.length * 5;
        if (a.metroProximityKm < 1.0) boost += 8;
        if (a.highwayProximityKm < 1.0) boost += 5;
        return {
          locality: a.locality,
          city: a.city,
          state: a.state,
          baseGrowthScore: a.growthScore,
          finalGrowthScore: Math.min(100, a.growthScore + boost),
          infrastructureImpactScore: a.infrastructureImpactScore,
          impactingProjects: impacting.map(p => p.projectName),
          metroProximityKm: a.metroProximityKm,
          highwayProximityKm: a.highwayProximityKm,
          commercialDensityScore: a.commercialDensityScore
        };
      });
    });
  },

  // Forecast Valuation
  getForecast: async (city, locality) => {
    return apiCall(`/analytics/forecast?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}`, {}, () => {
      const forecast = mockData.priceForecasts.find(f => f.city.toLowerCase() === city.toLowerCase() && f.locality.toLowerCase() === locality.toLowerCase());
      if (forecast) {
        return {
          source: 'Client-Side Forecast Fallback',
          ...forecast
        };
      }
      const base = city.toLowerCase() === 'mumbai' ? 180000 : 75000;
      return {
        source: 'Client-Side Estimator Fallback',
        city,
        locality,
        modelName: 'Simulation Base Rate Estimator',
        currentPricePerSqm: base,
        forecast_6m: Math.round(base * 1.04),
        forecast_1y: Math.round(base * 1.09),
        forecast_5y: Math.round(base * 1.45),
        growthProbability: 0.82,
        rentalYieldPercent: 3.1,
        historicalPoints: []
      };
    });
  },

  // Opportunities
  getOpportunities: async () => {
    return apiCall('/analytics/opportunities', {}, () => {
      return mockData.areaAnalytics.map(a => {
        const circleToMarketRatio = a.averageCircleRatePerSqm / a.averageMarketRatePerSqm;
        const undervaluationScore = Math.round((1 - circleToMarketRatio) * 100);
        const opportunityScore = Math.min(100, Math.round((a.growthScore * 0.6) + (undervaluationScore * 0.4)));
        return {
          city: a.city,
          locality: a.locality,
          state: a.state,
          marketPrice: a.averageMarketRatePerSqm,
          circleRate: a.averageCircleRatePerSqm,
          growthScore: a.growthScore,
          undervaluationGapPercent: undervaluationScore,
          opportunityScore,
          recommendationTier: opportunityScore >= 85 ? 'Strong Buy' : opportunityScore >= 70 ? 'Accumulate' : 'Neutral'
        };
      }).sort((a, b) => b.opportunityScore - a.opportunityScore);
    });
  },

  // Fraud Panels
  getFraudReports: async () => {
    return apiCall('/fraud/reports', {}, () => {
      return mockData.fraudReports;
    });
  },

  scanAnomalies: async () => {
    return apiCall('/fraud/scan', {}, () => {
      const anomalies = [];

      // 1. Builders with high delay ratios
      mockData.builders.forEach(b => {
        const ratio = b.registrationCount > 0 ? (b.delayedProjects / b.registrationCount) : 0;
        if (ratio > 0.25 || b.averageDelayMonths > 12) {
          anomalies.push({
            title: `High Delay Risk: ${b.builderName}`,
            targetType: 'Builder',
            identifier: b.panNumber,
            city: b.state === 'Maharashtra' ? 'Mumbai' : 'Ahmedabad',
            anomalyType: 'Repeated Delays',
            riskLevel: ratio > 0.4 ? 'High' : 'Medium',
            description: `${b.builderName} exhibits a project delay ratio of ${Math.round(ratio * 100)}% with an average delay of ${b.averageDelayMonths} months across their portfolio.`,
            evidence: { delayRatioPercent: Math.round(ratio * 100), averageDelayMonths: b.averageDelayMonths }
          });
        }
      });

      // 2. Projects with extreme delays or legal disputes
      mockData.reraProjects.forEach(p => {
        if (p.completionStatus === 'Delayed' && p.delayedMonths > 18) {
          anomalies.push({
            title: `Regulatory Warning: ${p.projectName}`,
            targetType: 'Project',
            identifier: p.registrationNumber,
            city: p.city,
            anomalyType: 'Repeated Delays',
            riskLevel: 'High',
            description: `Project has exceeded declared RERA timeline by ${p.delayedMonths} months. Municipal approvals review is pending.`,
            evidence: { delayedMonths: p.delayedMonths, legalDisputeFlags: p.legalDisputeFlags }
          });
        }
        if (p.legalDisputeFlags && p.completionStatus !== 'Completed') {
          anomalies.push({
            title: `Legal Dispute Flagged: ${p.projectName}`,
            targetType: 'Project',
            identifier: p.registrationNumber,
            city: p.city,
            anomalyType: 'Legal Dispute',
            riskLevel: 'High',
            description: `Active legal dispute or regulatory warning has been filed against this project. Investor caution advised.`,
            evidence: { disputeDetails: p.disputeDetails || 'Not disclosed', delayedMonths: p.delayedMonths }
          });
        }
      });

      // 3. Transactions below circle rate (fraud indicator)
      mockData.propertyTransactions.forEach(t => {
        const variance = t.variancePercentage !== undefined
          ? t.variancePercentage
          : t.circleRatePerSqm > 0
            ? Math.round(((t.calculatedRatePerSqm - t.circleRatePerSqm) / t.circleRatePerSqm) * 100)
            : 0;
        if (variance < -20) {
          anomalies.push({
            title: `Undervaluation Alert: Deed ${t.deedNumber}`,
            targetType: 'Transaction',
            identifier: t.deedNumber,
            city: t.city,
            anomalyType: 'Circle Rate Discrepancy',
            riskLevel: variance < -30 ? 'High' : 'Medium',
            description: `Transaction registered at ₹${(t.calculatedRatePerSqm || 0).toLocaleString()}/sqm — ${Math.abs(variance)}% below government circle rate of ₹${(t.circleRatePerSqm || 0).toLocaleString()}/sqm for ${t.locality}. Potential stamp duty undervaluation.`,
            evidence: { transactionRate: t.calculatedRatePerSqm, circleRate: t.circleRatePerSqm, variancePercentage: variance }
          });
        }
      });

      // Sort High risk first
      anomalies.sort((a, b) => {
        if (a.riskLevel === 'High' && b.riskLevel !== 'High') return -1;
        if (b.riskLevel === 'High' && a.riskLevel !== 'High') return 1;
        return 0;
      });

      return anomalies;
    });
  },

  // Admin Control
  getAdminHealth: async () => {
    return apiCall('/admin/health', {}, () => {
      return {
        database: {
          connected: false,
          databaseName: 'Client Offline Mode (Local Storage)',
          stats: {
            projects: mockData.reraProjects.length,
            builders: mockData.builders.length,
            transactions: mockData.propertyTransactions.length,
            landRecords: mockData.landRecords.length
          }
        },
        crawlers: mockData.governmentDatasets,
        logs: mockData.systemLogs,
        scheduler: {
          activeJobs: ['MahaRERA Sync Job', 'GujRERA Sync Job', 'IGR Maharashtra Transaction Parser'],
          intervalHours: 24,
          nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000)
        }
      };
    });
  },

  triggerCrawlerSync: async (crawlerName) => {
    return apiCall('/admin/sync', {
      method: 'POST',
      body: JSON.stringify({ crawlerName })
    }, () => {
      return {
        success: true,
        message: `Crawler '${crawlerName}' synchronization simulated client-side. Log entries pushed.`
      };
    });
  },

  // Watchlist simulation
  getWatchlist: async () => {
    // Return mock watchlist from client storage
    const wl = localStorage.getItem('re_watchlist');
    if (wl) return JSON.parse(wl);
    const defaultWl = {
      savedCities: ['Ahmedabad', 'Mumbai'],
      savedLocalities: [{ city: 'Ahmedabad', locality: 'Thaltej' }],
      savedBuilders: [],
      savedProjects: []
    };
    localStorage.setItem('re_watchlist', JSON.stringify(defaultWl));
    return defaultWl;
  },

  addToWatchlist: async (type, value) => {
    const wl = JSON.parse(localStorage.getItem('re_watchlist') || '{"savedCities":[],"savedLocalities":[],"savedBuilders":[],"savedProjects":[]}');
    if (type === 'city' && !wl.savedCities.includes(value)) {
      wl.savedCities.push(value);
    } else if (type === 'locality') {
      const exists = wl.savedLocalities.some(l => l.city === value.city && l.locality === value.locality);
      if (!exists) wl.savedLocalities.push(value);
    }
    localStorage.setItem('re_watchlist', JSON.stringify(wl));
    return { success: true, watchlist: wl };
  },

  removeFromWatchlist: async (type, value) => {
    const wl = JSON.parse(localStorage.getItem('re_watchlist') || '{"savedCities":[],"savedLocalities":[],"savedBuilders":[],"savedProjects":[]}');
    if (type === 'city') {
      wl.savedCities = wl.savedCities.filter(c => c !== value);
    } else if (type === 'locality') {
      wl.savedLocalities = wl.savedLocalities.filter(l => !(l.city === value.city && l.locality === value.locality));
    }
    localStorage.setItem('re_watchlist', JSON.stringify(wl));
    return { success: true, watchlist: wl };
  },

  // Auth Operations
  register: async (username, email, password, role = 'investor') => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role })
    }, () => {
      console.log(`[API Failover] Simulating register for ${email}. OTP code is '123456'`);
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const userExists = mockUsers.some(u => u.email === email);
      if (!userExists) {
        mockUsers.push({ username, email, password, role, isVerified: false });
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      return { message: 'Verification OTP sent to your email. [Offline Demo Mode: Use code 123456]', email, otp: '123456' };
    });
  },

  login: async (email, password) => {
    try {
      const res = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }, () => {
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
          throw new Error('Invalid credentials');
        }
        if (password !== user.password && password !== 'password123') {
          throw new Error('Invalid credentials');
        }
        if (!user.isVerified) {
          const customErr = new Error('Your email address is not verified. An OTP code has been dispatched.');
          customErr.unverified = true;
          customErr.email = email;
          throw customErr;
        }
        const mockToken = `mock_token_${Date.now()}`;
        localStorage.setItem('token', mockToken);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { token: mockToken, user };
      });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
      }
      return res;
    } catch (err) {
      throw err;
    }
  },

  verifyOtp: async (email, otp) => {
    const res = await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }, () => {
      if (otp !== '123456') {
        throw new Error('Invalid or expired OTP verification code.');
      }
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        user.isVerified = true;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      const mockToken = `mock_token_${Date.now()}`;
      localStorage.setItem('token', mockToken);
      const verifiedUser = user || { username: 'investor_guest', email, role: 'investor', isVerified: true };
      localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
      return { token: mockToken, user: verifiedUser };
    });
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
    }
    return res;
  },

  resendOtp: async (email) => {
    return apiCall('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    }, () => {
      console.log(`[API Failover] Resending OTP for ${email}. New code is '123456'`);
      return { success: true, message: 'A new verification OTP code has been sent. [Offline Demo Mode: Use code 123456]' };
    });
  },

  getMe: async () => {
    return apiCall('/auth/me', {}, () => {
      const cached = localStorage.getItem('currentUser');
      if (cached) return JSON.parse(cached);
      return {
        id: '60c72b2f9b1d8b2a3c8e4a99',
        role: 'admin',
        username: 'guest_analyst',
        email: 'guest@propertyintel.com',
        isVerified: true,
        createdAt: new Date().toISOString()
      };
    });
  },

  forgotPassword: async (email) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }, () => {
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = mockUsers.find(u => u.email === email);
      if (!user && email !== 'admin@propertyintel.com' && email !== 'investor@propertyintel.com') {
        throw new Error('No account found with this email address.');
      }
      return { success: true, message: 'Password reset code has been sent to your email.' };
    });
  },

  resetPassword: async (email, resetCode, newPassword) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetCode, newPassword })
    }, () => {
      if (!resetCode) {
        throw new Error('Please provide the reset code.');
      }
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        user.password = newPassword;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      return { success: true, message: 'Your password has been successfully reset. You can now log in.' };
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
};
