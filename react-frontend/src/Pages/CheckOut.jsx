import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { logInteraction } from "../api/interactionService";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { state, actions } = useShop();
  const { cart, orderLoading } = state;

  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [orderError, setOrderError] = useState(null);

  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const [billingForm, setBillingForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const [formOptions, setFormOptions] = useState({
    sameAsBilling: true,
    saveInfo: false,
    shippingMethod: "standard",
    paymentMethod: "cod",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const cartTotals = useMemo(() => actions.getCartTotals(), [cart, actions]);

  const shippingCosts = {
    standard: cartTotals.subtotal > 75 ? 0 : 9.99,
    express: 19.99,
    overnight: 39.99,
  };

  const shippingCost = shippingCosts[formOptions.shippingMethod];
  const tax = useMemo(() => cartTotals.subtotal * 0.08, [cartTotals.subtotal]);
  const total = useMemo(
    () => cartTotals.subtotal + shippingCost + tax,
    [cartTotals.subtotal, shippingCost, tax]
  );

  const validateShippingForm = () => {
    const errors = {};
    const required = ["firstName", "lastName", "email", "address", "city", "state", "zipCode"];
    
    required.forEach(field => {
      if (!shippingForm[field]?.trim()) {
        errors[field] = "This field is required";
      }
    });

    if (shippingForm.email && !/\S+@\S+\.\S+/.test(shippingForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (shippingForm.zipCode && !/^\d{5}(-\d{4})?$/.test(shippingForm.zipCode)) {
      errors.zipCode = "Please enter a valid ZIP code";
    }

    if (shippingForm.phone && !/^\+?[\d\s\-\(\)]+$/.test(shippingForm.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentForm = () => {
    if (formOptions.paymentMethod === "cod") {
      return true;
    }

    const errors = {};
    
    if (!paymentForm.cardNumber.replace(/\s/g, "")) {
      errors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(paymentForm.cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (!paymentForm.expiryDate) {
      errors.expiryDate = "Expiry date is required";
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentForm.expiryDate)) {
      errors.expiryDate = "Please enter MM/YY format";
    }

    if (!paymentForm.cvv) {
      errors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(paymentForm.cvv)) {
      errors.cvv = "Please enter a valid CVV";
    }

    if (!paymentForm.cardName.trim()) {
      errors.cardName = "Cardholder name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      formattedValue = formattedValue.substring(0, 19);
    }

    if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").substring(0, 5);
    }

    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    }

    setPaymentForm(prev => ({ ...prev, [name]: formattedValue }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleOptionChange = (name, value) => {
    setFormOptions(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateShippingForm()) return;
    if (currentStep === 3 && !validatePaymentForm()) return;
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const placeOrder = async () => {
    if (!validatePaymentForm()) return;

    try {
      setOrderError(null);

      const orderPayload = {
        shippingInfo: {
          firstName: shippingForm.firstName,
          lastName: shippingForm.lastName,
          email: shippingForm.email,
          phone: shippingForm.phone,
          address: shippingForm.address + (shippingForm.apartment ? `, ${shippingForm.apartment}` : ""),
          city: shippingForm.city,
          state: shippingForm.state,
          zip: shippingForm.zipCode,
          country: shippingForm.country,
        },
        paymentMethod: formOptions.paymentMethod,
        totalAmount: parseFloat(total.toFixed(2)),
      };

      const result = await actions.createOrder(orderPayload);

      if (result.success) {
        setOrderData({
          orderId: result.orderId,
          ...result.order
        });
        setOrderPlaced(true);
        setCurrentStep(5);

        if (result.orderId) {
          cart.forEach(item => {
            const productId = parseInt(item.product_id, 10);
            if (!isNaN(productId)) {
              logInteraction(productId, 'order', {
                order_id: result.orderId,
                quantity: item.quantity,
                price: parseFloat(item.price),
                payment_method: orderPayload.paymentMethod
              }).catch(err => console.error('Failed to log order interaction:', err));
            }
          });
        }
      }
      
    } catch (error) {
      console.error("Order placement failed:", error);
      setOrderError(error.message || "Failed to place order. Please try again.");
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container py-5 bg-light">
        <div className="glass-card rounded-4 p-4 text-center">
          <div className="mb-4">
            <i className="bi bi-bag-x" style={{ fontSize: "3rem", color: '#667eea' }}></i>
          </div>
          <h3 className="fw-bold mb-3">Your cart is empty</h3>
          <p className="text-muted opacity-90 mb-4">Add some items to your cart before checkout</p>
          <button
            className="refresh-btn d-flex align-items-center"
            onClick={() => navigate("/")}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '25px',
              padding: '0.5rem 1.5rem',
              color: 'white',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <i className="bi bi-cart me-2"></i>Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-page" className="min-vh-100 bg-light">
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .refresh-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 25px;
          padding: 0.5rem 1.5rem;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        .section-divider {
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          width: 60px;
          margin: 0 auto 2rem;
        }
        .price-tag {
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .progress-bar {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
        }
        .form-check:hover {
          background-color: #f8f9fa;
          transform: scale(1.02);
        }
        .step-icon {
          width: 40px;
          height: 40px;
          transition: all 0.3s ease;
        }
        .step-icon.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .step-icon.completed {
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          color: white;
        }
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .alert-dismissible .btn-close {
          padding: 0.75rem;
          background-size: 0.8rem;
        }
        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }
        .item-image:hover {
          transform: scale(1.05);
        }
      `}</style>

      <div className="hero-gradient text-white py-3">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                onClick={() => navigate("/cart")}
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <button
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                onClick={() => navigate("/")}
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-house-door"></i>
              </button>
              <div>
                <h4 className="mb-1 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-cart-check"></i>Checkout
                </h4>
                <p className="mb-0 text-muted opacity-90">Secure order processing</p>
              </div>
            </div>
            <span
              className="badge badge-ai text-white px-3 py-1"
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '20px'
              }}
            >
              <i className="bi bi-cart me-1"></i>{cart.length} Items
            </span>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold h1 mb-3">Checkout</h2>
          <div className="section-divider"></div>
        </div>

        {orderError && (
          <div className="alert alert-danger alert-dismissible fade show rounded-4 mb-4" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-3 text-danger" style={{ fontSize: '1.2rem' }}></i>
              <div>
                <strong>Error</strong>
                <p className="mb-0 mt-1">{orderError}</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setOrderError(null)}
            ></button>
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="glass-card rounded-4 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                {[
                  { step: 1, title: "Shipping", icon: "truck" },
                  { step: 2, title: "Review", icon: "list-check" },
                  { step: 3, title: "Payment", icon: "credit-card" },
                  { step: 4, title: "Confirm", icon: "check-circle" },
                ].map(({ step, title, icon }) => (
                  <div key={step} className="d-flex flex-column align-items-center flex-fill">
                    <div
                      className={`step-icon rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                        currentStep > step ? 'completed' : currentStep === step ? 'active' : 'bg-light text-muted'
                      }`}
                    >
                      <i className={`bi bi-${icon}`}></i>
                    </div>
                    <small className={currentStep >= step ? 'fw-bold' : 'text-muted'}>{title}</small>
                  </div>
                ))}
              </div>
              <div className="progress" style={{ height: "2px" }}>
                <div
                  className="progress-bar"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="glass-card rounded-4 p-4">
                <h2 className="h5 fw-bold mb-4">Shipping Information</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">First Name *</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.firstName ? "is-invalid" : ""}`}
                      name="firstName"
                      value={shippingForm.firstName}
                      onChange={handleShippingChange}
                    />
                    {validationErrors.firstName && (
                      <div className="invalid-feedback">{validationErrors.firstName}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Last Name *</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.lastName ? "is-invalid" : ""}`}
                      name="lastName"
                      value={shippingForm.lastName}
                      onChange={handleShippingChange}
                    />
                    {validationErrors.lastName && (
                      <div className="invalid-feedback">{validationErrors.lastName}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={shippingForm.email}
                      onChange={handleShippingChange}
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">{validationErrors.email}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Phone</label>
                    <input
                      type="tel"
                      className={`form-control ${validationErrors.phone ? "is-invalid" : ""}`}
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                    />
                    {validationErrors.phone && (
                      <div className="invalid-feedback">{validationErrors.phone}</div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small">Address *</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.address ? "is-invalid" : ""}`}
                      name="address"
                      value={shippingForm.address}
                      onChange={handleShippingChange}
                    />
                    {validationErrors.address && (
                      <div className="invalid-feedback">{validationErrors.address}</div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small">Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apartment"
                      value={shippingForm.apartment}
                      onChange={handleShippingChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">City *</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.city ? "is-invalid" : ""}`}
                      name="city"
                      value={shippingForm.city}
                      onChange={handleShippingChange}
                    />
                    {validationErrors.city && (
                      <div className="invalid-feedback">{validationErrors.city}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">State *</label>
                    <select
                      className={`form-select ${validationErrors.state ? "is-invalid" : ""}`}
                      name="state"
                      value={shippingForm.state}
                      onChange={handleShippingChange}
                    >
                      <option value="">Select State</option>
                      <option value="AL">Alabama</option>
                      <option value="CA">California</option>
                      <option value="FL">Florida</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                    </select>
                    {validationErrors.state && (
                      <div className="invalid-feedback">{validationErrors.state}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">ZIP Code *</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.zipCode ? "is-invalid" : ""}`}
                      name="zipCode"
                      value={shippingForm.zipCode}
                      onChange={handleShippingChange}
                    />
                    {validationErrors.zipCode && (
                      <div className="invalid-feedback">{validationErrors.zipCode}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Shipping Method</h6>
                  <div className="row g-3">
                    {[
                      { id: "standard", name: "Standard Shipping", time: "5-7 business days", cost: cartTotals.subtotal > 75 ? 0 : 9.99 },
                      { id: "express", name: "Express Shipping", time: "2-3 business days", cost: 19.99 },
                      { id: "overnight", name: "Overnight Shipping", time: "Next business day", cost: 39.99 },
                    ].map(method => (
                      <div key={method.id} className="col-12">
                        <div className="form-check p-3 border rounded glass-card transition-all">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="shippingMethod"
                            id={method.id}
                            checked={formOptions.shippingMethod === method.id}
                            onChange={() => handleOptionChange("shippingMethod", method.id)}
                          />
                          <label className="form-check-label w-100" htmlFor={method.id}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="fw-bold">{method.name}</div>
                                <small className="text-muted">{method.time}</small>
                              </div>
                              <div className="fw-bold">
                                {method.cost === 0 ? "FREE" : `$${method.cost.toFixed(2)}`}
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="glass-card rounded-4 p-4">
                <h2 className="h5 fw-bold mb-4">Review Your Order</h2>
                {cart.map((item) => (
                  <div key={`${item.id}-${item.color}`} className="border-bottom pb-3 mb-3">
                    <div className="d-flex align-items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image me-3"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=Image'; }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{item.name}</h6>
                        {item.color && (
                          <p className="small text-muted mb-1">Color: {item.color}</p>
                        )}
                        <p className="small text-muted mb-0">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold price-tag">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 glass-card rounded-4">
                  <h6 className="fw-bold mb-2">Shipping Information</h6>
                  <p className="mb-1 text-muted">{shippingForm.firstName} {shippingForm.lastName}</p>
                  <p className="mb-1 text-muted">{shippingForm.address}</p>
                  {shippingForm.apartment && <p className="mb-1 text-muted">{shippingForm.apartment}</p>}
                  <p className="mb-0 text-muted">{shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="glass-card rounded-4 p-4">
                <h2 className="h5 fw-bold mb-4">Payment Information</h2>
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Payment Method</h6>
                  {[
                    { id: "cod", label: "Cash on Delivery", icon: "cash" },
                    { id: "card", label: "Credit/Debit Card", icon: "credit-card" },
                    { id: "paypal", label: "PayPal", icon: "paypal" },
                  ].map(method => (
                    <div key={method.id} className="form-check mb-3 p-3 border rounded glass-card transition-all">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id={method.id}
                        checked={formOptions.paymentMethod === method.id}
                        onChange={() => handleOptionChange("paymentMethod", method.id)}
                      />
                      <label className="form-check-label w-100" htmlFor={method.id}>
                        <i className={`bi bi-${method.icon} me-2`}></i>{method.label}
                      </label>
                    </div>
                  ))}
                </div>

                {formOptions.paymentMethod === "cod" && (
                  <div className="alert alert-info rounded-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle me-3" style={{ fontSize: '1.2rem' }}></i>
                      <p className="mb-0">You will pay when your order is delivered to your address.</p>
                    </div>
                  </div>
                )}

                {formOptions.paymentMethod === "card" && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold small">Card Number *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.cardNumber ? "is-invalid" : ""}`}
                        name="cardNumber"
                        value={paymentForm.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                      />
                      {validationErrors.cardNumber && (
                        <div className="invalid-feedback">{validationErrors.cardNumber}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Expiry Date *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.expiryDate ? "is-invalid" : ""}`}
                        name="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={handlePaymentChange}
                        placeholder="MM/YY"
                      />
                      {validationErrors.expiryDate && (
                        <div className="invalid-feedback">{validationErrors.expiryDate}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">CVV *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.cvv ? "is-invalid" : ""}`}
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                      />
                      {validationErrors.cvv && (
                        <div className="invalid-feedback">{validationErrors.cvv}</div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold small">Cardholder Name *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.cardName ? "is-invalid" : ""}`}
                        name="cardName"
                        value={paymentForm.cardName}
                        onChange={handlePaymentChange}
                        placeholder="John Doe"
                      />
                      {validationErrors.cardName && (
                        <div className="invalid-feedback">{validationErrors.cardName}</div>
                      )}
                    </div>
                  </div>
                )}

                {formOptions.paymentMethod === "paypal" && (
                  <div className="text-center py-4">
                    <i className="bi bi-paypal" style={{ fontSize: "3rem", color: '#667eea' }}></i>
                    <p className="mt-3 text-muted">You will be redirected to PayPal to complete your payment</p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="glass-card rounded-4 p-4">
                <h2 className="h5 fw-bold mb-4">Order Confirmation</h2>
                <div className="alert alert-info rounded-4 mb-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle me-3" style={{ fontSize: '1.2rem' }}></i>
                    <p className="mb-0">Please review your order details before placing your order.</p>
                  </div>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Shipping Address</h6>
                    <p className="mb-1 text-muted">{shippingForm.firstName} {shippingForm.lastName}</p>
                    <p className="mb-1 text-muted">{shippingForm.address}</p>
                    {shippingForm.apartment && <p className="mb-1 text-muted">{shippingForm.apartment}</p>}
                    <p className="mb-0 text-muted">{shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Payment Method</h6>
                    <p className="mb-0 text-muted">
                      {formOptions.paymentMethod === "cod" && "Cash on Delivery"}
                      {formOptions.paymentMethod === "card" && `Card ending in ${paymentForm.cardNumber.slice(-4)}`}
                      {formOptions.paymentMethod === "paypal" && "PayPal"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && orderPlaced && orderData && (
              <div className="glass-card rounded-4 p-5 text-center">
                <div className="mb-4">
                  <i className="bi bi-check-circle" style={{ fontSize: "4rem", color: '#4ecdc4' }}></i>
                </div>
                <h2 className="h4 fw-bold mb-3" style={{ color: '#4ecdc4' }}>Order Placed Successfully!</h2>
                <p className="text-muted mb-2">Order ID: <strong>{orderData.orderId}</strong></p>
                <p className="text-muted mb-4">Thank you for your purchase. We've sent a confirmation email with your order details.</p>
                <button
                  className="refresh-btn d-flex align-items-center mx-auto"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-cart me-2"></i>Continue Shopping
                </button>
              </div>
            )}

            {currentStep < 5 && (
              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={currentStep === 1 ? () => navigate("/cart") : prevStep}
                  disabled={orderLoading}
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  {currentStep === 1 ? "Back to Cart" : "Previous"}
                </button>
                
                {currentStep < 4 ? (
                  <button 
                    className="refresh-btn d-flex align-items-center rounded-pill px-4"
                    onClick={nextStep}
                    disabled={orderLoading}
                  >
                    Continue
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button 
                    className="refresh-btn d-flex align-items-center rounded-pill px-4"
                    onClick={placeOrder}
                    disabled={orderLoading}
                    style={{
                      background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                      opacity: orderLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!orderLoading) e.target.style.transform = 'translateY(-2px)';
                      if (!orderLoading) e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {orderLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-credit-card me-2"></i>
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="glass-card rounded-4 p-4 position-sticky" style={{ top: "20px" }}>
              <h2 className="h5 fw-bold mb-4">Order Summary</h2>
              <div className="mb-3">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.color}`} className="d-flex justify-content-between mb-2">
                    <div className="flex-grow-1">
                      <div className="small fw-bold">{item.name}</div>
                      <div className="small text-muted">Qty: {item.quantity}</div>
                    </div>
                    <div className="fw-medium price-tag">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-medium">${cartTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Shipping</span>
                  <span className="fw-medium">
                    {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tax</span>
                  <span className="fw-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between pt-3 border-top">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold price-tag">${total.toFixed(2)}</span>
                </div>
              </div>
              {currentStep < 4 && (
                <div className="alert alert-light small rounded-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-check me-2" style={{ fontSize: '1rem' }}></i>
                    <p className="mb-0">Your payment information is secure and encrypted.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;