const Interaction = require('../models/interaction');

const logInteraction = async (req, res) => {
  try {
    const { item_id, event_type, metadata } = req.body;

    if (!item_id || !event_type) {
      return res.status(400).json({ message: 'item_id and event_type are required' });
    }

    const user_id = req.user?.id || null; // if logged in
    const visitor_id = req.visitor_id || null;

    if (!user_id && !visitor_id) {
      return res.status(400).json({ message: 'No user or visitor ID found' });
    }

    // Save to your own DB
    await Interaction.create({
      user_id,
      visitor_id,
      item_id,
      event_type,
      metadata: metadata ? JSON.stringify(metadata) : null
    });

    return res.status(201).json({ message: 'Interaction logged successfully' });
  } catch (error) {
    console.error('Interaction logging failed:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  logInteraction
};