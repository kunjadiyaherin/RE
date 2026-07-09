const dataService = require('../config/dataService');

exports.verifyProject = async (req, res) => {
  const { regNumber } = req.query;
  try {
    if (!regNumber) {
      return res.status(400).json({ error: 'RERA Registration Number is required' });
    }

    const project = await dataService.reraProjects.findOne({
      registrationNumber: regNumber
    });

    if (!project) {
      return res.json({
        status: 'Unverified',
        message: 'No record found in Gujarat or Maharashtra RERA public index with this registration number.',
        details: null
      });
    }

    // Determine legitimacy label
    let status = 'Verified';
    let message = 'Project registration details are successfully verified with the official state regulatory database.';

    if (project.legalDisputeFlags) {
      status = 'Risky';
      message = 'Project verified, but active legal disputes or regulatory warnings have been flagged.';
    } else if (project.completionStatus === 'Delayed' || project.delayedMonths > 12) {
      status = 'Risky';
      message = 'Project verified, but construction timeline exhibits severe delays exceeding 12 months.';
    }

    res.json({
      status,
      message,
      details: project
    });
  } catch (err) {
    console.error('[RERA Verify Error]:', err);
    res.status(500).json({ error: 'Failed to verify project' });
  }
};

exports.getProjects = async (req, res) => {
  const { state, city, status, search } = req.query;
  try {
    // Build query only with non-empty filters
    const query = {};
    if (state) query.state = state;
    if (city) query.city = city;
    if (status) query.completionStatus = status;
    if (search) query.search = search;

    const projects = await dataService.reraProjects.find(query);
    res.json(projects.map(p => p._doc || p));
  } catch (err) {
    console.error('[RERA Get Projects Error]:', err);
    res.status(500).json({ error: 'Failed to fetch RERA projects' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await dataService.reraProjects.findOne({ _id: req.params.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
};
