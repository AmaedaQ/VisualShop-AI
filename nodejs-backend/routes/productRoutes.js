// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const { getProducts, getSellerProducts, addProduct, updateProduct, deleteProduct, getProductsByName } = require("../controllers/productController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Route: GET /api/products/search (search products by name)
router.get("/search", getProductsByName);

// Route: GET /api/products (all products)
router.get("/", getProducts);

// Route: GET /api/products/seller (seller's products)
router.get("/seller", protect, authorize("seller"), getSellerProducts);

// Route: POST /api/products (add product with image)
router.post("/", protect, authorize("seller"), addProduct);

// Route: PUT /api/products/:id (update product)
router.put("/:id", protect, authorize("seller"), updateProduct);

// Route: DELETE /api/products/:id (delete product)
router.delete("/:id", protect, authorize("seller"), deleteProduct);

module.exports = router;