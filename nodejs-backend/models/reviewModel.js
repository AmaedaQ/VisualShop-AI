const { pool } = require("../config/db");

const Review = {
  // Get reviews by product ID
  getByProductId: async (productId) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, product_id, user_id, user_name, rating, comment, 
         DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
         FROM reviews 
         WHERE product_id = ? 
         ORDER BY created_at DESC`,
        [productId]
      );
      return rows;
    } catch (error) {
      console.error("Error in getByProductId:", error);
      throw error;
    }
  },

  // Create a new review
  create: async (review) => {
    try {
      const { product_id, user_id, user_name, rating, comment } = review;
      const [result] = await pool.query(
        `INSERT INTO reviews (product_id, user_id, user_name, rating, comment) 
         VALUES (?, ?, ?, ?, ?)`,
        [product_id, user_id, user_name, rating, comment]
      );
      
      // Get the newly created review with formatted date
      const [newReview] = await pool.query(
        `SELECT id, product_id, user_id, user_name, rating, comment, 
         DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
         FROM reviews 
         WHERE id = ?`,
        [result.insertId]
      );
      
      return newReview[0];
    } catch (error) {
      console.error("Error in create review:", error);
      throw error;
    }
  },

  // Delete a review
  delete: async (id) => {
    try {
      const [result] = await pool.query("DELETE FROM reviews WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in delete review:", error);
      throw error;
    }
  },

  // Get average rating for a product
  getAverageRating: async (productId) => {
    try {
      const [rows] = await pool.query(
        `SELECT ROUND(AVG(rating), 1) as averageRating 
         FROM reviews 
         WHERE product_id = ?`,
        [productId]
      );
      return rows[0].averageRating || 0;
    } catch (error) {
      console.error("Error in getAverageRating:", error);
      throw error;
    }
  },

  // Get review count for a product
  getReviewCount: async (productId) => {
    try {
      const [rows] = await pool.query(
        "SELECT COUNT(*) as count FROM reviews WHERE product_id = ?",
        [productId]
      );
      return rows[0].count;
    } catch (error) {
      console.error("Error in getReviewCount:", error);
      throw error;
    }
  }
};

module.exports = Review;