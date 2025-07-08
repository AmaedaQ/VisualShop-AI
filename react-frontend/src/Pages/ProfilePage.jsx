import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [otherTabTitle, setOtherTabTitle] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [tempPayment, setTempPayment] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
  });
  const [settings, setSettings] = useState({
    theme: "light",
    language: "en",
  });
  const navigate = useNavigate();
  const { state, actions } = useShop();
  const { user, isAuthenticated, logout, getCurrentUser } = useAuth();

  // Load user data from localStorage or set defaults
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const savedData = JSON.parse(localStorage.getItem(`user_data_${user.email}`)) || {};
      setAddress(savedData.address || "123 Main Street, New York, NY 10001");
      setPaymentMethod(savedData.paymentMethod || "Visa ending in 4242 (Expires 05/25)");
      setTempAddress(savedData.address || "123 Main Street, New York, NY 10001");
      setTempPayment(savedData.paymentMethod || "Visa ending in 4242 (Expires 05/25)");
      setNotificationPrefs(savedData.notificationPrefs || { email: true, sms: false });
      setSettings(savedData.settings || { theme: "light", language: "en" });
    }
  }, [isAuthenticated, user]);

  // Save user data to localStorage
  const saveUserData = () => {
    if (isAuthenticated && user?.email) {
      const userData = {
        address: tempAddress,
        paymentMethod: tempPayment,
        notificationPrefs,
        settings,
      };
      localStorage.setItem(`user_data_${user.email}`, JSON.stringify(userData));
      setAddress(tempAddress);
      setPaymentMethod(tempPayment);
      setIsEditingAddress(false);
      setIsEditingPayment(false);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (!["overview", "orders", "wishlist", "addresses", "payment", "notification", "settings"].includes(tabName)) {
      setOtherTabTitle(tabName.charAt(0).toUpperCase() + tabName.slice(1));
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleRemoveFromWishlist = (productId) => {
    actions.removeWishlistItem(productId);
  };

  const handleAddToCartFromWishlist = (product) => {
    actions.addToCart({
      ...product,
      quantity: 1,
      color: product.color || "default",
    });
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSaveNotifications = () => {
    saveUserData();
    alert("Notification preferences saved!");
  };

  const handleSaveSettings = () => {
    saveUserData();
    alert("Settings saved!");
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-4 text-center">
        <h2 className="h4 fw-bold mb-4">Please Log In</h2>
        <p className="text-secondary">You need to be logged in to view this page.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header with back button and home button */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-link text-secondary p-0 me-2"
          onClick={handleBackClick}
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s ease",
          }}
        >
          <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <button
          className="btn btn-link p-0 me-3"
          onClick={() => navigate("/")}
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            color: "#3a7bd5",
            transition: "all 0.2s ease",
          }}
        >
          <i className="bi bi-house-door-fill fs-5"></i>
        </button>
        <h1 className="h4 fw-bold mb-0">My Account</h1>
      </div>

      <div className="row g-4">
        {/* Sidebar Navigation */}
        <div className="col-lg-3">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 text-center border-bottom">
              <div
                className="rounded-circle overflow-hidden mx-auto mb-3"
                style={{ width: "100px", height: "100px" }}
              >
                <img
                  src="https://placehold.co/100x100"
                  alt={user?.email}
                  className="img-fluid"
                />
              </div>
              <h2 className="h5 fw-bold mb-1">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}</h2>
              <p className="small text-secondary mb-1">{user?.email}</p>
              <p className="small text-secondary">
                Member since {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="list-group list-group-flush" id="profile-tabs">
              {["overview", "orders", "wishlist", "addresses", "payment", "notification", "settings"].map((tab) => (
                <button
                  key={tab}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${
                    activeTab === tab ? "active" : ""
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  <i className={`bi bi-${tab === "overview" ? "person" : tab === "orders" ? "bag" : tab === "wishlist" ? "heart" : tab === "addresses" ? "geo-alt" : tab === "payment" ? "credit-card" : tab === "notification" ? "bell" : "gear"} me-3`}></i>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "wishlist" && state.wishlist.length > 0 && (
                    <span className="badge bg-primary rounded-pill ms-auto">
                      {state.wishlist.length}
                    </span>
                  )}
                </button>
              ))}
              <button
                className="list-group-item list-group-item-action d-flex align-items-center text-danger border-top mt-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-3"></i>Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="profile-tab-content">
              <div className="card shadow-sm mb-4 border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">Account Overview</h2>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-bag text-primary me-2"></i>
                          <h3 className="h6 fw-medium mb-0">Recent Orders</h3>
                        </div>
                        <p className="small text-secondary mb-2">
                          You have {state.orders.length} orders
                        </p>
                        <button
                          className="small text-primary border-0 bg-transparent p-0 text-decoration-none"
                          onClick={() => handleTabChange("orders")}
                        >
                          View All Orders
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-heart text-primary me-2"></i>
                          <h3 className="h6 fw-medium mb-0">Wishlist</h3>
                        </div>
                        <p className="small text-secondary mb-2">
                          {state.wishlist.length} items in your wishlist
                        </p>
                        <button
                          className="small text-primary border-0 bg-transparent p-0 text-decoration-none"
                          onClick={() => handleTabChange("wishlist")}
                        >
                          View Wishlist
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-geo-alt text-primary me-2"></i>
                          <h3 className="h6 fw-medium mb-0">Default Address</h3>
                          <button
                            className="btn btn-link p-0 ms-2"
                            onClick={() => setIsEditingAddress(true)}
                          >
                            <i className="bi bi-pencil fs-6 text-secondary"></i>
                          </button>
                        </div>
                        {isEditingAddress ? (
                          <div>
                            <textarea
                              className="form-control mb-2"
                              value={tempAddress}
                              onChange={(e) => setTempAddress(e.target.value)}
                            />
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={saveUserData}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => {
                                setTempAddress(address);
                                setIsEditingAddress(false);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="small text-secondary">
                            {address.split(",").map((line, i) => (
                              <p key={i} className={i === 0 ? "mb-1" : "mb-0"}>
                                {line.trim()}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-credit-card text-primary me-2"></i>
                          <h3 className="h6 fw-medium mb-0">Default Payment</h3>
                          <button
                            className="btn btn-link p-0 ms-2"
                            onClick={() => setIsEditingPayment(true)}
                          >
                            <i className="bi bi-pencil fs-6 text-secondary"></i>
                          </button>
                        </div>
                        {isEditingPayment ? (
                          <div>
                            <input
                              type="text"
                              className="form-control mb-2"
                              value={tempPayment}
                              onChange={(e) => setTempPayment(e.target.value)}
                            />
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={saveUserData}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => {
                                setTempPayment(paymentMethod);
                                setIsEditingPayment(false);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="small text-secondary">{paymentMethod}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">Recommended For You</h2>
                  <div className="row g-3">
                    {state.wishlist.slice(0, 3).map((product) => (
                      <div key={product.id} className="col-sm-6 col-md-4">
                        <div className="border rounded p-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="img-fluid rounded mb-3 w-100"
                            style={{ height: "120px", objectFit: "cover" }}
                          />
                          <h3 className="h6 mb-1">{product.name}</h3>
                          <p className="fw-bold text-primary mb-2">
                            ${product.price.toFixed(2)}
                          </p>
                          <button
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => handleAddToCartFromWishlist(product)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="profile-tab-content">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">My Orders</h2>
                  {state.orderLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-secondary mt-2">Loading your orders...</p>
                    </div>
                  ) : state.orders.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-bag fs-1 text-muted mb-3"></i>
                      <h5 className="fw-bold">No Orders Yet</h5>
                      <p className="text-secondary mb-4">Start shopping to see your orders here.</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/")}
                      >
                        <i className="bi bi-bag me-2"></i>Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      {state.orders.map((order) => (
                        <div key={order.order_id} className="border rounded mb-3 p-3 bg-light">
                          <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-medium">Order #{order.order_id}</span>
                              <span
                                className={`badge ${
                                  order.status === "delivered"
                                    ? "bg-success"
                                    : order.status === "cancelled"
                                    ? "bg-danger"
                                    : "bg-primary"
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-secondary">Order Date</span>
                              <span className="fw-bold">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-secondary">Order Total</span>
                              <span className="fw-bold">
                                ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                              </span>
                            </div>
                            {order.status !== "delivered" && order.status !== "cancelled" && (
                              <div className="d-flex justify-content-end">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => actions.cancelOrder(order.order_id)}
                                >
                                  Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="profile-tab-content">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">My Wishlist</h2>
                  {state.wishlist.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-heart fs-1 text-muted mb-3"></i>
                      <h5 className="fw-bold">Your Wishlist is Empty</h5>
                      <p className="text-secondary mb-4">
                        Save items you love for easy access later
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/")}
                      >
                        <i className="bi bi-bag me-2"></i>Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3">
                      {state.wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded p-3 d-flex align-items-center mb-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="rounded"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                          <div className="ms-3 flex-grow-1">
                            <h3 className="h6 mb-1">{item.name}</h3>
                            <p className="fw-bold text-primary mb-0">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddToCartFromWishlist(item)}
                            >
                              <i className="bi bi-cart"></i>
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleViewProduct(item.id)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="profile-tab-content">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">Addresses</h2>
                  <div className="bg-light p-3 rounded">
                    {isEditingAddress ? (
                      <div>
                        <textarea
                          className="form-control mb-2"
                          value={tempAddress}
                          onChange={(e) => setTempAddress(e.target.value)}
                          rows={4}
                        />
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={saveUserData}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setTempAddress(address);
                            setIsEditingAddress(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          <span className="small text-secondary">
                            {address.split(",").map((line, i) => (
                              <p key={i} className={i === 0 ? "mb-1" : "mb-0"}>
                                {line.trim()}
                              </p>
                            ))}
                          </span>
                          <button
                            className="btn btn-link p-0 ms-2"
                            onClick={() => setIsEditingAddress(true)}
                          >
                            <i className="bi bi-pencil fs-6 text-secondary"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === "payment" && (
            <div className="profile-tab-content">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">Payment Methods</h2>
                  <div className="bg-light p-3 rounded">
                    {isEditingPayment ? (
                      <div>
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={tempPayment}
                          onChange={(e) => setTempPayment(e.target.value)}
                        />
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={saveUserData}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setTempPayment(paymentMethod);
                            setIsEditingPayment(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          <span className="small text-secondary">{paymentMethod}</span>
                          <button
                            className="btn btn-link p-0 ms-2"
                            onClick={() => setIsEditingPayment(true)}
                          >
                            <i className="bi bi-pencil fs-6 text-secondary"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notification" && (
            <div className="profile-tab-content">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">Notifications</h2>
                  <div className="bg-light p-3 rounded">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notificationPrefs.email}
                        onChange={(e) =>
                          setNotificationPrefs({ ...notificationPrefs, email: e.target.checked })
                        }
                      />
                      <label className="form-check-label">Receive Email Notifications</label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notificationPrefs.sms}
                        onChange={(e) =>
                          setNotificationPrefs({ ...notificationPrefs, sms: e.target.checked })
                        }
                      />
                      <label className="form-check-label">Receive SMS Notifications</label>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSaveNotifications}
                    >
                      Save Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="profile-tab-content">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-4">Settings</h2>
                  <div className="bg-light p-3 rounded">
                    <div className="mb-3">
                      <label className="form-label">Theme</label>
                      <select
                        className="form-select"
                        value={settings.theme}
                        onChange={(e) =>
                          setSettings({ ...settings, theme: e.target.value })
                        }
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Language</label>
                      <select
                        className="form-select"
                        value={settings.language}
                        onChange={(e) =>
                          setSettings({ ...settings, language: e.target.value })
                        }
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSaveSettings}
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;