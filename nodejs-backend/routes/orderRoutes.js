const express = require("express");
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderBasicInfo
} = require("../controllers/orderController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public/Protected routes
router.post("/create", protect, createOrder); // Can be made semi-public for guest checkout
router.get("/", protect, getUserOrders);
router.get("/:orderId", getOrder); // Supports both authenticated and guest access
router.get("/public/:orderId", getOrderBasicInfo); // Public route for basic order info
router.put("/:orderId/cancel", protect, cancelOrder);

// Admin only routes
router.put("/:orderId/status", protect, authorize("admin"), updateOrderStatus);

module.exports = router;
