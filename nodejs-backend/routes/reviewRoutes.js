const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Get reviews for a product
router.get("/products/:productId/reviews", reviewController.getProductReviews);

// Add a new review
router.post("/products/:productId/reviews", reviewController.addReview);

// Delete a review (admin only)
router.delete("/reviews/:reviewId", reviewController.deleteReview);

module.exports = router;