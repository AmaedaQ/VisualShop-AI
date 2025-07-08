// controllers/cartController.js
const { pool } = require("../config/db");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const [cartItems] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      cart: cartItems
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  const { product_id, name, price, image, color, quantity = 1 } = req.body;

  try {
    // Convert product_id to string to ensure consistency
    const productIdStr = String(product_id);
    const colorStr = String(color || '');
    
    console.log("Add to cart request:", { user_id: req.user.id, product_id: productIdStr, color: colorStr, quantity });

    // Check if item already exists in cart
    const [existingItem] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND color = ?",
      [req.user.id, productIdStr, colorStr]
    );

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const newQuantity = existingItem[0].quantity + quantity;
      await pool.execute(
        "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [newQuantity, existingItem[0].id]
      );
      console.log("Updated existing item quantity to:", newQuantity);
    } else {
      // Add new item to cart
      await pool.execute(
        "INSERT INTO cart (user_id, product_id, name, price, image, color, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [req.user.id, productIdStr, name, price, image, colorStr, quantity]
      );
      console.log("Added new item to cart");
    }

    // Fetch updated cart
    const [cartItems] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    console.log("Cart after add:", cartItems);

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: cartItems
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart"
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
  const { product_id, color, quantity } = req.body;

  try {
    // Convert to string for consistency
    const productIdStr = String(product_id);
    const colorStr = String(color || '');
    
    console.log("Update cart request:", { user_id: req.user.id, product_id: productIdStr, color: colorStr, quantity });

    // First check if the item exists
    const [existingItem] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND color = ?",
      [req.user.id, productIdStr, colorStr]
    );

    console.log("Existing item found:", existingItem);

    if (existingItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
        debug: {
          searching_for: { user_id: req.user.id, product_id: productIdStr, color: colorStr },
          available_items: await pool.execute("SELECT id, user_id, product_id, color FROM cart WHERE user_id = ?", [req.user.id])
        }
      });
    }

    // Update the quantity
    const [result] = await pool.execute(
      "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ? AND color = ?",
      [quantity, req.user.id, productIdStr, colorStr]
    );

    console.log("Update result:", result);
    console.log("Rows affected:", result.affectedRows);

    // Fetch updated cart
    const [cartItems] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    console.log("Cart after update:", cartItems);

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: cartItems
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart"
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
const removeFromCart = async (req, res) => {
  const { product_id, color } = req.body;

  try {
    // Convert to string for consistency
    const productIdStr = String(product_id);
    const colorStr = String(color || '');
    
    console.log("Remove from cart request:", { user_id: req.user.id, product_id: productIdStr, color: colorStr });

    // Debug: Show what we're looking for vs what exists
    const [allItems] = await pool.execute(
      "SELECT id, product_id, color FROM cart WHERE user_id = ?",
      [req.user.id]
    );
    console.log("Available cart items:", allItems);
    console.log("Looking for:", { product_id: productIdStr, color: colorStr });

    const [result] = await pool.execute(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ? AND color = ?",
      [req.user.id, productIdStr, colorStr]
    );

    console.log("Delete result:", result);
    console.log("Rows affected:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found for removal",
        debug: {
          searching_for: { user_id: req.user.id, product_id: productIdStr, color: colorStr },
          available_items: allItems
        }
      });
    }

    // Fetch updated cart
    const [cartItems] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: cartItems
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart"
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    console.log("Clear cart request for user:", req.user.id);

    await pool.execute(
      "DELETE FROM cart WHERE user_id = ?",
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: []
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart"
    });
  }
};

// @desc    Sync local storage cart to database when user logs in
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || !Array.isArray(cartItems)) {
    return res.status(400).json({
      success: false,
      message: "Invalid cart data"
    });
  }

  const connection = await pool.getConnection();
  
  try {
    console.log("Syncing cart for user:", req.user.id);
    console.log("Cart items to sync:", cartItems);

    await connection.beginTransaction();

    // Clear existing cart
    await connection.execute(
      "DELETE FROM cart WHERE user_id = ?",
      [req.user.id]
    );

    // Add all items from local storage
    for (const item of cartItems) {
      const productId = String(item.id || item.product_id);
      const color = String(item.color || '');
      
      await connection.execute(
        "INSERT INTO cart (user_id, product_id, name, price, image, color, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [req.user.id, productId, item.name, item.price, item.image, color, item.quantity]
      );
    }

    await connection.commit();

    // Fetch synced cart
    const [syncedCart] = await connection.execute(
      "SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    console.log("Synced cart:", syncedCart);

    res.status(200).json({
      success: true,
      message: "Cart synced successfully",
      cart: syncedCart
    });
  } catch (error) {
    await connection.rollback();
    console.error("Sync cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync cart"
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};