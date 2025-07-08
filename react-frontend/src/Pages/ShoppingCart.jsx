import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { state, actions } = useShop();
  const { cart, loading } = state;

  const recommendedProducts = useMemo(
    () => [
      {
        id: "4",
        name: "Wireless Charging Pad",
        price: 34.99,
        image: "https://placehold.co/80x80",
        description: "Essential companion for your devices",
        colors: ["black", "white"]
      },
      {
        id: "5",
        name: "Premium Headphone Case",
        price: 24.99,
        image: "https://placehold.co/80x80",
        description: "Perfect protection for your headphones",
        colors: ["brown", "black"]
      },
    ],
    []
  );

  const cartTotals = useMemo(() => {
    return actions.getCartTotals();
  }, [cart, actions]);

  const { subtotal, itemCount, shipping, tax, total } = cartTotals;

  const handleBackClick = () => navigate(-1);
  const handleContinueShopping = () => navigate("/");
  const handleProceedToCheckout = () => navigate("/checkout");

  const handleAddToCart = async (product) => {
    try {
      await actions.addToCart({
        ...product,
        quantity: 1,
        color: product.colors?.[0] || "default",
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleRemoveItem = async (productId, color) => {
    try {
      await actions.removeFromCart(productId, color);
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const handleQuantityChange = async (productId, color, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await actions.updateCartQuantity(productId, color, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await actions.clearCart();
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    }
  };

  return (
    <div id="shopping-cart-page" className="min-vh-100 bg-light">
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
        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }
        .item-image:hover {
          transform: scale(1.05);
        }
        .quantity-btn {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .quantity-btn:hover {
          transform: scale(1.1);
          background-color: #667eea;
          color: white;
          border-color: #667eea;
        }
        .recommended-card {
          transition: all 0.3s ease;
        }
        .recommended-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
        }
        .add-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: none;
          border-radius: 20px;
          padding: 0.3rem 1rem;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .add-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .remove-btn {
          color: #ff6b6b;
          transition: all 0.3s ease;
        }
        .remove-btn:hover {
          color: #ee5a52;
          transform: scale(1.1);
        }
      `}</style>

      <div className="hero-gradient text-white py-3">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                onClick={handleBackClick}
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
                  <i className="bi bi-cart"></i>Shopping Cart
                </h4>
                <p className="mb-0 text-muted opacity-90">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
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
              <i className="bi bi-cart me-1"></i>{cart.length} Products
            </span>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold h1 mb-3">Your Cart</h2>
          <div className="section-divider"></div>
        </div>

        {loading && (
          <div className="glass-card rounded-4 p-4 text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted fs-5">Loading cart items...</p>
          </div>
        )}

        {cart.length > 0 ? (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="glass-card rounded-4 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h5 fw-bold mb-0">Cart Items ({itemCount})</h2>
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">{cart.length} product{cart.length !== 1 ? 's' : ''}</small>
                    <button
                      className="btn btn-outline-danger btn-sm d-flex align-items-center rounded-pill"
                      onClick={handleClearCart}
                      disabled={loading}
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
                      <i className="bi bi-trash me-1"></i>Clear Cart
                    </button>
                  </div>
                </div>

                <div id="cart-items-container">
                  {cart.map((item) => (
                    <div
                      key={`${item.product_id || item.id}-${item.color}`}
                      className="border-bottom pb-3 mb-3"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-image me-3"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Image'; }}
                          loading="lazy"
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h3 className="h6 fw-bold mb-1">{item.name}</h3>
                              {item.color && item.color !== "default" && (
                                <p className="small text-muted mb-1">
                                  Color: <span className="text-capitalize">{item.color}</span>
                                </p>
                              )}
                            </div>
                            <button
                              className="btn btn-link remove-btn p-0"
                              onClick={() => handleRemoveItem(item.product_id || item.id, item.color)}
                              aria-label="Remove item"
                              disabled={loading}
                            >
                              <i className="bi bi-trash fs-5"></i>
                            </button>
                          </div>
                          <p className="price-tag mb-2">${parseFloat(item.price).toFixed(2)}</p>
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-outline-secondary quantity-btn"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id || item.id,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Decrease quantity"
                              disabled={loading || item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="mx-3 fw-medium">{item.quantity}</span>
                            <button
                              className="btn btn-outline-secondary quantity-btn"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id || item.id,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Increase quantity"
                              disabled={loading}
                            >
                              +
                            </button>
                            <span className="ms-auto fw-bold price-tag">
                              ${parseFloat(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-4 p-4">
                <h2 className="h5 fw-bold mb-4">Recommended for You</h2>
                <div className="row g-3">
                  {recommendedProducts.map((product) => (
                    <div key={product.id} className="col-sm-6">
                      <div className="recommended-card glass-card rounded-4 p-3 h-100">
                        <div className="d-flex">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="item-image rounded"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Image'; }}
                            loading="lazy"
                          />
                          <div className="ms-3 d-flex flex-column">
                            <h3 className="h6 fw-bold mb-1">{product.name}</h3>
                            <p className="small text-muted mb-auto">{product.description}</p>
                            <div className="d-flex align-items-center justify-content-between mt-2">
                              <span className="fw-bold price-tag">${product.price.toFixed(2)}</span>
                              <button
                                className="add-btn text-white"
                                onClick={() => handleAddToCart(product)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                  <i className="bi bi-plus me-1"></i>
                                )}
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="glass-card rounded-4 p-4 position-sticky" style={{ top: "20px" }}>
                <h2 className="h5 fw-bold mb-4">Order Summary</h2>
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal ({itemCount} items)</span>
                    <span className="fw-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Shipping</span>
                    <span className="fw-medium">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {tax > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tax</span>
                      <span className="fw-medium">${tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between pt-3 border-top">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold price-tag fs-5">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  className="refresh-btn w-100 d-flex align-items-center justify-content-center mb-3 rounded-pill"
                  onClick={handleProceedToCheckout}
                  disabled={cart.length === 0 || loading}
                  style={{ opacity: cart.length === 0 || loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card me-2"></i>
                      Proceed to Checkout
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center rounded-pill"
                  onClick={handleContinueShopping}
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
                  <i className="bi bi-bag me-2"></i>Continue Shopping
                </button>
                <div className="text-center mt-3">
                  <small className="text-muted d-flex align-items-center justify-content-center">
                    <i className="bi bi-shield-check me-1" style={{ color: '#667eea' }}></i>
                    Secure Checkout
                  </small>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-4 p-5 text-center">
            <div className="mb-4">
              <i className="bi bi-bag" style={{ fontSize: "3rem", color: '#667eea' }}></i>
            </div>
            <h2 className="h4 fw-bold mb-3">Your Cart is Empty</h2>
            <p className="text-muted mb-4">Looks like you haven't added any products to your cart yet.</p>
            <button
              className="refresh-btn d-flex align-items-center mx-auto rounded-pill"
              onClick={handleContinueShopping}
            >
              <i className="bi bi-bag me-2"></i>Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ShoppingCart);