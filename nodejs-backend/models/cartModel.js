const { pool } = require("../config/db");

class Cart {
  // For logged-in users
  static async getUserCart(userId) {
    const [rows] = await pool.execute(
      `SELECT c.id, c.product_id, c.quantity, c.color, c.size, 
       p.name, p.price, p.discount, p.image, 
       (p.price * (1 - IFNULL(p.discount, 0)/100)) as discounted_price
       FROM Cart c
       JOIN Products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async addToUserCart(userId, productId, quantity, color, size) {
    const [result] = await pool.execute(
      `INSERT INTO Cart (user_id, product_id, quantity, color, size)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       quantity = quantity + VALUES(quantity),
       updated_at = CURRENT_TIMESTAMP`,
      [userId, productId, quantity, color, size]
    );
    return result;
  }

  static async updateCartItem(userId, cartItemId, quantity) {
    const [result] = await pool.execute(
      `UPDATE Cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [quantity, cartItemId, userId]
    );
    return result;
  }

  static async removeFromUserCart(userId, cartItemId) {
    const [result] = await pool.execute(
      "DELETE FROM Cart WHERE id = ? AND user_id = ?",
      [cartItemId, userId]
    );
    return result;
  }

  static async clearUserCart(userId) {
    const [result] = await pool.execute(
      "DELETE FROM Cart WHERE user_id = ?",
      [userId]
    );
    return result;
  }

  // For guest users
  static async getGuestCart(sessionId) {
    const [rows] = await pool.execute(
      `SELECT gc.id, gc.product_id, gc.quantity, gc.color, gc.size, 
       p.name, p.price, p.discount, p.image, 
       (p.price * (1 - IFNULL(p.discount, 0)/100)) as discounted_price
       FROM Guest_Cart gc
       JOIN Products p ON gc.product_id = p.id
       WHERE gc.session_id = ? AND gc.expires_at > NOW()`,
      [sessionId]
    );
    return rows;
  }

  static async addToGuestCart(sessionId, productId, quantity, color, size) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration
    
    const [result] = await pool.execute(
      `INSERT INTO Guest_Cart (session_id, product_id, quantity, color, size, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       quantity = quantity + VALUES(quantity),
       updated_at = CURRENT_TIMESTAMP`,
      [sessionId, productId, quantity, color, size, expiresAt]
    );
    return result;
  }

  static async updateGuestCartItem(sessionId, cartItemId, quantity) {
    const [result] = await pool.execute(
      `UPDATE Guest_Cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND session_id = ?`,
      [quantity, cartItemId, sessionId]
    );
    return result;
  }

  static async removeFromGuestCart(sessionId, cartItemId) {
    const [result] = await pool.execute(
      "DELETE FROM Guest_Cart WHERE id = ? AND session_id = ?",
      [cartItemId, sessionId]
    );
    return result;
  }

  static async clearGuestCart(sessionId) {
    const [result] = await pool.execute(
      "DELETE FROM Guest_Cart WHERE session_id = ?",
      [sessionId]
    );
    return result;
  }

  // Merge guest cart with user cart after login
  static async mergeCarts(userId, sessionId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get guest cart items
      const [guestItems] = await connection.execute(
        "SELECT product_id, quantity, color, size FROM Guest_Cart WHERE session_id = ?",
        [sessionId]
      );

      // Transfer each item to user cart
      for (const item of guestItems) {
        await connection.execute(
          `INSERT INTO Cart (user_id, product_id, quantity, color, size)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           quantity = quantity + VALUES(quantity),
           updated_at = CURRENT_TIMESTAMP`,
          [userId, item.product_id, item.quantity, item.color, item.size]
        );
      }

      // Clear guest cart
      await connection.execute(
        "DELETE FROM Guest_Cart WHERE session_id = ?",
        [sessionId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Cart;