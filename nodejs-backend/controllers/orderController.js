const { pool } = require("../config/db");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailSender"); // Import the email sender

// Generate unique order ID
const generateOrderId = () => {
  return `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// Generate order confirmation email HTML
const generateOrderConfirmationEmail = (order, shippingInfo, cartItems) => {
  const itemsHtml = cartItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        ${item.color ? `Color: ${item.color}` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${Number(item.price).toFixed(2)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        <strong>$${(Number(item.price) * item.quantity).toFixed(2)}</strong>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> ${order.order_id}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${order.status}</span></p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Shipping Information</h2>
          <p><strong>${shippingInfo.firstName} ${shippingInfo.lastName}</strong></p>
          <p>${shippingInfo.address}</p>
          <p>${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}</p>
          <p>${shippingInfo.country}</p>
          <p><strong>Phone:</strong> ${shippingInfo.phone}</p>
          <p><strong>Email:</strong> ${shippingInfo.email}</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Image</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea;">
            <p style="text-align: right; font-size: 18px; margin: 0;">
              <strong>Total Amount: $${order.totalAmount.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <p style="margin-bottom: 20px;">We'll send you shipping updates as your order progresses.</p>
          <p style="font-size: 14px; color: #666; margin: 0;">
            Questions about your order? Contact us at support@intellicart.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// @desc    Create new order
// @route   POST /api/orders/create
// @access  Private (can also work for guest users)
const createOrder = async (req, res) => {
  const {
    cartItems,
    shippingInfo,
    paymentMethod = 'cod',
    totalAmount
  } = req.body;

  // Validate required fields
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart items are required"
    });
  }

  if (!shippingInfo || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Shipping information and total amount are required"
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Generate unique order ID
    const orderId = generateOrderId();
    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : shippingInfo.email;

    // Create order
    await connection.execute(
      `INSERT INTO orders (
        order_id, user_id, user_email, total_amount,
        shipping_first_name, shipping_last_name, shipping_email, shipping_phone,
        shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country,
        payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        orderId, userId, userEmail, totalAmount,
        shippingInfo.firstName, shippingInfo.lastName, shippingInfo.email, shippingInfo.phone,
        shippingInfo.address, shippingInfo.city, shippingInfo.state, shippingInfo.zip, shippingInfo.country,
        paymentMethod
      ]
    );

    // Add order items
    for (const item of cartItems) {
      const subtotal = item.price * item.quantity;
      await connection.execute(
        `INSERT INTO order_items (
          order_id, product_id, name, price, image, color, quantity, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.id || item.product_id, item.name, item.price, item.image, item.color, item.quantity, subtotal]
      );
    }

    // Update product stock for each item
    for (const item of cartItems) {
      await connection.execute(
        `UPDATE products 
         SET stock = stock - ? 
         WHERE id = ?`,
        [item.quantity, item.id || item.product_id]
      );
    }

    // Clear user's cart if logged in
    if (userId) {
      await connection.execute(
        "DELETE FROM cart WHERE user_id = ?",
        [userId]
      );
    }

    await connection.commit();

    // Prepare order object for email
    const orderForEmail = {
      order_id: orderId,
      status: 'pending',
      totalAmount: totalAmount,
      paymentMethod: paymentMethod
    };

    // Send confirmation email
    try {
      const emailHtml = generateOrderConfirmationEmail(orderForEmail, shippingInfo, cartItems);
      
      await sendEmail({
        email: shippingInfo.email,
        subject: `Order Confirmation - ${orderId}`,
        html: emailHtml,
        message: `Thank you for your order! Your order ID is ${orderId}. We'll send you updates as your order progresses.`
      });

      console.log(`Order confirmation email sent to ${shippingInfo.email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
      // You might want to log this for retry later
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: orderId,
      order: {
        order_id: orderId, // Match frontend expectation
        status: 'pending',
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        cartItems: cartItems // Include cartItems to match frontend
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  } finally {
    connection.release();
  }
};

// @desc    Get all orders for a user
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.order_id, o.user_id, o.user_email, o.total_amount AS totalAmount, 
       o.shipping_first_name, o.shipping_last_name, o.shipping_email, o.shipping_phone,
       o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zip, o.shipping_country,
       o.payment_method, o.status, o.created_at, o.updated_at,
       GROUP_CONCAT(CONCAT(
         '{"id":"', oi.id, '",',
         '"product_id":"', oi.product_id, '",',
         '"name":"', oi.name, '",',
         '"price":"', oi.price, '",',
         '"image":"', oi.image, '",',
         '"color":"', oi.color, '",',
         '"quantity":"', oi.quantity, '",',
         '"subtotal":"', oi.subtotal, '"}'
       ) SEPARATOR ',') as cartItems
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.order_id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Process orders to ensure cartItems is always an array
    const processedOrders = orders.map(order => ({
      ...order,
      cartItems: order.cartItems && order.cartItems !== 'null' ? JSON.parse(`[${order.cartItems}]`) : [],
      totalAmount: parseFloat(order.totalAmount) // Ensure totalAmount is a number
    }));

    res.status(200).json({
      success: true,
      orders: processedOrders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders"
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:orderId
// @access  Private (or public with order ID and email)
const getOrder = async (req, res) => {
  const { orderId } = req.params;
  const { email } = req.query; // For guest orders

  try {
    let query = `
      SELECT o.*, o.total_amount AS totalAmount, 
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', oi.id,
          'product_id', oi.product_id,
          'name', oi.name,
          'price', oi.price,
          'image', oi.image,
          'color', oi.color,
          'quantity', oi.quantity,
          'subtotal', oi.subtotal
        )
      ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.order_id = ?
    `;
    
    let params = [orderId];
    
    // If user is logged in, filter by user_id
    if (req.user) {
      query += " AND o.user_id = ?";
      params.push(req.user.id);
    } 
    // If email provided (for guest orders), filter by email
    else if (email) {
      query += " AND o.user_email = ?";
      params.push(email);
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    query += " GROUP BY o.order_id";

    const [orders] = await pool.execute(query, params);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orders[0];
    order.cartItems = JSON.parse(order.items); // Rename to cartItems
    delete order.items; // Clean up
    order.totalAmount = parseFloat(order.totalAmount); // Ensure totalAmount is a number

    res.status(200).json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
};

// @desc    Get basic order info by order ID (public endpoint for chatbot)
// @route   GET /api/orders/public/:orderId
// @access  Public
const getOrderBasicInfo = async (req, res) => {
  const { orderId } = req.params;

  try {
    const [orders] = await pool.execute(
      `SELECT 
        order_id,
        shipping_first_name,
        shipping_last_name,
        shipping_address,
        payment_method,
        total_amount,
        status,
        created_at,
        updated_at
      FROM orders 
      WHERE order_id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orders[0];
    
    // Format dates
    order.created_at = new Date(order.created_at).toISOString();
    order.updated_at = new Date(order.updated_at).toISOString();
    
    // Format total amount
    order.total_amount = parseFloat(order.total_amount).toFixed(2);

    res.status(200).json({
      success: true,
      order: {
        orderId: order.order_id,
        shippingFirstName: order.shipping_first_name,
        shippingLastName: order.shipping_last_name,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }
    });
  } catch (error) {
    console.error("Get basic order info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order information"
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:orderId/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?",
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully"
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Check if order exists and belongs to user
    const [orders] = await pool.execute(
      "SELECT * FROM orders WHERE order_id = ? AND user_id = ? AND status IN ('pending', 'processing')",
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found or cannot be cancelled"
      });
    }

    // Update order status to cancelled
    await pool.execute(
      "UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?",
      [orderId]
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order"
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderBasicInfo
};