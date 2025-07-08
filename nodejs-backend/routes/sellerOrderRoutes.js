const express = require("express");
const router = express.Router();
const { getSellerOrders, getSellerOrderDetails, updateOrderStatus } = require("../controllers/sellerOrderController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Get all orders for seller's products
router.get("/", protect, authorize("seller"), getSellerOrders);

// Get detailed order information
router.get("/:orderId", protect, authorize("seller"), getSellerOrderDetails);

// Update order status
router.put("/:orderId/status", protect, authorize("seller"), updateOrderStatus);

module.exports = router;
