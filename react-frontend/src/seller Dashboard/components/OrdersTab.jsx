import React, { useState, useEffect } from "react";
import { BiDownload, BiPrinter, BiSearch, BiShow, BiEdit, BiFilter, BiRefresh } from "react-icons/bi";
import { Modal, Button, Badge, Tabs, Tab } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const OrdersTab = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  
  // State management
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch orders on component mount
  useEffect(() => {
    if (isAuthenticated && isSeller) {
      fetchOrders();
    }
  }, [isAuthenticated, isSeller]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get("http://localhost:5000/api/seller/orders", {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      const fetchedOrders = response.data || [];
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders); // Set filtered orders initially
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:5000/api/seller/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
      return null;
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus || !selectedOrder.order?.id) {
      toast.error('No valid order selected for status update');
      return;
    }

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/seller/orders/${selectedOrder.order.id}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      // Update local orders with the response
      if (response.data.orders) {
        setOrders(response.data.orders);
      }

      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Add filtering logic
  useEffect(() => {
    const filterOrders = () => {
      let filtered = [...orders];
      
      // Filter by status
      if (statusFilter !== "All Status") {
        filtered = filtered.filter(order => 
          order.status?.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(order => 
          order.id?.toString().toLowerCase().includes(searchLower) ||
          order.customer_email?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by date
      if (dateFilter) {
        filtered = filtered.filter(order => 
          new Date(order.created_at).toDateString() === new Date(dateFilter).toDateString()
        );
      }

      setFilteredOrders(filtered);
    };

    filterOrders();
  }, [orders, statusFilter, searchTerm, dateFilter]);

  // Handle view order details
  const handleViewOrder = async (order) => {
    const orderDetails = await fetchOrderDetails(order.id);
    if (orderDetails) {
      setSelectedOrder(orderDetails);
      setShowDetailModal(true);
    }
  };

  // Handle status update modal
  const handleStatusUpdate = async (order) => {
    const orderDetails = await fetchOrderDetails(order.id);
    if (orderDetails) {
      setSelectedOrder(orderDetails);
      setNewStatus(orderDetails.order.status || 'Pending');
      setShowStatusModal(true);
    } else {
      toast.error('Failed to load order details for status update');
    }
  };

  // Close modals
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setNewStatus("");
  };

  // Get badge color based on status
  const getBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "warning";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      case "pending":
        return "info";
      default:
        return "secondary";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="tab-pane fade show active">
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading orders...</h5>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="tab-pane fade show active">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="card border-danger shadow-sm" style={{ maxWidth: '400px' }}>
            <div className="card-body text-center">
              <div className="text-danger mb-3">
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title text-danger">Error Loading Orders</h5>
              <p className="card-text text-muted">{error}</p>
              <button 
                className="btn btn-outline-danger" 
                onClick={fetchOrders}
              >
                <BiRefresh className="me-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-pane fade show active">
      {/* Enhanced Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3 border">
        <div>
          <h2 className="mb-1 text-dark fw-bold">Order Management</h2>
          <p className="mb-0 text-muted">Manage and track all your orders</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-flex align-items-center">
            <BiDownload className="me-2" /> Export
          </button>
          <button className="btn btn-outline-secondary d-flex align-items-center">
            <BiPrinter className="me-2" /> Print
          </button>
          <button className="btn btn-success d-flex align-items-center" onClick={fetchOrders}>
            <BiRefresh className="me-2" /> Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title opacity-75">Total Orders</h6>
                  <h3 className="mb-0">{orders.length}</h3>
                </div>
                <div className="opacity-75">
                  <i className="bi bi-cart3" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title opacity-75">Pending</h6>
                  <h3 className="mb-0">{orders.filter(o => o.status?.toLowerCase() === 'pending').length}</h3>
                </div>
                <div className="opacity-75">
                  <i className="bi bi-clock" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title opacity-75">Processing</h6>
                  <h3 className="mb-0">{orders.filter(o => o.status?.toLowerCase() === 'processing').length}</h3>
                </div>
                <div className="opacity-75">
                  <i className="bi bi-gear" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title opacity-75">Delivered</h6>
                  <h3 className="mb-0">{orders.filter(o => o.status?.toLowerCase() === 'delivered').length}</h3>
                </div>
                <div className="opacity-75">
                  <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Order Filters */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-white border-0 d-flex align-items-center">
          <BiFilter className="me-2 text-primary" />
          <h6 className="mb-0 fw-semibold">Filter Orders</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Search Orders</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <BiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Order ID or Customer Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Status Filter</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Date Filter</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold">&nbsp;</label>
              <button
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All Status");
                  setDateFilter("");
                }}
              >
                <BiRefresh className="me-1" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Orders Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">
              Orders ({filteredOrders.length})
            </h6>
            {filteredOrders.length > 0 && (
              <small className="text-muted">
                Showing {filteredOrders.length} of {orders.length} orders
              </small>
            )}
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-semibold">Order ID</th>
                  <th className="border-0 fw-semibold">Customer</th>
                  <th className="border-0 fw-semibold">Date</th>
                  <th className="border-0 fw-semibold">Products</th>
                  <th className="border-0 fw-semibold">Total</th>
                  <th className="border-0 fw-semibold">Status</th>
                  <th className="border-0 fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-bottom">
                      <td className="fw-semibold text-primary">#{order.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                               style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {order.customer_email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-medium">{order.customer_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{formatDate(order.created_at)}</td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="fw-semibold">${Number(order.total_amount).toFixed(2)}</td>
                      <td>
                        <Badge bg={getBadgeColor(order.status)} className="px-3 py-2">
                          {order.status || 'Pending'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center"
                            onClick={() => handleViewOrder(order)}
                          >
                            <BiShow className="me-1" />
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning d-flex align-items-center"
                            onClick={() => handleStatusUpdate(order)}
                          >
                            <BiEdit className="me-1" />
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                        <h5 className="mt-3">No Orders Found</h5>
                        <p>No orders match your current search criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {filteredOrders.length > 0 && (
            <div className="border-top bg-light px-3 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Showing {filteredOrders.length} results
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className="page-item disabled">
                      <button className="page-link">Previous</button>
                    </li>
                    <li className="page-item active">
                      <button className="page-link">1</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">2</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">3</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Order Details Modal */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-receipt me-2"></i>
            Order #{selectedOrder?.order?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedOrder && (
            <Tabs defaultActiveKey="order" id="order-details-tabs" className="nav-fill">
              <Tab eventKey="order" title={<><i className="bi bi-info-circle me-2"></i>Order Details</>}>
                <div className="p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card h-100 bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-primary">Order Information</h6>
                          <p className="mb-2"><strong>Order ID:</strong> #{selectedOrder.order.id}</p>
                          <p className="mb-2"><strong>Order Date:</strong> {formatDate(selectedOrder.order.created_at)}</p>
                          <p className="mb-2"><strong>Status:</strong> <Badge bg={getBadgeColor(selectedOrder.order.status)}>{selectedOrder.order.status}</Badge></p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100 bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-primary">Payment Information</h6>
                          <p className="mb-2"><strong>Payment Method:</strong> {selectedOrder.order.payment_method.toUpperCase()}</p>
                          <p className="mb-2"><strong>Payment Status:</strong> {selectedOrder.order.payment_status.charAt(0).toUpperCase() + selectedOrder.order.payment_status.slice(1)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab eventKey="customer" title={<><i className="bi bi-person me-2"></i>Customer</>}>
                <div className="p-4">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title text-primary">Customer Information</h6>
                      <p className="mb-2"><strong>Full Name:</strong> {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}</p>
                      <p className="mb-2"><strong>Email:</strong> {selectedOrder.customer.email}</p>
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab eventKey="shipping" title={<><i className="bi bi-truck me-2"></i>Shipping</>}>
                <div className="p-4">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title text-primary">Shipping Address</h6>
                      <p className="mb-2"><strong>Address:</strong> {selectedOrder.shipping.address}</p>
                      <p className="mb-2"><strong>City:</strong> {selectedOrder.shipping.city}</p>
                      <p className="mb-2"><strong>State:</strong> {selectedOrder.shipping.state}</p>
                      <p className="mb-2"><strong>ZIP:</strong> {selectedOrder.shipping.zip}</p>
                      <p className="mb-2"><strong>Country:</strong> {selectedOrder.shipping.country}</p>
                      <p className="mb-2"><strong>Phone:</strong> {selectedOrder.shipping.phone}</p>
                      <p className="mb-2"><strong>Email:</strong> {selectedOrder.shipping.email}</p>
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab eventKey="items" title={<><i className="bi bi-bag me-2"></i>Items</>}>
                <div className="p-4">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead className="table-dark">
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-medium">{item.name}</td>
                            <td>${Number(item.price).toFixed(2)}</td>
                            <td>
                              <span className="badge bg-primary">{item.quantity}</span>
                            </td>
                            <td className="fw-semibold">${Number(item.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                          <td className="fw-semibold">${Number(selectedOrder.totals.subtotal).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-end"><strong>Shipping:</strong></td>
                          <td className="fw-semibold">${Number(selectedOrder.totals.shipping).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-end"><strong>Tax:</strong></td>
                          <td className="fw-semibold">${Number(selectedOrder.totals.tax).toFixed(2)}</td>
                        </tr>
                        <tr className="table-success">
                          <td colSpan="3" className="text-end"><strong>Grand Total:</strong></td>
                          <td className="fw-bold fs-5">${Number(selectedOrder.totals.grandTotal).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Close
          </Button>
          <Button variant="success" className="d-flex align-items-center">
            <BiPrinter className="me-2" />
            Print Invoice
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Enhanced Status Update Modal */}
      <Modal show={showStatusModal} onHide={handleCloseStatusModal} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title className="d-flex align-items-center">
            <BiEdit className="me-2" />
            Update Order Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && selectedOrder.order && (
            <div className="card bg-light">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <p className="mb-2"><strong>Order ID:</strong> #{selectedOrder.order.id}</p>
                    <p className="mb-2"><strong>Customer:</strong> {selectedOrder.customer.email}</p>
                    <p className="mb-3">
                      <strong>Current Status:</strong> 
                      <Badge bg={getBadgeColor(selectedOrder.order.status)} className="ms-2">
                        {selectedOrder.order.status}
                      </Badge>
                    </p>
                  </div>
                  <div className="col-12">
                    <label htmlFor="statusSelect" className="form-label fw-semibold">
                      Select New Status:
                    </label>
                    <select
                      id="statusSelect"
                      className="form-select form-select-lg"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStatusModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={updateOrderStatus}
            disabled={updatingStatus || !selectedOrder || newStatus === selectedOrder?.order?.status}
            className="d-flex align-items-center"
          >
            {updatingStatus ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Updating...
              </>
            ) : (
              <>
                <BiEdit className="me-2" />
                Update Status
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrdersTab;