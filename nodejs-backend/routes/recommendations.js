const express = require('express');
const router = express.Router();
const { getRecommendationsForUser } = require('../utils/recommendation');

// Example middleware to get user id from auth and visitor id from header
function getUserAndVisitor(req, res, next) {
  req.userId = req.user?.id || null; // your auth middleware should set req.user if logged in
  req.visitorId = req.headers['x-visitor-id'] || null;
  next();
}

// GET endpoint for recommendations
router.get('/', getUserAndVisitor, async (req, res) => {
  try {
    const userId = req.userId;
    const visitorId = req.visitorId;
    const wishlistProductIds = req.query.wishlist ? req.query.wishlist.split(',').map(Number) : [];
    
    const recommendations = await getRecommendationsForUser(userId, visitorId, wishlistProductIds);
    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// POST endpoint for recommendations
router.post('/', getUserAndVisitor, async (req, res) => {
  try {
    const userId = req.userId;
    const visitorId = req.visitorId;
    const wishlistProductIds = req.body.wishlist || []; // expect array of product IDs from frontend

    // Call the main logic util
    const recommendations = await getRecommendationsForUser(userId, visitorId, wishlistProductIds);

    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;
