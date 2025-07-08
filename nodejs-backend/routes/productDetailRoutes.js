// const express = require("express");
// const router = express.Router();
// const productDetailController = require("../controllers/productDetailController");

// // Get all product details
// router.get("/", productDetailController.getAllProductDetails);

// // Get product detail by ID
// router.get("/:id", productDetailController.getProductDetailById);

// // Create a new product detail
// router.post("/", productDetailController.createProductDetail);

// // Update product detail
// router.put("/:id", productDetailController.updateProductDetail);

// // Delete product detail
// router.delete("/:id", productDetailController.deleteProductDetail);

// module.exports = router;


const express = require("express");
const router = express.Router();
const productDetailController = require("../controllers/productDetailController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Get all product details (public)
router.get("/", productDetailController.getAllProductDetails);

// Get product detail by ID (public)
router.get("/:id", productDetailController.getProductDetailById);

// Create a new product detail (seller only)
router.post("/", protect, authorize("seller"), productDetailController.createProductDetail);

// Update product detail (seller only)
router.put("/:id", protect, authorize("seller"), productDetailController.updateProductDetail);

// Delete product detail (seller only)
router.delete("/:id", protect, authorize("seller"), productDetailController.deleteProductDetail);

module.exports = router;