const dataService = require('../config/dataService');

exports.getBuilders = async (req, res) => {
  const { state } = req.query;
  try {
    // Only pass state to the query if it is a non-empty string
    const query = state ? { state } : {};
    const builders = await dataService.builders.find(query);

    const detailedBuilders = builders.map(b => {
      const delayRatio = b.registrationCount > 0 ? (b.delayedProjects / b.registrationCount) : 0;
      let score = 100 - Math.round((delayRatio * 45) + (b.averageDelayMonths * 2.5));
      score = Math.max(1, Math.min(100, score));
      return {
        ...b._doc || b,
        calculatedTrustScore: score,
        ratingTier: score >= 90 ? 'Institutional Grade (A)' : score >= 80 ? 'Investment Grade (B)' : score >= 70 ? 'Speculative (C)' : 'High Risk (D)'
      };
    });

    res.json(detailedBuilders);
  } catch (err) {
    console.error('[Builder Get List Error]:', err);
    res.status(500).json({ error: 'Failed to fetch builder reputation metrics' });
  }
};

exports.getBuilderProfile = async (req, res) => {
  try {
    const builder = await dataService.builders.findOne({ _id: req.params.id });
    if (!builder) return res.status(404).json({ error: 'Builder profile not found' });

    // Find projects under this builder
    const projects = await dataService.reraProjects.find({});
    const builderName = (builder._doc || builder).builderName;
    const builderProjects = projects.filter(p => (p._doc || p).builderName === builderName);

    const b = builder._doc || builder;
    const delayRatio = b.registrationCount > 0 ? (b.delayedProjects / b.registrationCount) : 0;
    let score = 100 - Math.round((delayRatio * 45) + (b.averageDelayMonths * 2.5));
    score = Math.max(1, Math.min(100, score));

    res.json({
      builderDetails: {
        ...b,
        trustScore: score,
        ratingTier: score >= 90 ? 'Institutional Grade (A)' : score >= 80 ? 'Investment Grade (B)' : score >= 70 ? 'Speculative (C)' : 'High Risk (D)'
      },
      projects: builderProjects.map(p => p._doc || p)
    });
  } catch (err) {
    console.error('[Builder Profile Error]:', err);
    res.status(500).json({ error: 'Failed to fetch builder portfolio profile' });
  }
};
