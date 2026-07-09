const dataService = require('../config/dataService');

exports.getTransactions = async (req, res) => {
  const { city, locality, propertyType } = req.query;
  try {
    // Build query dynamically — skip empty params
    const query = {};
    if (city) query.city = city;
    if (locality) query.locality = locality;
    if (propertyType) query.propertyType = propertyType;

    const txs = await dataService.propertyTransactions.find(query);
    res.json(txs.map(t => t._doc || t));
  } catch (err) {
    console.error('[Transaction Get List Error]:', err);
    res.status(500).json({ error: 'Failed to fetch stamp duty transactions' });
  }
};

exports.getCircleRates = async (req, res) => {
  const { city } = req.query;
  try {
    const query = city ? { city } : {};
    const analytics = await dataService.areaAnalytics.find(query);

    const circleRates = analytics.map(raw => {
      const a = raw._doc || raw;
      return {
        locality: a.locality,
        city: a.city,
        state: a.state,
        circleRatePerSqm: a.averageCircleRatePerSqm,
        marketRatePerSqm: a.averageMarketRatePerSqm,
        variancePercent: Math.round(((a.averageMarketRatePerSqm - a.averageCircleRatePerSqm) / a.averageCircleRatePerSqm) * 100),
        classification: a.averageMarketRatePerSqm > a.averageCircleRatePerSqm * 1.25 ? 'Premium Gap' : 'Aligned'
      };
    });

    res.json(circleRates);
  } catch (err) {
    console.error('[Circle Rate List Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve circle rate data' });
  }
};
