import React, { useEffect, useState } from "react";
import { BiDollar, BiPackage, BiCartAlt, BiError, BiTrendingUp, BiRefresh } from "react-icons/bi";
import Chart from "chart.js/auto";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const DashboardTab = ({ setActiveTab }) => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      lowStockProducts: 0
    },
    recentOrders: [],
    salesData: [],
    productsData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && isSeller && user?.id) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isSeller, user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all required data in parallel
      const [ordersResponse, productsResponse, inventoryResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/seller/orders", { headers }),
        axios.get("http://localhost:5000/api/products/seller", { headers }),
        axios.get("http://localhost:5000/api/inventory", { headers })
      ]);

      const orders = ordersResponse.data;
      const products = productsResponse.data.products;
      const inventory = inventoryResponse.data;

      // Calculate stats
      const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const lowStockProducts = inventory.filter(item => 
        item.stock <= (item.reorder_level || 20)
      ).length;

      // Process sales data for chart (group by month)
      const salesByMonth = {};
      const currentYear = new Date().getFullYear();
      
      // Initialize months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(month => {
        salesByMonth[month] = 0;
      });

      orders.forEach(order => {
        if (order.created_at) {
          const orderDate = new Date(order.created_at);
          if (orderDate.getFullYear() === currentYear) {
            const monthName = months[orderDate.getMonth()];
            salesByMonth[monthName] += order.total_amount || 0;
          }
        }
      });

      const salesData = months.map(month => salesByMonth[month]);

      // Process products data for chart (group by category)
      const productsByCategory = {};
      products.forEach(product => {
        const category = product.category || 'Other';
        productsByCategory[category] = (productsByCategory[category] || 0) + 1;
      });

      const productsData = {
        labels: Object.keys(productsByCategory),
        data: Object.values(productsByCategory)
      };

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          customer: order.customer_email,
          date: new Date(order.created_at).toLocaleDateString(),
          amount: order.total_amount || 0,
          status: order.status || 'Pending',
          statusClass: getStatusClass(order.status)
        }));

      setDashboardData({
        stats: {
          totalSales,
          totalOrders,
          totalProducts,
          lowStockProducts
        },
        recentOrders,
        salesData,
        productsData
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'info';
      case 'shipped':
        return 'success';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  useEffect(() => {
    if (!loading && dashboardData.salesData.length > 0) {
      setupCharts();
    }
  }, [loading, dashboardData]);

  const setupCharts = () => {
    // Cleanup existing charts
    const existingCharts = Chart.instances;
    Object.keys(existingCharts).forEach((key) => {
      existingCharts[key].destroy();
    });

    // Sales Chart with enhanced styling
    const salesCtx = document.getElementById("salesChart");
    if (salesCtx) {
      new Chart(salesCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Monthly Sales",
              data: dashboardData.salesData,
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "rgba(99, 102, 241, 1)",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: {
                  size: 12,
                  weight: '500'
                },
                color: '#4B5563'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(99, 102, 241, 1)',
              borderWidth: 1,
              callbacks: {
                label: (context) => `$${context.raw.toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11
                },
                callback: (value) => `$${value.toLocaleString()}`,
              },
            },
          },
        },
      });
    }

    // Products Chart with enhanced styling
    const productsCtx = document.getElementById("productsChart");
    if (productsCtx && dashboardData.productsData.labels.length > 0) {
      const colors = [
        "rgba(99, 102, 241, 0.8)",
        "rgba(236, 72, 153, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(139, 92, 246, 0.8)",
        "rgba(249, 115, 22, 0.8)"
      ];

      new Chart(productsCtx, {
        type: "doughnut",
        data: {
          labels: dashboardData.productsData.labels,
          datasets: [
            {
              data: dashboardData.productsData.data,
              backgroundColor: colors.slice(0, dashboardData.productsData.labels.length),
              borderWidth: 0,
              hoverBorderWidth: 3,
              hoverBorderColor: '#ffffff'
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                font: {
                  size: 11,
                  weight: '500'
                },
                color: '#4B5563',
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              callbacks: {
                label: (context) => `${context.label}: ${context.raw} products`,
              },
            },
          },
          cutout: "65%",
        },
      });
    }
  };

  const handleViewAllOrders = () => {
    setActiveTab("orders");
  };

  if (!isAuthenticated || !isSeller) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="card border-0 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
          <div className="card-body text-center p-5">
            <div className="mb-4">
              <BiError className="text-warning" style={{ fontSize: "4rem" }} />
            </div>
            <h5 className="card-title text-muted mb-3">Access Required</h5>
            <p className="card-text text-muted">
              Please log in as a seller to view the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="card border-0 shadow-sm" style={{ maxWidth: "500px", width: "100%" }}>
          <div className="card-body text-center p-5">
            <div className="mb-4">
              <BiError className="text-danger" style={{ fontSize: "4rem" }} />
            </div>
            <h5 className="card-title text-danger mb-3">Error Loading Data</h5>
            <p className="card-text text-muted mb-4">{error}</p>
            <button 
              className="btn btn-primary px-4" 
              onClick={fetchDashboardData}
            >
              <BiRefresh className="me-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-pane fade show active" id="dashboard-section">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 fw-bold text-dark">Dashboard Overview</h2>
              <p className="text-muted mb-0">Welcome back! Here's what's happening with your store today.</p>
            </div>
            <button 
              className="btn btn-outline-primary d-flex align-items-center"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <BiRefresh className="me-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                      <BiDollar className="text-primary fs-4" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-0 small text-uppercase fw-semibold">Total Sales</h6>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-1">${dashboardData.stats.totalSales.toLocaleString()}</h2>
                  <div className="d-flex align-items-center">
                    <BiTrendingUp className="text-success me-1 small" />
                    <small className="text-success fw-medium">Current year total</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="position-absolute top-0 end-0 p-3">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                <BiDollar className="text-primary fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-success bg-opacity-10 rounded-3 p-2 me-3">
                      <BiCartAlt className="text-success fs-4" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-0 small text-uppercase fw-semibold">Orders</h6>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-1">{dashboardData.stats.totalOrders}</h2>
                  <div className="d-flex align-items-center">
                    <BiTrendingUp className="text-success me-1 small" />
                    <small className="text-success fw-medium">Total orders received</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="position-absolute top-0 end-0 p-3">
              <div className="bg-success bg-opacity-10 rounded-circle p-2">
                <BiCartAlt className="text-success fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-warning bg-opacity-10 rounded-3 p-2 me-3">
                      <BiPackage className="text-warning fs-4" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-0 small text-uppercase fw-semibold">Products</h6>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-1">{dashboardData.stats.totalProducts}</h2>
                  <div className="d-flex align-items-center">
                    <BiTrendingUp className="text-info me-1 small" />
                    <small className="text-info fw-medium">Active products</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="position-absolute top-0 end-0 p-3">
              <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                <BiPackage className="text-warning fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-danger bg-opacity-10 rounded-3 p-2 me-3">
                      <BiError className="text-danger fs-4" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-0 small text-uppercase fw-semibold">Low Stock</h6>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-1">{dashboardData.stats.lowStockProducts}</h2>
                  <div className="d-flex align-items-center">
                    {dashboardData.stats.lowStockProducts > 0 ? (
                      <>
                        <BiError className="text-danger me-1 small" />
                        <small className="text-danger fw-medium">Needs attention</small>
                      </>
                    ) : (
                      <>
                        <BiTrendingUp className="text-success me-1 small" />
                        <small className="text-success fw-medium">All good!</small>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="position-absolute top-0 end-0 p-3">
              <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                <BiError className="text-danger fs-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Orders */}
      <div className="card border-0 shadow-sm mb-5">
        <div className="card-header bg-white border-0 py-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-bold">Recent Orders</h5>
              <p className="text-muted mb-0 small">Latest orders from your customers</p>
            </div>
            <button
              onClick={handleViewAllOrders}
              className="btn btn-primary d-flex align-items-center"
            >
              View All Orders
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 px-4 fw-semibold text-muted small text-uppercase">Order ID</th>
                  <th className="border-0 py-3 fw-semibold text-muted small text-uppercase">Customer</th>
                  <th className="border-0 py-3 fw-semibold text-muted small text-uppercase">Date</th>
                  <th className="border-0 py-3 fw-semibold text-muted small text-uppercase">Amount</th>
                  <th className="border-0 py-3 fw-semibold text-muted small text-uppercase">Status</th>
                  <th className="border-0 py-3 fw-semibold text-muted small text-uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order, index) => (
                    <tr key={index} className="border-0">
                      <td className="px-4 py-3">
                        <span className="fw-bold text-primary">#ORD-{order.id}</span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <span className="small fw-bold text-primary">
                              {order.customer.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="fw-medium">{order.customer}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted">{order.date}</td>
                      <td className="py-3">
                        <span className="fw-bold text-success">${order.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-3">
                        <span className={`badge rounded-pill bg-${order.statusClass} bg-opacity-10 text-${order.statusClass} px-3 py-2 fw-medium`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button 
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => setActiveTab("orders")}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <BiCartAlt className="fs-1 mb-3 opacity-50" />
                        <p className="mb-0">No orders found</p>
                        <small>Orders will appear here once customers start purchasing</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Charts */}
      <div className="row g-4">
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold">Sales Analytics</h5>
                  <p className="text-muted mb-0 small">Monthly sales performance overview</p>
                </div>
                <div className="d-flex align-items-center text-muted small">
                  <BiTrendingUp className="me-1 text-success" />
                  Current Year
                </div>
              </div>
            </div>
            <div className="card-body">
              <div
                className="chart-container"
                style={{ position: "relative", height: "300px" }}
              >
                <canvas id="salesChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-4">
              <div>
                <h5 className="mb-1 fw-bold">Products by Category</h5>
                <p className="text-muted mb-0 small">Distribution of your product catalog</p>
              </div>
            </div>
            <div className="card-body">
              <div
                className="chart-container"
                style={{ position: "relative", height: "300px" }}
              >
                <canvas id="productsChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;