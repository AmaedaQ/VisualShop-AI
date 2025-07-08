/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { BiArrowFromBottom, BiArrowFromTop, BiTrendingUp, BiTrendingDown } from "react-icons/bi";
import { FaChartLine, FaShoppingCart, FaUsers, FaDollarSign, FaEye, FaBoxOpen } from "react-icons/fa";
import Chart from "chart.js/auto";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const AnalyticsTab = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [timePeriod, setTimePeriod] = useState("Weekly");
  const [analyticsData, setAnalyticsData] = useState({
    revenue: 0,
    orders: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    conversionChange: 0,
    avgOrderChange: 0,
    salesData: [],
    prevSalesData: [],
    days: []
  });
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [categoryData, setCategoryData] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const salesChartRef = useRef(null);
  const categoryChartRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && isSeller && user?.id) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, isSeller, user?.id, timePeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data in parallel
      const [insightsResponse, ordersResponse, productsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/inventory/insights`, { headers }),
        axios.get(`http://localhost:5000/api/seller/orders`, { headers }),
        axios.get(`http://localhost:5000/api/products/seller`, { headers })
      ]);

      const insights = insightsResponse.data;
      const orders = ordersResponse.data;
      const products = productsResponse.data.products;

      // Compute aggregate metrics
      const { revenue, ordersCount, avgOrderValue } = computeAggregateMetrics(orders, timePeriod);
      const { prevRevenue, prevOrdersCount, prevAvgOrderValue } = computeAggregateMetrics(orders, timePeriod, true);

      // Assume conversion rate based on views from insights
      const totalViews = insights.reduce((sum, item) => sum + (item.views || 0), 0);
      const conversionRate = totalViews > 0 ? (ordersCount / totalViews) * 100 : 0;
      const prevConversionRate = totalViews > 0 ? (prevOrdersCount / totalViews) * 100 : 0;

      // Compute percentage changes
      const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
      const ordersChange = prevOrdersCount > 0 ? ((ordersCount - prevOrdersCount) / prevOrdersCount) * 100 : 0;
      const conversionChange = prevConversionRate > 0 ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100 : 0;
      const avgOrderChange = prevAvgOrderValue > 0 ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100 : 0;

      // Process sales data for chart
      const salesByPeriod = processSalesData(orders, timePeriod);
      const prevSalesByPeriod = processSalesData(orders, timePeriod, true);

      // Process top products from insights
      const topProds = processTopProducts(insights, products);

      // Process top customers
      const topCusts = processTopCustomers(orders);

      // Process category data
      const catData = processCategoryData(products);

      // Update state
      setAnalyticsData({
        revenue,
        orders: ordersCount,
        conversionRate: conversionRate.toFixed(1),
        avgOrderValue,
        revenueChange: revenueChange.toFixed(1),
        ordersChange: ordersChange.toFixed(1),
        conversionChange: conversionChange.toFixed(1),
        avgOrderChange: avgOrderChange.toFixed(1),
        salesData: salesByPeriod.data,
        prevSalesData: prevSalesByPeriod.data,
        days: salesByPeriod.labels
      });
      setTopProducts(topProds);
      setTopCustomers(topCusts);
      setCategoryData(catData);

    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const computeAggregateMetrics = (orders, period, isPrevious = false) => {
    const currentDate = new Date();
    let startDate, endDate;

    switch (period) {
      case "Daily":
        startDate = new Date(currentDate);
        startDate.setHours(isPrevious ? currentDate.getHours() - 24 : 0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(isPrevious ? 23 : currentDate.getHours(), 59, 59, 999);
        break;
      case "Weekly":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - (isPrevious ? 14 : 7));
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "Monthly":
        startDate = new Date(currentDate.getFullYear(), isPrevious ? currentDate.getMonth() - 1 : currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), isPrevious ? currentDate.getMonth() : currentDate.getMonth() + 1, 0);
        break;
      case "Yearly":
        startDate = new Date(isPrevious ? currentDate.getFullYear() - 1 : currentDate.getFullYear(), 0, 1);
        endDate = new Date(isPrevious ? currentDate.getFullYear() - 1 : currentDate.getFullYear(), 11, 31);
        break;
      default:
        break;
    }

    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const revenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const ordersCount = filteredOrders.length;
    const avgOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

    return { revenue, ordersCount, avgOrderValue };
  };

  const processSalesData = (orders, period, isPrevious = false) => {
    const labels = [];
    const data = [];
    const currentDate = new Date();
    let startDate, endDate;

    switch (period) {
      case "Daily":
        labels.push(...["9AM", "12PM", "3PM", "6PM", "9PM"]);
        startDate = new Date(currentDate);
        startDate.setHours(isPrevious ? currentDate.getHours() - 24 : 0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(isPrevious ? 23 : currentDate.getHours(), 59, 59, 999);
        break;
      case "Weekly":
        labels.push(...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - (isPrevious ? 14 : 7));
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "Monthly":
        labels.push(...["Week 1", "Week 2", "Week 3", "Week 4"]);
        startDate = new Date(currentDate.getFullYear(), isPrevious ? currentDate.getMonth() - 1 : currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), isPrevious ? currentDate.getMonth() : currentDate.getMonth() + 1, 0);
        break;
      case "Yearly":
        labels.push(...["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
        startDate = new Date(isPrevious ? currentDate.getFullYear() - 1 : currentDate.getFullYear(), 0, 1);
        endDate = new Date(isPrevious ? currentDate.getFullYear() - 1 : currentDate.getFullYear(), 11, 31);
        break;
      default:
        break;
    }

    const salesByPeriod = Array(labels.length).fill(0);
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= startDate && orderDate <= endDate) {
        let index;
        switch (period) {
          case "Daily":
            const hour = orderDate.getHours();
            if (hour < 12) index = 0;
            else if (hour < 15) index = 1;
            else if (hour < 18) index = 2;
            else if (hour < 21) index = 3;
            else index = 4;
            break;
          case "Weekly":
            index = orderDate.getDay();
            break;
          case "Monthly":
            index = Math.floor((orderDate.getDate() - 1) / 7);
            break;
          case "Yearly":
            index = orderDate.getMonth();
            break;
          default:
            break;
        }
        if (index >= 0 && index < salesByPeriod.length) {
          salesByPeriod[index] += order.total_amount || 0;
        }
      }
    });

    return { labels, data: salesByPeriod };
  };

  const processTopProducts = (insights, products) => {
    return insights
      .map(insight => {
        const product = products.find(p => p.id === insight.product_id);
        if (!product) return null;
        return {
          name: insight.product_name,
          unitsSold: insight.sales || 0,
          revenue: insight.sales * (product.price || 0)
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  };

  const processTopCustomers = (orders) => {
    const customerSales = {};
    orders.forEach(order => {
      const customerEmail = order.customer_email || "Unknown";
      if (!customerSales[customerEmail]) {
        customerSales[customerEmail] = {
          name: customerEmail.split("@")[0],
          orders: 0,
          totalSpent: 0
        };
      }
      customerSales[customerEmail].orders += 1;
      customerSales[customerEmail].totalSpent += order.total_amount || 0;
    });
    return Object.values(customerSales)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  };

  const processCategoryData = (products) => {
    const categoryCounts = {};
    products.forEach(product => {
      const category = product.category || "Other";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    return {
      labels: Object.keys(categoryCounts),
      data: Object.values(categoryCounts)
    };
  };

  useEffect(() => {
    if (!loading && analyticsData.salesData.length > 0) {
      setupCharts();
    }
  }, [loading, analyticsData, categoryData]);

  const setupCharts = () => {
    // Cleanup existing charts
    const existingCharts = Chart.instances;
    Object.keys(existingCharts).forEach((key) => {
      existingCharts[key].destroy();
    });

    // Sales Chart with enhanced styling
    const salesCtx = salesChartRef.current?.getContext("2d");
    if (salesCtx) {
      new Chart(salesCtx, {
        type: "bar",
        data: {
          labels: analyticsData.days,
          datasets: [
            {
              label: "This Period",
              data: analyticsData.salesData,
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: "Previous Period",
              data: analyticsData.prevSalesData,
              backgroundColor: "rgba(156, 163, 175, 0.6)",
              borderColor: "rgba(156, 163, 175, 1)",
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 13,
                  weight: '500'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              titleColor: '#F9FAFB',
              bodyColor: '#F9FAFB',
              borderColor: 'rgba(59, 130, 246, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) {
                    label += ": ";
                  }
                  if (context.parsed.y !== null) {
                    label += "$" + context.parsed.y.toLocaleString();
                  }
                  return label;
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 12,
                  weight: '500'
                },
                color: '#6B7280'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(229, 231, 235, 0.8)',
                drawBorder: false,
              },
              ticks: {
                font: {
                  size: 12,
                  weight: '500'
                },
                color: '#6B7280',
                callback: function (value) {
                  return "$" + value.toLocaleString();
                },
              },
            },
          },
        },
      });
    }

    // Category Chart with enhanced styling
    const categoryCtx = categoryChartRef.current?.getContext("2d");
    if (categoryCtx && categoryData.labels.length > 0) {
      new Chart(categoryCtx, {
        type: "doughnut",
        data: {
          labels: categoryData.labels,
          datasets: [
            {
              data: categoryData.data,
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(139, 92, 246, 0.8)",
                "rgba(236, 72, 153, 0.8)"
              ],
              borderColor: [
                "rgba(59, 130, 246, 1)",
                "rgba(16, 185, 129, 1)",
                "rgba(245, 158, 11, 1)",
                "rgba(239, 68, 68, 1)",
                "rgba(139, 92, 246, 1)",
                "rgba(236, 72, 153, 1)"
              ],
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverBorderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              titleColor: '#F9FAFB',
              bodyColor: '#F9FAFB',
              borderColor: 'rgba(59, 130, 246, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} products (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }
  };

  const formatCurrency = (value) => {
    return (
      "$" +
      value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const getMetricIcon = (metric) => {
    const iconProps = { size: 24, className: "text-white" };
    switch (metric) {
      case 'revenue': return <FaDollarSign {...iconProps} />;
      case 'orders': return <FaShoppingCart {...iconProps} />;
      case 'conversion': return <FaEye {...iconProps} />;
      case 'avgOrder': return <FaChartLine {...iconProps} />;
      default: return <FaChartLine {...iconProps} />;
    }
  };

  const getMetricColor = (metric) => {
    switch (metric) {
      case 'revenue': return 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
      case 'orders': return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
      case 'conversion': return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
      case 'avgOrder': return 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
    }
  };

  if (!isAuthenticated || !isSeller) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-warning border-0 shadow-sm" style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
              borderRadius: '12px'
            }}>
              <div className="d-flex align-items-center">
                <FaUsers className="me-3" size={24} style={{ color: '#d97706' }} />
                <div>
                  <h6 className="mb-1 fw-bold" style={{ color: '#92400e' }}>Access Restricted</h6>
                  <p className="mb-0" style={{ color: '#b45309' }}>Please log in as a seller to view analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Analytics...</h5>
          <p className="text-muted small">Fetching your business insights</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <BiTrendingDown className="me-3" size={24} />
                  <div>
                    <h6 className="mb-1 fw-bold">Error Loading Analytics</h6>
                    <p className="mb-0">{error}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={fetchAnalyticsData}
                  style={{ borderRadius: '8px' }}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-pane fade show active">
      <div className="container-fluid px-0">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center bg-white p-4 rounded-3 shadow-sm border-0">
              <div className="mb-3 mb-md-0">
                <h2 className="fw-bold text-dark mb-1">Business Analytics</h2>
                <p className="text-muted mb-0">Track your performance and grow your business</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {["Daily", "Weekly", "Monthly", "Yearly"].map((period) => (
                  <button
                    key={period}
                    className={`btn px-3 py-2 fw-medium ${
                      timePeriod === period 
                        ? "btn-primary shadow-sm" 
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setTimePeriod(period)}
                    style={{ 
                      borderRadius: '8px',
                      fontSize: '14px',
                      minWidth: '80px'
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="row g-3 mb-4">
          {[
            {
              title: "Total Revenue",
              value: formatCurrency(analyticsData.revenue),
              change: analyticsData.revenueChange,
              metric: 'revenue'
            },
            {
              title: "Orders",
              value: analyticsData.orders.toLocaleString(),
              change: analyticsData.ordersChange,
              metric: 'orders'
            },
            {
              title: "Conversion Rate",
              value: `${analyticsData.conversionRate}%`,
              change: analyticsData.conversionChange,
              metric: 'conversion'
            },
            {
              title: "Avg. Order Value",
              value: formatCurrency(analyticsData.avgOrderValue),
              change: analyticsData.avgOrderChange,
              metric: 'avgOrder'
            }
          ].map((card, index) => (
            <div key={index} className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h6 className="text-muted fw-medium mb-1 small">{card.title}</h6>
                      <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '1.8rem' }}>
                        {card.value}
                      </h3>
                    </div>
                    <div 
                      className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                      style={{ 
                        background: getMetricColor(card.metric),
                        minWidth: '56px',
                        height: '56px'
                      }}
                    >
                      {getMetricIcon(card.metric)}
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div 
                      className={`d-flex align-items-center px-2 py-1 rounded-pill me-2 ${
                        card.change >= 0 ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
                      }`}
                    >
                      {card.change >= 0 ? (
                        <BiTrendingUp className={`me-1 text-success`} size={16} />
                      ) : (
                        <BiTrendingDown className={`me-1 text-danger`} size={16} />
                      )}
                      <span 
                        className={`fw-medium small ${
                          card.change >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {Math.abs(card.change)}%
                      </span>
                    </div>
                    <span className="text-muted small">
                      vs last {timePeriod.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="row mb-4">
          <div className="col-xl-8 col-lg-7 mb-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-transparent border-0 p-4 pb-0">
                <div className="d-flex align-items-center">
                  <div className="p-2 rounded-circle me-3" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                    <FaChartLine className="text-primary" size={20} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Sales Performance</h5>
                    <p className="text-muted small mb-0">Compare current vs previous {timePeriod.toLowerCase()}</p>
                  </div>
                </div>
              </div>
              <div className="card-body pt-2">
                <div style={{ height: "350px" }}>
                  <canvas ref={salesChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-lg-5 mb-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-transparent border-0 p-4 pb-0">
                <div className="d-flex align-items-center">
                  <div className="p-2 rounded-circle me-3" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <FaBoxOpen className="text-success" size={20} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Product Categories</h5>
                    <p className="text-muted small mb-0">Distribution of your inventory</p>
                  </div>
                </div>
              </div>
              <div className="card-body pt-2">
                <div style={{ height: "350px" }}>
                  <canvas ref={categoryChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tables Section */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-transparent border-0 p-4 pb-0">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="p-2 rounded-circle me-3" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                      <BiTrendingUp className="text-primary" size={20} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Top Products</h5>
                      <p className="text-muted small mb-0">Best performing products by sales</p>
                    </div>
                  </div>
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    Top 5
                  </span>
                </div>
              </div>
              <div className="card-body pt-2">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th className="border-0 text-muted fw-medium small pb-3">#</th>
                        <th className="border-0 text-muted fw-medium small pb-3">Product</th>
                        <th className="border-0 text-muted fw-medium small pb-3 text-center">Units</th>
                        <th className="border-0 text-muted fw-medium small pb-3 text-end">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td className="border-0 py-3">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                style={{ 
                                  width: '32px', 
                                  height: '32px', 
                                  fontSize: '12px',
                                  background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#6b7280'
                                }}
                              >
                                {index + 1}
                              </div>
                            </td>
                            <td className="border-0 py-3">
                              <div className="fw-medium text-dark" style={{ fontSize: '14px' }}>
                                {product.name}
                              </div>
                            </td>
                            <td className="border-0 py-3 text-center">
                              <span className="badge bg-light text-dark px-2 py-1 rounded-pill">
                                {product.unitsSold}
                              </span>
                            </td>
                            <td className="border-0 py-3 text-end">
                              <span className="fw-medium text-success">
                                {formatCurrency(product.revenue)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-5 text-muted border-0"></td>
                          <td>
                            <FaBoxOpen className="mb-3 text-muted" size={48} style={{ opacity: 0.3 }} />
                            <div>
                              <h6 className="text-muted">No products found</h6>
                              <p className="small mb-0">Start selling to see your top products here</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-transparent border-0 p-4 pb-0">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="p-2 rounded-circle me-3" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                      <FaUsers className="text-warning" size={20} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Top Customers</h5>
                      <p className="text-muted small mb-0">Highest value customers by spending</p>
                    </div>
                  </div>
                  <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">
                    VIP
                  </span>
                </div>
              </div>
              <div className="card-body pt-2">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th className="border-0 text-muted fw-medium small pb-3">#</th>
                        <th className="border-0 text-muted fw-medium small pb-3">Customer</th>
                        <th className="border-0 text-muted fw-medium small pb-3 text-center">Orders</th>
                        <th className="border-0 text-muted fw-medium small pb-3 text-end">Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.length > 0 ? (
                        topCustomers.map((customer, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td className="border-0 py-3">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                style={{ 
                                  width: '32px', 
                                  height: '32px', 
                                  fontSize: '12px',
                                  background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#6b7280'
                                }}
                              >
                                {index + 1}
                              </div>
                            </td>
                            <td className="border-0 py-3">
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold text-white"
                                  style={{ 
                                    width: '36px', 
                                    height: '36px', 
                                    fontSize: '14px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  }}
                                >
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-medium text-dark" style={{ fontSize: '14px' }}>
                                    {customer.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="border-0 py-3 text-center">
                              <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill">
                                {customer.orders}
                              </span>
                            </td>
                            <td className="border-0 py-3 text-end">
                              <span className="fw-medium text-success">
                                {formatCurrency(customer.totalSpent)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-5 text-muted border-0"></td>
                          <td>
                            <FaUsers className="mb-3 text-muted" size={48} style={{ opacity: 0.3 }} />
                            <div>
                              <h6 className="text-muted">No customers found</h6>
                              <p className="small mb-0">Customer data will appear as you make sales</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights Footer */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <div className="card-body p-4">
                <div className="row align-items-center text-white">
                  <div className="col-md-8">
                    <h5 className="fw-bold mb-2 text-white">💡 Quick Insights</h5>
                    <p className="mb-0 opacity-90">
                      {analyticsData.revenue > 0 ? (
                        <>
                          You've generated <strong>{formatCurrency(analyticsData.revenue)}</strong> in revenue this {timePeriod.toLowerCase()} 
                          with <strong>{analyticsData.orders}</strong> orders. 
                          {analyticsData.revenueChange > 0 ? 
                            ` That's ${analyticsData.revenueChange}% growth from last ${timePeriod.toLowerCase()}! 🚀` :
                            ` Focus on improving your conversion rate to boost sales.`
                          }
                        </>
                      ) : (
                        "Start selling to see your business insights and track your growth over time."
                      )}
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <div className="d-flex justify-content-md-end justify-content-start">
                      <div className="text-center me-4">
                        <div className="h4 fw-bold mb-1 text-white">
                          {formatNumber(analyticsData.orders)}
                        </div>
                        <div className="small opacity-90">Total Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="h4 fw-bold mb-1 text-white">
                          {analyticsData.conversionRate}%
                        </div>
                        <div className="small opacity-90">Conversion</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;