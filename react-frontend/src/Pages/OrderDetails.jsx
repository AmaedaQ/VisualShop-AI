import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams(); // Get orderId from URL
  const { state, actions } = useShop();
  const { user } = state;

  const [order, setOrder] = useState(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState(false); // Toggle email input for guests

  // Fetch order details on mount or when orderId/email changes
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, email]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const orderData = await actions.getOrder(orderId, user ? null : email);
      if (orderData) {
        setOrder(orderData);
      } else {
        setError("Order not found. Please verify your order ID and email.");
      }
    } catch (err) {
      setError("Failed to fetch order details. Please try again.");
      console.error("Fetch order error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle email input for guest users
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      fetchOrderDetails();
    } else {
      setError("Please enter a valid email address.");
    }
  };

  // Handle order status refresh
  const handleTrackOrder = async () => {
    setLoading(true);
    try {
      await actions.refreshOrderStatus(orderId);
      fetchOrderDetails(); // Refresh order details after status update
    } catch (err) {
      setError("Failed to refresh order status.");
      console.error("Track order error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render email input for guest users
  if (!user && !order && emailInput) {
    return (
      <div className="container py-4">
        <div className="d-flex align-items-center mb-4">
          <button
            className="btn btn-link text-secondary p-0 me-2"
            onClick={() => navigate("/orders")}
          >
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <h1 className="h4 fw-bold mb-0">Track Order</h1>
        </div>
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-4">Enter Order Details</h2>
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-3">
                <label className="form-label">Order ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={orderId}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the email used for the order"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                View Order Details
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render order details
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-link text-secondary p-0 me-2"
          onClick={() => navigate("/orders")}
        >
          <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <h1 className="h4 fw-bold mb-0">Order Details</h1>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          {!user && (
            <button
              className="btn btn-link p-0 ms-2"
              onClick={() => {
                setError(null);
                setEmailInput(true);
              }}
            >
              Try another email
            </button>
          )}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {!order && !error && !user && (
        <div className="card shadow-sm">
          <div className="card-body p-4 text-center">
            <p className="mb-3">Please enter the email associated with your order.</p>
            <button
              className="btn btn-primary"
              onClick={() => setEmailInput(true)}
            >
              Enter Email
            </button>
          </div>
        </div>
      )}

      {order && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-4">Order #{order.order_id}</h2>
                <div className="mb-4">
                  <h6 className="fw-bold">Order Status</h6>
                  <p className="text-capitalize">{order.status}</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleTrackOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Track Order
                      </>
                    )}
                  </button>
                </div>
                <div className="mb-4">
                  <h6 className="fw-bold">Order Items</h6>
                  {order.items.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="border-bottom pb-3 mb-3">
                      <div className="d-flex">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="rounded me-3"
                          style={{ width: "60px", height: "60px", objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{item.name}</h6>
                          {item.color && (
                            <p className="small text-muted mb-1">Color: {item.color}</p>
                          )}
                          <p className="small text-muted mb-0">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">${item.subtotal.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h6 className="fw-bold">Shipping Information</h6>
                  <p className="mb-1">{order.shipping_first_name} {order.shipping_last_name}</p>
                  <p className="mb-1">{order.shipping_address}</p>
                  <p className="mb-0">{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm position-sticky" style={{ top: "20px" }}>
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-4">Order Summary</h2>
                <div className="mb-3">
                  {order.items.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="d-flex justify-content-between mb-2">
                      <div className="flex-grow-1">
                        <div className="small">{item.name}</div>
                        <div className="small text-muted">Qty: {item.quantity}</div>
                      </div>
                      <div className="fw-medium">${item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="d-flex justify-content-between pt-3 border-top">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold text-primary">${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="d-flex gap-3 justify-content-center mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate("/orders")}
                  >
                    View Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;