const dataService = require('../config/dataService');
const http = require('http');

// Helper to check FastAPI AI service
const fetchAIForecastFromPython = (city, locality) => {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:8000/api/forecast?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error('FastAPI response error'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

exports.getCityComparison = (req, res) => {
  // Institutional analytics data comparing core cities
  const comparisons = [
    {
      city: "Ahmedabad",
      infrastructureGrowth: 88,
      realEstateDemand: 85,
      averageTransactionValueINR: 8500000,
      populationGrowth: 2.4,
      urbanExpansionRate: 4.1,
      investmentScore: 90,
      keyDrivers: "GIFT City expansion, Ahmedabad-Dholera Expressway, Metro Phase 2"
    },
    {
      city: "Mumbai",
      infrastructureGrowth: 92,
      realEstateDemand: 95,
      averageTransactionValueINR: 32000000,
      populationGrowth: 1.1,
      urbanExpansionRate: 2.2,
      investmentScore: 88,
      keyDrivers: "Coastal Road project, Navi Mumbai Airport, Trans Harbour Link"
    },
    {
      city: "Pune",
      infrastructureGrowth: 82,
      realEstateDemand: 80,
      averageTransactionValueINR: 9200000,
      populationGrowth: 1.9,
      urbanExpansionRate: 3.2,
      investmentScore: 82,
      keyDrivers: "Pune Metro expansion, Hinjewadi IT Park extension, Ring Road plans"
    },
    {
      city: "Surat",
      infrastructureGrowth: 78,
      realEstateDemand: 74,
      averageTransactionValueINR: 6500000,
      populationGrowth: 2.9,
      urbanExpansionRate: 3.8,
      investmentScore: 78,
      keyDrivers: "Surat Metro Rail, Dream City (Diamond Bourse) zoning, SMC Smart City"
    },
    {
      city: "Bangalore",
      infrastructureGrowth: 86,
      realEstateDemand: 90,
      averageTransactionValueINR: 14500000,
      populationGrowth: 3.2,
      urbanExpansionRate: 4.5,
      investmentScore: 89,
      keyDrivers: "Outer Ring Road Metro, Peripheral Ring Road, Kempegowda Airport Phase 2"
    },
    {
      city: "Hyderabad",
      infrastructureGrowth: 89,
      realEstateDemand: 88,
      averageTransactionValueINR: 12800000,
      populationGrowth: 2.8,
      urbanExpansionRate: 4.0,
      investmentScore: 92,
      keyDrivers: "Regional Ring Road (RRR), IT Corridor extensions, Aerospace Parks"
    }
  ];

  res.json(comparisons);
};

exports.getAreaGrowth = async (req, res) => {
  const { city } = req.query;
  try {
    // Strip empty params so MongoDB returns all if no filter
    const areaQuery = city ? { city } : {};
    const areas = await dataService.areaAnalytics.find(areaQuery);
    const infraProjects = await dataService.infrastructureProjects.find(city ? { city } : {});

    const calculatedAreas = areas.map(a => {
      // Find infrastructure projects affecting this locality
      const impactingProjects = infraProjects.filter(p => 
        p.affectedLocalities.some(l => l.toLowerCase() === a.locality.toLowerCase()) ||
        a.metroProximityKm <= p.impactRadiusKm && p.projectType === 'Metro Line'
      );

      // Dynamically calculate a Future Growth Score
      // Base growth score from database, boosted by infra project density
      let infraBoost = impactingProjects.length * 5;
      if (a.metroProximityKm < 1.0) infraBoost += 8;
      if (a.highwayProximityKm < 1.0) infraBoost += 5;

      const finalGrowthScore = Math.min(100, a.growthScore + infraBoost);

      return {
        locality: a.locality,
        city: a.city,
        state: a.state,
        baseGrowthScore: a.growthScore,
        finalGrowthScore,
        infrastructureImpactScore: a.infrastructureImpactScore,
        impactingProjects: impactingProjects.map(p => p.projectName),
        metroProximityKm: a.metroProximityKm,
        highwayProximityKm: a.highwayProximityKm,
        commercialDensityScore: a.commercialDensityScore
      };
    });

    res.json(calculatedAreas);
  } catch (err) {
    console.error('[Area Growth Error]:', err);
    res.status(500).json({ error: 'Failed to compute area growth intelligence' });
  }
};

exports.getForecast = async (req, res) => {
  const { city, locality } = req.query;
  try {
    if (!city || !locality) {
      return res.status(400).json({ error: 'City and locality parameters are required' });
    }

    // Try calling Python AI service
    try {
      console.log(`[AI Proxy] Requesting ML forecast from Python FastAPI for ${city}/${locality}`);
      const mlForecast = await fetchAIForecastFromPython(city, locality);
      return res.json({
        source: 'Python FastAPI (Scikit-Learn ML)',
        ...mlForecast
      });
    } catch (apiErr) {
      console.log('[AI Proxy] Python AI service unavailable. Running Node fallback regression calculations.');
      
      // Fallback: Fetch price forecast record or compute regression on historical transaction values
      const forecastRecord = await dataService.priceForecasts.findOne({ city, locality });
      const historicalRaw = await dataService.historicalMarketData.find({ city, locality });
      // Sort historical data by year+quarter ascending
      const historicalData = historicalRaw
        .map(h => h._doc || h)
        .sort((a, b) => a.year !== b.year ? a.year - b.year : a.quarter.localeCompare(b.quarter));

      if (forecastRecord) {
        const fr = forecastRecord._doc || forecastRecord;
        return res.json({
          source: 'Node Engine (Historical Regression)',
          city: fr.city,
          locality: fr.locality,
          modelName: 'Node Linear Regression Fallback',
          currentPricePerSqm: fr.currentPricePerSqm,
          forecast_6m: fr.forecast_6m,
          forecast_1y: fr.forecast_1y,
          forecast_5y: fr.forecast_5y,
          growthProbability: fr.growthProbability,
          rentalYieldPercent: fr.rentalYieldPercent,
          historicalPoints: historicalData.map(h => ({
            period: `${h.year} ${h.quarter}`,
            price: h.averagePricePerSqm,
            volume: h.transactionVolume
          }))
        });
      }

      // If no precalculated record exists, construct a simple prediction
      const baseRate = city.toLowerCase() === 'mumbai' ? 180000 : 75000;
      res.json({
        source: 'Node Engine (Static Simulation)',
        city,
        locality,
        modelName: 'Simulation Base Rate Estimator',
        currentPricePerSqm: baseRate,
        forecast_6m: Math.round(baseRate * 1.04),
        forecast_1y: Math.round(baseRate * 1.09),
        forecast_5y: Math.round(baseRate * 1.45),
        growthProbability: 0.82,
        rentalYieldPercent: 3.1,
        historicalPoints: []
      });
    }
  } catch (err) {
    console.error('[Forecast API Error]:', err);
    res.status(500).json({ error: 'Valuation forecasting engine exception' });
  }
};

exports.getInvestmentOpportunities = async (req, res) => {
  try {
    const areas = await dataService.areaAnalytics.find({});

    // Opportunities: Areas where Circle Rate is low relative to Future Growth & Infrastructure impact
    const opportunities = areas.map(raw => {
      const a = raw._doc || raw;
      const circleToMarketRatio = a.averageCircleRatePerSqm / a.averageMarketRatePerSqm;
      const undervaluationScore = Math.round((1 - circleToMarketRatio) * 100);
      
      // AI Opportunity score combining Growth score and Undervaluation gap
      const opportunityScore = Math.min(100, Math.round((a.growthScore * 0.6) + (undervaluationScore * 0.4)));

      return {
        city: a.city,
        locality: a.locality,
        state: a.state,
        marketPrice: a.averageMarketRatePerSqm,
        circleRate: a.averageCircleRatePerSqm,
        growthScore: a.growthScore,
        undervaluationGapPercent: Math.round((1 - circleToMarketRatio) * 100),
        opportunityScore,
        recommendationTier: opportunityScore >= 85 ? 'Strong Buy' : opportunityScore >= 70 ? 'Accumulate' : 'Neutral'
      };
    }).sort((a, b) => b.opportunityScore - a.opportunityScore);

    res.json(opportunities);
  } catch (err) {
    console.error('[Investment Scan Error]:', err);
    res.status(500).json({ error: 'Opportunity scanning failed' });
  }
};
