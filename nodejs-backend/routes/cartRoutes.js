// routes/cartRoutes.js
const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");
const errorHandler = require("../middlewares/errorMiddleware");

const router = express.Router();

// Remove '/cart' prefix since it will be added in server.js
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove", protect, removeFromCart);
router.delete("/clear", protect, clearCart);
router.post("/sync", protect, syncCart);

router.use(errorHandler);

module.exports = router;