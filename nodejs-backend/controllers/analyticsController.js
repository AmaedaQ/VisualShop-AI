const { pool } = require("../config/db");

const getAnalyticsOverview = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const timePeriod = req.query.timePeriod || "Monthly";
    const currentDate = new Date();
    let startDate, endDate, prevStartDate, prevEndDate;

    // Define date ranges based on timePeriod
    switch (timePeriod.toLowerCase()) {
      case "daily":
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        prevEndDate = new Date(endDate);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        break;
      case "weekly":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        endDate = new Date(currentDate);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        prevEndDate = new Date(endDate);
        prevEndDate.setDate(prevEndDate.getDate() - 7);
        break;
      case "yearly":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        prevStartDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        prevEndDate = new Date(currentDate.getFullYear() - 1, 11, 31);
        break;
      case "monthly":
      default:
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        prevStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        prevEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
    }

    // Fetch current period data
    const [currentOrders] = await pool.execute(`
      SELECT 
        SUM(total_amount) as revenue, 
        COUNT(*) as orders,
        AVG(total_amount) as avg_order_value,
        DATE_FORMAT(created_at, '%Y-%m-%d') as date
      FROM orders 
      WHERE seller_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date ASC`,
      [sellerId, startDate, endDate]
    );

    const [topProducts] = await pool.execute(`
      SELECT 
        p.name, 
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.seller_id = ? AND o.created_at BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5`,
      [sellerId, startDate, endDate]
    );

    const [topCustomers] = await pool.execute(`
      SELECT 
        o.user_email,
        COUNT(*) as order_count,
        SUM(o.total_amount) as total_spent
      FROM orders o
      WHERE o.seller_id = ? AND o.created_at BETWEEN ? AND ?
      GROUP BY o.user_email
      ORDER BY total_spent DESC
      LIMIT 5`,
      [sellerId, startDate, endDate]
    );

    const [categoryStats] = await pool.execute(`
      SELECT 
        p.category,
        COUNT(*) as product_count,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.order_id
      WHERE p.seller_id = ? AND (o.created_at BETWEEN ? AND ? OR o.created_at IS NULL)
      GROUP BY p.category`,
      [sellerId, startDate, endDate]
    );

    // Fetch previous period data
    const [prevOrders] = await pool.execute(`
      SELECT SUM(total_amount) as revenue, COUNT(*) as orders 
      FROM orders 
      WHERE seller_id = ? AND created_at BETWEEN ? AND ?`,
      [sellerId, prevStartDate, prevEndDate]
    );

    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.revenue || 0), 0);
    const prevRevenue = prevOrders[0]?.revenue || 0;
    const currentOrdersCount = currentOrders.reduce((sum, order) => sum + (order.orders || 0), 0);
    const prevOrdersCount = prevOrders[0]?.orders || 0;
    const avgOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
    const prevAvgOrderValue = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;

    const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrdersCount > 0 ? ((currentOrdersCount - prevOrdersCount) / prevOrdersCount) * 100 : 0;
    const avgOrderChange = prevAvgOrderValue > 0 ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100 : 0;

    res.status(200).json({
      revenue: currentRevenue,
      orders: currentOrdersCount,
      avgOrderValue: avgOrderValue.toFixed(2),
      revenueChange: revenueChange.toFixed(1),
      ordersChange: ordersChange.toFixed(1),
      avgOrderChange: avgOrderChange.toFixed(1),
      salesData: currentOrders.map(order => ({
        date: order.date,
        revenue: order.revenue,
        orders: order.orders
      })),
      topProducts: topProducts.map(product => ({
        name: product.name,
        totalSold: product.total_sold,
        totalRevenue: product.total_revenue
      })),
      topCustomers: topCustomers.map(customer => ({
        email: customer.user_email,
        orderCount: customer.order_count,
        totalSpent: customer.total_spent
      })),
      categoryStats: categoryStats.map(category => ({
        name: category.category,
        productCount: category.product_count,
        totalRevenue: category.total_revenue
      }))
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

const getDetailedAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    const [detailedOrders] = await pool.execute(`
      SELECT 
        o.order_id,
        o.user_email,
        o.total_amount,
        o.created_at,
        oi.product_id,
        p.name as product_name,
        oi.quantity,
        oi.price as unit_price,
        oi.quantity * oi.price as item_total
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.seller_id = ? AND o.created_at BETWEEN ? AND ?
      ORDER BY o.created_at DESC`,
      [sellerId, startDate, endDate]
    );

    res.status(200).json({
      orders: detailedOrders.map(order => ({
        orderId: order.order_id,
        customerEmail: order.user_email,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        items: [{
          productId: order.product_id,
          productName: order.product_name,
          quantity: order.quantity,
          unitPrice: order.unit_price,
          itemTotal: order.item_total
        }]
      }))
    });
  } catch (error) {
    console.error("Detailed analytics error:", error);
    res.status(500).json({ message: "Error fetching detailed analytics" });
  }
};

module.exports = { getAnalyticsOverview, getDetailedAnalytics };