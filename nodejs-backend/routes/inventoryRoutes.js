// const express = require("express");
// const router = express.Router();
// const inventoryController = require("../controllers/inventoryController");
// const { protect } = require("../middlewares/authMiddleware");

// // Handle both token and cookie auth
// const authMiddleware = (req, res, next) => {
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     req.headers.cookie = `token=${req.headers.authorization.split(' ')[1]}`;
//   }
//   next();
// };

// // Get seller's inventory - Remove /api prefix since it's already mounted at /api/inventory
// router.get("/", authMiddleware, protect, inventoryController.getInventory);

// // Update stock - Remove /api prefix
// router.patch("/stock", authMiddleware, protect, inventoryController.updateStock);

// // Update reorder level - Remove /api prefix
// router.patch("/reorder-level", authMiddleware, protect, inventoryController.updateReorderLevel);

// module.exports = router;



const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect } = require("../middlewares/authMiddleware");

// Handle both token and cookie auth
const authMiddleware = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    req.headers.cookie = `token=${req.headers.authorization.split(' ')[1]}`;
  }
  next();
};

// Get seller's inventory
router.get("/", authMiddleware, protect, inventoryController.getInventory);

// Get inventory insights
router.get("/insights", authMiddleware, protect, inventoryController.getInsights);

// Update stock
router.patch("/stock", authMiddleware, protect, inventoryController.updateStock);

// Update reorder level
router.patch("/reorder-level", authMiddleware, protect, inventoryController.updateReorderLevel);

module.exports = router;