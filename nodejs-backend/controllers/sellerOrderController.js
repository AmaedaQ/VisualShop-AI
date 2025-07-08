// const { pool } = require("../config/db");
// const crypto = require("crypto");
// const { sendEmail } = require("../utils/emailSender");
// const Order = require('../models/Order');
// const Product = require('../models/productModel');

// // Helper function to get seller's products
// const getSellerProducts = async (sellerId) => {
//   try {
//     const query = `SELECT id FROM products WHERE seller_id = ?`;
//     const [rows] = await pool.query(query, [sellerId]);
//     return rows.map(row => row.id);
//   } catch (error) {
//     console.error('Error fetching seller products:', error);
//     throw error;
//   }
// };

// // Get all orders for seller's products
// const getSellerOrders = async (req, res) => {
//   try {
//     // Get seller ID from auth middleware
//     const sellerId = req.user?.id;
//     if (!sellerId) {
//       return res.status(401).json({ error: 'Not authorized' });
//     }

//     console.log('Fetching orders for seller:', sellerId);
    
//     const orders = await Order.findOrdersBySeller(sellerId);
//     console.log('Found orders:', orders.length);
    
//     // Format orders to match frontend expectations
//     const formattedOrders = orders.map(order => ({
//       id: order.order_id || '',
//       customer_email: order.user_email || '',
//       created_at: order.created_at?.toISOString() || '',
//       items_count: order.items_count || 0,
//       total_amount: parseFloat(order.total_amount) || 0,
//       status: order.status || 'Pending',
//       items: order.items || []
//     }));
    
//     res.json(formattedOrders);
//   } catch (error) {
//     console.error('Error in getSellerOrders:', error);
//     res.status(500).json({ error: 'Failed to fetch seller orders', details: error.message });
//   }
// };

// // Get detailed order information for seller
// const getSellerOrderDetails = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     if (!orderId) {
//       return res.status(400).json({ error: 'Order ID is required' });
//     }

//     // Get seller ID from auth middleware
//     const sellerId = req.user?.id;
//     if (!sellerId) {
//       return res.status(401).json({ error: 'Not authorized' });
//     }

//     // Verify if order contains seller's product
//     const productQuery = `
//       SELECT oi.product_id 
//       FROM order_items oi
//       JOIN products p ON oi.product_id = p.id
//       WHERE oi.order_id = ? AND p.seller_id = ?
//     `;
//     const [productResult] = await pool.query(productQuery, [orderId, sellerId]);

//     if (productResult.length === 0) {
//       return res.status(403).json({ error: 'Unauthorized access to order' });
//     }

//     const orderDetails = await Order.getOrderDetails(orderId);
//     res.json({
//       ...orderDetails,
//       order: {
//         ...orderDetails.order,
//         id: orderDetails.order.order_id // Map order_id to id
//       }
//     });
//   } catch (error) {
//     console.error('Error in getSellerOrderDetails:', error);
//     res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
//   }
// };

// // Update order status
// const updateOrderStatus = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const { status } = req.body;
//     const sellerId = req.user?.id;

//     if (!orderId || !status || !sellerId) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     console.log('Updating order status for order:', orderId, 'to status:', status);

//     // Verify if order contains seller's product
//     const productQuery = `
//       SELECT oi.product_id 
//       FROM order_items oi
//       JOIN products p ON oi.product_id = p.id
//       WHERE oi.order_id = ? AND p.seller_id = ?
//     `;
//     const [productResult] = await pool.query(productQuery, [orderId, sellerId]);

//     if (productResult.length === 0) {
//       return res.status(403).json({ error: 'Unauthorized access to order' });
//     }

//     const updated = await Order.updateOrderStatus(orderId, status);

//     if (!updated) {
//       return res.status(404).json({ error: 'Order not found or status not updated' });
//     }

//     // Send email notification to customer
//     const emailQuery = `
//       SELECT o.shipping_email, o.shipping_first_name, o.shipping_last_name 
//       FROM orders o
//       WHERE o.order_id = ?
//     `;
    
//     console.log('Fetching customer email for order:', orderId);
//     const [emailResult] = await pool.query(emailQuery, [orderId]);
    
//     console.log('Email query result:', emailResult);
    
//     if (emailResult.length === 0) {
//       console.warn(`No order found with ID: ${orderId}`);
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     const customer = emailResult[0];
//     console.log('Customer data:', customer);

//     // Check if customer and shipping_email exist
//     if (customer && customer.shipping_email) {
//       try {
//         const email = customer.shipping_email.trim();
//         console.log('Trimmed email:', email);
        
//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!email || !emailRegex.test(email)) {
//           console.warn(`Invalid email format for order ${orderId}: '${email}'`);
//           return res.status(200).json({ 
//             message: 'Order status updated successfully',
//             warning: 'Could not send email notification due to invalid email format'
//           });
//         }

//         console.log('Sending email to:', email);
        
//         // Get order details for email
//         const orderDetails = await Order.getOrderDetails(orderId);
//         const order = orderDetails.order;
        
//         // Create professional email content
//         const subject = `Your order ${orderId} status has been updated`;
        
//         // HTML version of the email
//         const htmlContent = `
//         <html>
//           <head>
//             <style>
//               body { font-family: Arial, sans-serif; line-height: 1.6; }
//               .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//               .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
//               .content { padding: 20px; }
//               .order-info { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
//               .status { color: #2ecc71; font-weight: bold; }
//               .footer { text-align: center; padding: 20px; border-top: 1px solid #eee; }
//               .button { display: inline-block; padding: 10px 20px; background-color: #2ecc71; color: white; text-decoration: none; border-radius: 5px; }
//             </style>
//           </head>
//           <body>
//             <div class="container">
//               <div class="header">
//                 <h1>Intellicart Order Update</h1>
//               </div>
              
//               <div class="content">
//                 <p>Dear ${order.shipping_first_name || 'Customer'},</p>
                
//                 <div class="order-info">
//                   <h3>Order Status Update</h3>
//                   <p><strong>Order ID:</strong> ${orderId}</p>
//                   <p><strong>New Status:</strong> <span class="status">${status}</span></p>
//                   <p>Your order status has been updated to ${status.toLowerCase()}. You can track your order status in your account.</p>
//                 </div>

//                 <p>If you have any questions about your order, please reply to this email or contact our customer support.</p>
//               </div>

//               <div class="footer">
//                 <p>Thank you for shopping with Intellicart!</p>
//                 <a href="https://intellicart.com" class="button">Visit Our Website</a>
//                 <p> 2025 Intellicart. All rights reserved.</p>
//               </div>
//             </div>
//           </body>
//         </html>
//         `;

//         // Text version of the email (for clients that don't support HTML)
//         const textContent = `
// Dear ${order.shipping_first_name || 'Customer'},

// Your order status has been updated:

// Order ID: ${orderId}
// New Status: ${status}

// Your order status has been updated to ${status.toLowerCase()}. You can track your order status in your account.

// If you have any questions about your order, please reply to this email or contact our customer support.

// Thank you for shopping with Intellicart!

// Visit Our Website: https://intellicart.com
//  2025 Intellicart. All rights reserved.
//         `;

//         // Send email with both HTML and text versions
//         await sendEmail({
//           email: email,
//           subject: subject,
//           message: textContent,
//           html: htmlContent
//         });
        
//         console.log('Email sent successfully');
        
//       } catch (emailError) {
//         console.error(`Failed to send email for order ${orderId}:`, emailError);
//         // Don't fail the entire operation just because email sending failed
//         return res.status(200).json({ 
//           message: 'Order status updated successfully',
//           warning: 'Could not send email notification. Please check your email settings.'
//         });
//       }
//     } else {
//       console.warn(`No shipping email found for order ${orderId}. Customer data:`, customer);
//       return res.status(200).json({ 
//         message: 'Order status updated successfully',
//         warning: 'No customer email found for notification'
//       });
//     }

//     // Refresh orders list
//     const orders = await Order.findOrdersBySeller(sellerId);
//     res.json({ 
//       message: 'Order status updated successfully',
//       orders: orders.map(order => ({
//         id: order.order_id || '',
//         customer_email: order.user_email || '',
//         created_at: order.created_at?.toISOString() || '',
//         items_count: order.items_count || 0,
//         total_amount: parseFloat(order.total_amount) || 0,
//         status: order.status || 'Pending',
//         items: order.items || []
//       }))
//     });
//   } catch (error) {
//     console.error('Error in updateOrderStatus:', error);
//     res.status(500).json({ error: 'Failed to update order status', details: error.message });
//   }
// };

// module.exports = {
//   getSellerOrders,
//   getSellerOrderDetails,
//   updateOrderStatus
// };



const { pool } = require("../config/db");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailSender");
const Order = require('../models/Order');
const Product = require('../models/productModel');

// Helper function to get seller's products
const getSellerProducts = async (sellerId) => {
  try {
    const query = `SELECT id FROM products WHERE seller_id = ?`;
    const [rows] = await pool.query(query, [sellerId]);
    return rows.map(row => row.id);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

// Get all orders for seller's products
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    console.log('Fetching orders for seller:', sellerId);
    
    const orders = await Order.findOrdersBySeller(sellerId);
    console.log('Found orders:', orders.length);
    
    const formattedOrders = orders.map(order => ({
      id: order.order_id || '',
      customer_email: order.user_email || '',
      created_at: order.created_at?.toISOString() || '',
      items_count: order.items_count || 0,
      total_amount: parseFloat(order.total_amount) || 0,
      status: order.status || 'Pending',
      items: order.items || []
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error in getSellerOrders:', error);
    res.status(500).json({ error: 'Failed to fetch seller orders', details: error.message });
  }
};

// Get detailed order information for seller
const getSellerOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Verify if order contains seller's product
    const productQuery = `
      SELECT oi.product_id 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ? AND p.seller_id = ?
    `;
    const [productResult] = await pool.query(productQuery, [orderId, sellerId]);

    if (productResult.length === 0) {
      return res.status(403).json({ error: 'Unauthorized access to order' });
    }

    const orderDetails = await Order.getOrderDetails(orderId);

    // Format the response to include all required details
    const formattedOrderDetails = {
      order: {
        id: orderDetails.order.order_id,
        created_at: orderDetails.order.created_at?.toISOString(),
        status: orderDetails.order.status || 'Pending',
        total_amount: parseFloat(orderDetails.order.total_amount) || 0,
        payment_method: orderDetails.order.payment_method || 'cod',
        payment_status: orderDetails.order.payment_status || 'pending'
      },
      customer: {
        email: orderDetails.order.user_email,
        first_name: orderDetails.order.shipping_first_name,
        last_name: orderDetails.order.shipping_last_name
      },
      shipping: {
        address: orderDetails.order.shipping_address,
        city: orderDetails.order.shipping_city,
        state: orderDetails.order.shipping_state,
        zip: orderDetails.order.shipping_zip,
        country: orderDetails.order.shipping_country,
        phone: orderDetails.order.shipping_phone,
        email: orderDetails.order.shipping_email
      },
      items: orderDetails.items.map(item => ({
        product_id: item.product_id,
        name: item.product_name,
        image: item.product_image,
        price: parseFloat(item.price),
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal)
      })),
      totals: {
        subtotal: parseFloat(orderDetails.totals.subtotal),
        shipping: parseFloat(orderDetails.totals.shipping),
        tax: parseFloat(orderDetails.totals.tax),
        grandTotal: parseFloat(orderDetails.totals.grandTotal)
      }
    };

    res.json(formattedOrderDetails);
  } catch (error) {
    console.error('Error in getSellerOrderDetails:', error);
    res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    const sellerId = req.user?.id;

    if (!orderId || !status || !sellerId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('Updating order status for order:', orderId, 'to status:', status);

    // Verify if order contains seller's product
    const productQuery = `
      SELECT oi.product_id 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ? AND p.seller_id = ?
    `;
    const [productResult] = await pool.query(productQuery, [orderId, sellerId]);

    if (productResult.length === 0) {
      return res.status(403).json({ error: 'Unauthorized access to order' });
    }

    const updated = await Order.updateOrderStatus(orderId, status);

    if (!updated) {
      return res.status(404).json({ error: 'Order not found or status not updated' });
    }

    // Fetch customer email
    const emailQuery = `
      SELECT o.shipping_email, o.shipping_first_name, o.shipping_last_name 
      FROM orders o
      WHERE o.order_id = ?
    `;
    
    const [emailResult] = await pool.query(emailQuery, [orderId]);
    
    if (emailResult.length === 0) {
      console.warn(`No order found with ID: ${orderId}`);
      return res.status(404).json({ error: 'Order not found' });
    }

    const customer = emailResult[0];

    if (customer && customer.shipping_email) {
      try {
        const email = customer.shipping_email.trim();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          console.warn(`Invalid email format for order ${orderId}: '${email}'`);
          return res.status(200).json({ 
            message: 'Order status updated successfully',
            warning: 'Could not send email notification due to invalid email format'
          });
        }

        // Get order details for email
        const orderDetails = await Order.getOrderDetails(orderId);
        const order = orderDetails.order;
        
        // Create professional email content
        const subject = `Intellicart: Order ${orderId} Status Update`;
        
        // Enhanced HTML email template
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { background: #007bff; color: #ffffff; padding: 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 20px; }
              .content h2 { color: #333; font-size: 20px; margin-top: 0; }
              .content p { color: #555; line-height: 1.6; }
              .order-details { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .order-details p { margin: 5px 0; }
              .footer { background: #333; color: #ffffff; text-align: center; padding: 15px; font-size: 12px; }
              .footer a { color: #ffffff; text-decoration: underline; }
              .button { display: inline-block; padding: 10px 20px; background: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Intellicart Order Update</h1>
              </div>
              <div class="content">
                <h2>Dear ${order.shipping_first_name || 'Valued Customer'},</h2>
                <p>We’re pleased to inform you that the status of your order has been updated.</p>
                <div class="order-details">
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>New Status:</strong> ${status}</p>
                  <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                  <p><strong>Total Amount:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
                <p>You can track your order status or view details by visiting your account on our website.</p>
                <a href="https://intellicart.com/account" class="button">View Your Order</a>
                <p>If you have any questions, please contact our support team by replying to this email or calling us at (123) 456-7890.</p>
              </div>
              <div class="footer">
                <p>Thank you for shopping with Intellicart!</p>
                <p><a href="https://intellicart.com">Visit Our Website</a></p>
                <p>&copy; 2025 Intellicart. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Text version for clients that don't support HTML
        const textContent = `
Dear ${order.shipping_first_name || 'Valued Customer'},

We’re pleased to inform you that the status of your order has been updated.

Order Details:
- Order ID: ${orderId}
- New Status: ${status}
- Order Date: ${new Date(order.created_at).toLocaleDateString()}
- Total Amount: $${parseFloat(order.total_amount).toFixed(2)}

You can track your order status or view details by visiting your account at https://intellicart.com/account.

If you have any questions, please contact our support team by replying to this email or calling us at (123) 456-7890.

Thank you for shopping with Intellicart!
https://intellicart.com
© 2025 Intellicart. All rights reserved.
        `;

        await sendEmail({
          email: email,
          subject: subject,
          message: textContent,
          html: htmlContent
        });
        
        console.log('Email sent successfully');
        
      } catch (emailError) {
        console.error(`Failed to send email for order ${orderId}:`, emailError);
        return res.status(200).json({ 
          message: 'Order status updated successfully',
          warning: 'Could not send email notification. Please check your email settings.'
        });
      }
    } else {
      console.warn(`No shipping email found for order ${orderId}. Customer data:`, customer);
      return res.status(200).json({ 
        message: 'Order status updated successfully',
        warning: 'No customer email found for notification'
      });
    }

    // Refresh orders list
    const orders = await Order.findOrdersBySeller(sellerId);
    res.json({ 
      message: 'Order status updated successfully',
      orders: orders.map(order => ({
        id: order.order_id || '',
        customer_email: order.user_email || '',
        created_at: order.created_at?.toISOString() || '',
        items_count: order.items_count || 0,
        total_amount: parseFloat(order.total_amount) || 0,
        status: order.status || 'Pending',
        items: order.items || []
      }))
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
};

module.exports = {
  getSellerOrders,
  getSellerOrderDetails,
  updateOrderStatus
};