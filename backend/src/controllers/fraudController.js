const dataService = require('../config/dataService');

exports.getFraudReports = async (req, res) => {
  const { city, riskLevel } = req.query;
  try {
    // Strip undefined/empty params so MongoDB returns all if no filter
    const query = {};
    if (city) query.city = city;
    if (riskLevel) query.riskLevel = riskLevel;

    const reports = await dataService.fraudReports.find(query);
    res.json(reports.map(r => r._doc || r));
  } catch (err) {
    console.error('[Fraud Reports List Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve fraud reports list' });
  }
};

exports.scanForAnomalies = async (req, res) => {
  try {
    const builders = await dataService.builders.find({});
    const projects = await dataService.reraProjects.find({});
    const transactions = await dataService.propertyTransactions.find({});

    const anomalies = [];

    // 1. Builders with high delay ratios
    builders.forEach(raw => {
      const b = raw._doc || raw;
      const delayRatio = b.registrationCount > 0 ? (b.delayedProjects / b.registrationCount) : 0;
      if (delayRatio > 0.25 || b.averageDelayMonths > 12) {
        anomalies.push({
          title: `High Delay Risk: ${b.builderName}`,
          targetType: 'Builder',
          identifier: b.panNumber || 'PAN N/A',
          city: b.state === 'Maharashtra' ? 'Mumbai' : 'Ahmedabad',
          anomalyType: 'Repeated Delays',
          riskLevel: delayRatio > 0.4 ? 'High' : 'Medium',
          description: `${b.builderName} exhibits a project delay ratio of ${Math.round(delayRatio * 100)}% with an average delay of ${b.averageDelayMonths} months across their portfolio.`,
          evidence: { delayRatioPercent: Math.round(delayRatio * 100), averageDelayMonths: b.averageDelayMonths },
          flaggedDate: new Date()
        });
      }
    });

    // 2. Projects with extreme delays (>18 months)
    projects.forEach(raw => {
      const p = raw._doc || raw;
      if (p.completionStatus === 'Delayed' && p.delayedMonths > 18) {
        anomalies.push({
          title: `Regulatory Warning: ${p.projectName}`,
          targetType: 'Project',
          identifier: p.registrationNumber,
          city: p.city,
          anomalyType: 'Repeated Delays',
          riskLevel: 'High',
          description: `Project has exceeded declared RERA timeline by ${p.delayedMonths} months. Municipal approvals review is pending.`,
          evidence: { delayedMonths: p.delayedMonths, legalDisputeFlags: p.legalDisputeFlags },
          flaggedDate: p.createdAt || new Date()
        });
      }
      // Also flag projects with legal disputes
      if (p.legalDisputeFlags && p.completionStatus !== 'Completed') {
        anomalies.push({
          title: `Legal Dispute Flagged: ${p.projectName}`,
          targetType: 'Project',
          identifier: p.registrationNumber,
          city: p.city,
          anomalyType: 'Legal Dispute',
          riskLevel: 'High',
          description: `Active legal dispute or regulatory warning has been filed against this project. Investor caution advised.`,
          evidence: { disputeDetails: p.disputeDetails || 'Dispute details not disclosed', delayedMonths: p.delayedMonths },
          flaggedDate: new Date()
        });
      }
    });

    // 3. Transactions under circle rate (potential tax fraud)
    transactions.forEach(raw => {
      const t = raw._doc || raw;
      // Compute variancePercentage live if not stored
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
          evidence: { transactionRate: t.calculatedRatePerSqm, circleRate: t.circleRatePerSqm, variancePercentage: variance },
          flaggedDate: t.deedDate || new Date()
        });
      }
    });

    // Sort: High risk first, then Medium
    anomalies.sort((a, b) => {
      if (a.riskLevel === 'High' && b.riskLevel !== 'High') return -1;
      if (b.riskLevel === 'High' && a.riskLevel !== 'High') return 1;
      return 0;
    });

    res.json(anomalies);
  } catch (err) {
    console.error('[Scan Anomalies Error]:', err);
    res.status(500).json({ error: 'Anomaly scan failed' });
  }
};
