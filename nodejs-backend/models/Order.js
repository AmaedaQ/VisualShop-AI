const mysql = require("mysql2/promise");
const { pool } = require("../config/db");

const findOrder = async (id) => {
  try {
    const [rows] = await pool.query(
      "SELECT o.*, u.email as user_email \
      FROM orders o \
      JOIN users u ON o.user_id = u.id \
      WHERE o.order_id = ?", // Changed to order_id
      [id]
    );
    return rows[0];
  } catch (error) {
    console.error('Error finding order:', error);
    throw error;
  }
};

const findOrdersBySeller = async (sellerId) => {
  try {
    // Validate sellerId
    if (!sellerId) {
      console.log('Invalid seller ID');
      return [];
    }

    // Get all products owned by this seller
    const [productRows] = await pool.query(
      "SELECT id FROM products WHERE seller_id = ?",
      [sellerId]
    );
    const productIds = productRows.map(row => row.id);

    if (productIds.length === 0) {
      console.log('No products found for seller:', sellerId);
      return [];
    }

    // Find order items with their order IDs
    const [orderItems] = await pool.query(
      `SELECT oi.order_id, oi.product_id, oi.name, oi.price, oi.image, oi.quantity, oi.subtotal, p.stock, p.category, p.rating \
      FROM order_items oi \
      JOIN products p ON oi.product_id = p.id \
      WHERE p.id IN (?)`,
      [productIds]
    );

    console.log('Found order items:', orderItems.length);
    if (orderItems.length > 0) {
      console.log('Sample order item:', orderItems[0]);
    }
    
    if (orderItems.length === 0) {
      console.log('No order items found for products:', productIds);
      return [];
    }

    // Get unique order IDs from order items
    const orderIds = [...new Set(orderItems.map(item => item.order_id))];
    console.log('Unique order IDs:', orderIds);

    // Get order details for these orders
    const [orders] = await pool.query(
      `SELECT DISTINCT o.*, u.email as user_email, 
        (SELECT COUNT(*) FROM order_items oi2 WHERE oi2.order_id = o.order_id) as items_count \
      FROM orders o \
      JOIN users u ON o.user_id = u.id \
      WHERE o.order_id IN (?) \
      ORDER BY o.created_at DESC`,
      [orderIds]
    );

    console.log('Found orders:', orders.length);
    if (orders.length > 0) {
      console.log('Sample order:', orders[0]);
    }

    // If no matching orders found, return empty array
    if (orders.length === 0) {
      console.log('No matching orders found in orders table');
      return [];
    }

    // Combine orders with their items
    const ordersWithDetails = orders.map(order => ({
      ...order,
      items: orderItems
        .filter(item => item.order_id === order.order_id)
        .map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          price: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal)
        }))
    }));
    
    return ordersWithDetails;
  } catch (error) {
    console.error('Error finding orders by seller:', error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const [result] = await pool.query(
      "UPDATE orders SET status = ? WHERE order_id = ?", // Changed to order_id
      [status, orderId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

const getOrderDetails = async (orderId) => {
  try {
    // Get order details
    const [orderResult] = await pool.query(
      "SELECT o.*, u.email as user_email \
      FROM orders o \
      JOIN users u ON o.user_id = u.id \
      WHERE o.order_id = ?", // Changed to order_id
      [orderId]
    );
    const order = orderResult[0];

    if (!order) {
      throw new Error('Order not found');
    }

    // Get order items
    const [itemsResult] = await pool.query(
      "SELECT oi.*, p.name as product_name, p.image as product_image, p.stock \
      FROM order_items oi \
      JOIN products p ON oi.product_id = p.id \
      WHERE oi.order_id = ?",
      [orderId]
    );

    return {
      order,
      items: itemsResult.map(item => ({
        ...item,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal)
      })),
      totals: {
        subtotal: parseFloat(order.total_amount), // Adjust if shipping/tax are separate
        shipping: 0, // Add if shipping cost is stored
        tax: 0, // Add if tax is stored
        grandTotal: parseFloat(order.total_amount)
      }
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

module.exports = {
  findOrder,
  findOrdersBySeller,
  updateOrderStatus,
  getOrderDetails
};