const Review = require("../models/reviewModel");

const reviewController = {
  // Get reviews for a product
  getProductReviews: async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid product ID" 
        });
      }

      const reviews = await Review.getByProductId(productId);
      res.status(200).json({ 
        success: true,
        data: reviews 
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching reviews",
        error: error.message,
      });
    }
  },

  // Add a new review
  addReview: async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid product ID" 
        });
      }

      const { user_id, user_name, rating, comment } = req.body;

      // Validation
      if (!user_id || !user_name || !rating) {
        return res.status(400).json({ 
          success: false,
          message: "user_id, user_name, and rating are required fields" 
        });
      }

      if (isNaN(rating)) {
        return res.status(400).json({ 
          success: false,
          message: "Rating must be a number" 
        });
      }

      const numericRating = parseFloat(rating);
      if (numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ 
          success: false,
          message: "Rating must be between 1 and 5" 
        });
      }

      const review = {
        product_id: productId,
        user_id,
        user_name,
        rating: numericRating,
        comment: comment || null
      };

      const newReview = await Review.create(review);
      
      // Update product's average rating
      const averageRating = await Review.getAverageRating(productId);
      const reviewCount = await Review.getReviewCount(productId);

      res.status(201).json({ 
        success: true,
        data: newReview,
        averageRating,
        reviewCount
      });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({
        success: false,
        message: "Error adding review",
        error: error.message,
      });
    }
  },

  // Delete a review
  deleteReview: async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      if (isNaN(reviewId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid review ID" 
        });
      }

      const deleted = await Review.delete(reviewId);
      if (deleted) {
        res.status(200).json({ 
          success: true,
          message: "Review deleted successfully" 
        });
      } else {
        res.status(404).json({ 
          success: false,
          message: "Review not found" 
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting review",
        error: error.message,
      });
    }
  }
};

module.exports = reviewController;