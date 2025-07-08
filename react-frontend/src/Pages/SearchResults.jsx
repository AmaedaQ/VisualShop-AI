import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { logInteraction } from '../api/interactionService';

const SearchResults = () => {
  const location = useLocation();
  const { state, actions } = useShop();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch("http://localhost:5000/api/products");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const all = await res.json();
        const filtered = all.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.map(product => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          rating: typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating,
        })));
      } catch (err) {
        console.error("Search fetch failed", err);
        setError("Failed to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (query.trim()) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [query]);

  const handleProductClick = async (productId, e) => {
    e.preventDefault();
    try {
      await logInteraction(productId, 'view', { page: 'SearchResults' });
    } catch (error) {
      console.error('Failed to log view interaction:', error);
    }
    window.location.href = `/product/${productId}`;
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color || '',
        quantity: 1,
        discount: product.discount || 0
      };
      await actions.addToCart(itemToAdd);
      alert(`Added ${product.name} to cart!`);
      await logInteraction(itemToAdd.id, 'add_to_cart', {
        quantity: itemToAdd.quantity,
        price: itemToAdd.price,
        color: itemToAdd.color,
        page: 'SearchResults'
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const handleToggleWishlist = async (e, product) => {
    e.stopPropagation();
    try {
      await actions.toggleWishlistItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        discount: product.discount || 0
      });
      const isInWishlist = state.wishlist.some(item => String(item.id) === String(product.id));
      alert(`${product.name} ${isInWishlist ? 'removed from' : 'added to'} wishlist!`);
      await logInteraction(product.id, isInWishlist ? 'remove_wishlist' : 'add_wishlist', { page: 'SearchResults' });
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const getProductRating = (product) => {
    return product.rating || (3.5 + Math.random() * 1.5);
  };

  if (!query.trim()) {
    return (
      <div className="container py-5 bg-light">
        <div className="glass-card rounded-4 p-4 text-center">
          <div className="mb-4">
            <i className="bi bi-search" style={{ fontSize: "3rem", color: '#667eea' }}></i>
          </div>
          <h3 className="fw-bold mb-3">Start Your Search</h3>
          <p className="text-muted opacity-90">Enter a search term to find products</p>
        </div>
      </div>
    );
  }

  return (
    <div id="search-results-page" className="min-vh-100 bg-light">
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
        }
        .product-card {
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
        }
        .image-container {
          position: relative;
          overflow: hidden;
          border-radius: 8px 8px 0 0;
        }
        .product-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        .badge-modern {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          border: none;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.3rem 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-ai {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.3rem 0.7rem;
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
        .rating-stars {
          color: #ffc107;
          font-size: 0.9rem;
        }
        .price-tag {
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .add-to-cart-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .add-to-cart-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .wishlist-btn {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0px;
          left: 0px;
          transition: all 0.3s ease;
          z-index: 1;
        }
        .wishlist-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
      `}</style>

      <div className="hero-gradient text-white py-3">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                onClick={() => window.history.back()}
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
                onClick={() => (window.location.href = "/")}
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
                  <i className="bi bi-search"></i>Search Results
                </h4>
                <p className="mb-0 text-muted opacity-90">
                  Results for "<span className="fw-medium">{query}</span>"
                  {!loading && results.length > 0 && (
                    <span className="ms-2">
                      ({results.length} {results.length === 1 ? 'product' : 'products'})
                    </span>
                  )}
                </p>
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
              <i className="bi bi-grid-3x3-gap me-1"></i>{results.length} Results
            </span>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold h1 mb-3">Search Results</h2>
          <div className="section-divider"></div>
        </div>

        {loading && (
          <div className="glass-card rounded-4 p-4 text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted fs-5">Searching for products...</p>
          </div>
        )}

        {error && (
          <div className="glass-card rounded-4 p-4 text-center py-5">
            <div className="mb-3">
              <i className="bi bi-exclamation-triangle text-warning display-4"></i>
            </div>
            <h4 className="fw-bold mb-2">Oops! Something went wrong</h4>
            <p className="text-muted mb-4">{error}</p>
            <button 
              className="refresh-btn d-flex align-items-center"
              onClick={() => window.location.reload()}
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
              <i className="bi bi-arrow-clockwise me-2"></i>Try Again
            </button>
          </div>
        )}

        {!loading && !error && results.length === 0 && query.trim() && (
          <div className="glass-card rounded-4 p-4 text-center py-5">
            <div className="mb-4">
              <i className="bi bi-search" style={{ fontSize: '3rem', color: '#667eea' }}></i>
            </div>
            <h3 className="fw-bold mb-3">No Results Found</h3>
            <p className="text-muted mb-4">
              We couldn't find any products matching "<strong>{query}</strong>"
            </p>
            <div className="text-start" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <p className="small text-muted mb-2">Try:</p>
              <ul className="small text-muted list-unstyled">
                <li className="mb-1">• Checking your spelling</li>
                <li className="mb-1">• Using different keywords</li>
                <li className="mb-1">• Using more general terms</li>
                <li>• Browsing our categories</li>
              </ul>
            </div>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="glass-card rounded-4 p-4">
            <div className="row g-4">
              {results.map((product) => {
                const rating = getProductRating(product);
                const isHovered = hoveredCard === product.id;
                return (
                  <div
                    key={product.id}
                    className="col-6 col-lg-3"
                    onClick={(e) => handleProductClick(product.id, e)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredCard(product.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="product-card h-100 rounded-4 overflow-hidden">
                      <div className="image-container">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                          }}
                        />
                        <span className="badge badge-modern position-absolute top-0 end-0 m-3">
                          {product.category}
                        </span>
                        {product.discount && (
                          <span className="badge badge-ai position-absolute top-0 start-0 m-3">
                            -{product.discount}%
                          </span>
                        )}
                        <button
                          className="wishlist-btn position-absolute top-0 start-0 m-3"
                          onClick={(e) => handleToggleWishlist(e, product)}
                          title={state.wishlist.some(item => String(item.id) === String(product.id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          style={{
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                          }}
                        >
                          <i className={`bi bi-heart${state.wishlist.some(item => String(item.id) === String(product.id)) ? '-fill text-danger' : ''}`}></i>
                        </button>
                      </div>
                      <div className="card-body p-3">
                        <h5 className="card-title h6 mb-2 fw-bold text-truncate" title={product.name}>
                          {product.name}
                        </h5>
                        <div className="d-flex align-items-center mb-3">
                          <div className="rating-stars me-2">
                            {[...Array(5)].map((_, i) => {
                              const ratingValue = i + 1;
                              return (
                                <i
                                  key={i}
                                  className={`bi bi-star${ratingValue <= Math.floor(rating) ? '-fill' : ratingValue - 0.5 <= rating ? '-half' : ''}`}
                                ></i>
                              );
                            })}
                          </div>
                          <span className="text-muted small">{rating.toFixed(1)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="price-container">
                            <span className="price-tag">
                              ${(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-muted text-decoration-line-through small ms-1">
                                ${(typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(product.originalPrice) || 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <button
                            className="add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            title="Add to Cart"
                            disabled={state.loading}
                            style={{
                              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                            }}
                          >
                            <i className="bi bi-cart-plus text-white"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;