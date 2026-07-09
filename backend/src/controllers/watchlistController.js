const dataService = require('../config/dataService');

exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlist = await dataService.watchlists.findOne({ userId });
    res.json(watchlist);
  } catch (err) {
    console.error('[Watchlist Get Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve watchlist' });
  }
};

exports.addToWatchlist = async (req, res) => {
  const userId = req.user.id;
  const { type, value } = req.body; // type: 'city', 'locality' (obj: {city, locality}), 'builder' (id), 'project' (id)
  
  try {
    let update = {};
    if (type === 'city') {
      update = { $addToSet: { savedCities: value } };
    } else if (type === 'locality') {
      update = { $addToSet: { savedLocalities: value } };
    } else if (type === 'builder') {
      update = { $addToSet: { savedBuilders: value } };
    } else if (type === 'project') {
      update = { $addToSet: { savedProjects: value } };
    } else {
      return res.status(400).json({ error: 'Invalid watchlist element type' });
    }

    const wl = await dataService.watchlists.findOneAndUpdate({ userId }, update, { new: true });
    res.json({ success: true, watchlist: wl });
  } catch (err) {
    console.error('[Watchlist Add Error]:', err);
    res.status(500).json({ error: 'Failed to add item to watchlist' });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  const userId = req.user.id;
  const { type, value } = req.body;
  
  try {
    let update = {};
    if (type === 'city') {
      update = { $pull: { savedCities: value } };
    } else if (type === 'locality') {
      update = { $pull: { savedLocalities: value } };
    } else if (type === 'builder') {
      update = { $pull: { savedBuilders: value } };
    } else if (type === 'project') {
      update = { $pull: { savedProjects: value } };
    } else {
      return res.status(400).json({ error: 'Invalid watchlist element type' });
    }

    const wl = await dataService.watchlists.findOneAndUpdate({ userId }, update, { new: true });
    res.json({ success: true, watchlist: wl });
  } catch (err) {
    console.error('[Watchlist Remove Error]:', err);
    res.status(500).json({ error: 'Failed to remove item from watchlist' });
  }
};
