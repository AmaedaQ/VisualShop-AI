const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");

// Handle both token and cookie auth
const authMiddleware = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    req.headers.cookie = `token=${req.headers.authorization.split(' ')[1]}`;
  }
  next();
};

// Get analytics overview
router.get("/overview", authMiddleware, protect, analyticsController.getAnalyticsOverview);

// Get detailed analytics
router.get("/detailed", authMiddleware, protect, analyticsController.getDetailedAnalytics);

module.exports = router;