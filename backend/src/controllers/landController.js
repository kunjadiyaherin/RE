const dataService = require('../config/dataService');

exports.lookupLand = async (req, res) => {
  const { state, district, taluka, village, surveyNumber } = req.query;
  try {
    if (!state || !district || !taluka || !village || !surveyNumber) {
      return res.status(400).json({ error: 'Please provide all survey parameters (state, district, taluka, village, surveyNumber)' });
    }

    const land = await dataService.landRecords.findOne({
      state,
      district,
      taluka,
      village,
      surveyNumber
    });

    if (!land) {
      return res.json({
        found: false,
        message: 'No official survey record matches the provided details in the state land records register.',
        record: null
      });
    }

    res.json({
      found: true,
      message: 'Land survey record successfully retrieved from state revenue archives.',
      record: land
    });
  } catch (err) {
    console.error('[Land Lookup Error]:', err);
    res.status(500).json({ error: 'Failed to look up land record' });
  }
};

exports.getLandById = async (req, res) => {
  try {
    const record = await dataService.landRecords.findOne({ _id: req.params.id });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch land record' });
  }
};
