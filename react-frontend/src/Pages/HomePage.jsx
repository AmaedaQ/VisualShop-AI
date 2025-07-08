import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { logInteraction } from '../api/interactionService';
import { fetchHomepageRecommendations, trackInteraction, getRecommendationTypeText } from '../api/recommendationService';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendationType, setRecommendationType] = useState('trending');
  const [recommendationStatus, setRecommendationStatus] = useState('loading'); // loading, success, error
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to get random products (fallback for categories display)
  const getRandomProducts = (products, count) => {
    if (!products || products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Navigation handler
  const navigateTo = (page, id = null) => {
    console.log(`Navigating to ${page}`, id ? `ID: ${id}` : "");
  };

  // Handle product click
  const handleProductClick = async (productId, e) => {
    if (!e.target.closest("button")) {
      // Track interaction using both services for consistency
      try {
        await Promise.all([
          logInteraction(productId, 'view'), // existing service
          trackInteraction(productId, 'view') // new recommendation service
        ]);
      } catch (error) {
        console.error('Error tracking interaction:', error);
      }
      navigate(`/product/${productId}`);
    }
  };

  const handleVisualSearchClick = () => {
    navigate("/visual-search");
  };

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, "-").replace("&", "and");
    navigate(`/category/${slug}`);
  };

  // Handle add to cart click
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    console.log("Add to cart", product.id);
    
    // Track add to cart interaction
    try {
      await trackInteraction(product.id, 'add_to_cart');
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }
  };

  // Load homepage recommendations
  const loadRecommendations = async () => {
    try {
      setRecommendationStatus('loading');
      console.log('🔄 Loading homepage recommendations...');
      
      const recommendationsData = await fetchHomepageRecommendations();
      
      if (recommendationsData && recommendationsData.items && recommendationsData.items.length > 0) {
        setRecommendedProducts(recommendationsData.items);
        setRecommendationType(recommendationsData.type);
        setRecommendationStatus('success');
        console.log(`✅ Loaded ${recommendationsData.items.length} ${recommendationsData.type} recommendations`);
      } else {
        // Fallback to random products if no recommendations
        console.log('⚠️ No recommendations available, using fallback');
        setRecommendedProducts(getRandomProducts(products, 4));
        setRecommendationType('fallback');
        setRecommendationStatus('success');
      }
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      setRecommendationStatus('error');
      // Fallback to random products on error
      if (products.length > 0) {
        setRecommendedProducts(getRandomProducts(products, 4));
        setRecommendationType('fallback');
      }
    }
  };

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productsResponse = await fetch(
          "http://localhost:5000/api/products"
        );
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsResponse.json();

        // Convert string numbers to actual numbers
        const processedProducts = productsData.map((product) => ({
          ...product,
          price: parseFloat(product.price),
          rating: parseFloat(product.rating),
        }));

        setProducts(processedProducts);

        // Updated mock categories with the new images and counts
        const mockCategories = [
          {
            id: 1,
            name: "Electronics",
            image:
              "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=compress&cs=tinysrgb&w=600",
            count: processedProducts.filter((p) => p.category === "Electronics")
              .length,
          },
          {
            id: 2,
            name: "Fashion",
            image:
              "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=compress&cs=tinysrgb&w=600",
            count: processedProducts.filter((p) => p.category === "Fashion")
              .length,
          },
          {
            id: 3,
            name: "Home & Kitchen",
            image:
              "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=compress&cs=tinysrgb&w=600",
            count: processedProducts.filter(
              (p) => p.category === "Home & Kitchen"
            ).length,
          },
          {
            id: 4,
            name: "Beauty",
            image:
              "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=compress&cs=tinysrgb&w=600",
            count: processedProducts.filter((p) => p.category === "Beauty")
              .length,
          },
          {
            id: 5,
            name: "Toys & Games",
            image:
              "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=compress&cs=tinysrgb&w=600",
            count: processedProducts.filter(
              (p) => p.category === "Toys & Games"
            ).length,
          },
          {
            id: 6,
            name: "Sports",
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=compress&cs=tinysrgb&w=600",
            count: processedProducts.filter((p) => p.category === "Sports")
              .length,
          },
        ];
        setCategories(mockCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load recommendations when products are loaded or component mounts
  useEffect(() => {
    loadRecommendations();
  }, []); // Load recommendations immediately, not dependent on products

  // Fallback to random products if recommendations fail and products are available
  useEffect(() => {
    if (products.length > 0 && recommendedProducts.length === 0 && recommendationStatus === 'error') {
      setRecommendedProducts(getRandomProducts(products, 4));
      setRecommendationType('fallback');
      setRecommendationStatus('success');
    }
  }, [products, recommendedProducts.length, recommendationStatus]);

  return (
    <div id="home-page">
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
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
        
        .category-card {
          transition: all 0.3s ease;
          overflow: hidden;
          border-radius: 12px;
        }
        
        .category-card:hover {
          transform: scale(1.02);
        }
        
        .feature-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin: 0 auto 1rem;
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
          color: white;
        }
        
        .section-divider {
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          width: 60px;
          margin: 0 auto 2rem;
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
          background-clip: text;
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
      `}</style>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-5">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h1 className="display-4 fw-bold mb-4">
                Shopping Made Smarter with AI
              </h1>
              <p className="lead mb-4 opacity-90">
                Discover products tailored to your preferences with our
                AI-powered recommendations
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <button
                  className="btn btn-light text-primary fw-semibold px-4 py-3 rounded-pill shadow"
                  onClick={() => {
                    const recommendationsSection = document.querySelector('.recommended-for-you');
                    if (recommendationsSection) {
                      recommendationsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <i className="bi bi-bag-check me-2"></i>Shop Now
                </button>
                <button
                  className="btn btn-outline-light fw-semibold px-4 py-3 rounded-pill"
                  onClick={handleVisualSearchClick}
                >
                  <i className="bi bi-camera me-2"></i>Try Visual Search
                </button>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="/assets/images/main-image.png"
                alt="AI Shopping Experience"
                className="img-fluid rounded-4 shadow-lg"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold h1 mb-3">Intelligent Shopping Features</h2>
            <div className="section-divider"></div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="glass-card h-100 text-center p-4 rounded-4">
                <div className="feature-icon">
                  <i className="bi bi-robot"></i>
                </div>
                <h3 className="h5 fw-bold mb-3">
                  Personalized Recommendations
                </h3>
                <p className="text-muted">
                  Our AI analyzes your preferences and browsing history to
                  suggest products you'll love
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card h-100 text-center p-4 rounded-4">
                <div className="feature-icon">
                  <i className="bi bi-camera"></i>
                </div>
                <h3 className="h5 fw-bold mb-3">Visual Search</h3>
                <p className="text-muted">
                  Upload an image to find similar products instantly using our
                  computer vision technology
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card h-100 text-center p-4 rounded-4">
                <div className="feature-icon">
                  <i className="bi bi-chat-dots"></i>
                </div>
                <h3 className="h5 fw-bold mb-3">AI Chatbot Support</h3>
                <p className="text-muted">
                  Get instant help with our 24/7 AI assistant for product
                  inquiries and order tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Search Banner */}
      <section className="py-5 hero-gradient text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h2 className="h2 fw-bold mb-3">
                Find Products with Visual Search
              </h2>
              <p className="lead mb-4 opacity-90">
                Take a photo or upload an image to instantly find similar
                products in our catalog
              </p>
              <button
                className="btn btn-light text-primary fw-semibold px-4 py-3 rounded-pill shadow"
                onClick={handleVisualSearchClick}
              >
                <i className="bi bi-camera me-2"></i>Try Visual Search
              </button>
            </div>
            <div className="col-md-6 text-center">
              <div className="position-relative d-inline-block">
                <img
                  src="/assets/viusal-search.png"
                  alt="Visual Search Demo"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '300px',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
                <div className="position-absolute top-0 end-0 translate-middle bg-warning text-primary p-3 rounded-circle shadow-lg">
                  <i className="bi bi-camera fs-5"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products Section */}
      <section className="py-5 bg-white recommended-for-you">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h2 fw-bold mb-2">{getRecommendationTypeText(recommendationType)}</h2>
              {recommendationType === 'personalized' && (
                <small className="text-muted d-flex align-items-center">
                  <i className="bi bi-person-check me-2 text-success"></i>
                  Based on your browsing history
                </small>
              )}
              {recommendationType === 'trending' && (
                <small className="text-muted d-flex align-items-center">
                  <i className="bi bi-fire me-2 text-danger"></i>
                  Popular this week
                </small>
              )}
            </div>
            <button
              className="refresh-btn d-flex align-items-center"
              onClick={() => {
                setRecommendationStatus('loading');
                loadRecommendations();
              }}
              disabled={recommendationStatus === 'loading'}
              style={{
                opacity: recommendationStatus === 'loading' ? 0.7 : 1,
                cursor: recommendationStatus === 'loading' ? 'not-allowed' : 'pointer'
              }}
            >
              <i className={`bi bi-arrow-clockwise me-2 ${recommendationStatus === 'loading' ? 'spin' : ''}`}></i>
              {recommendationStatus === 'loading' ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {recommendationStatus === 'loading' ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading recommendations...</span>
              </div>
              <p className="text-muted fs-5">Loading personalized recommendations...</p>
            </div>
          ) : recommendationStatus === 'error' && recommendedProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="bi bi-exclamation-triangle display-4 text-warning mb-3 d-block"></i>
                <h4>Unable to load recommendations</h4>
                <p className="mb-3">Please try again in a moment</p>
                <button 
                  className="refresh-btn"
                  onClick={() => loadRecommendations()}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {recommendedProducts.slice(0, 4).map((product) => (
                <div
                  key={product.product_id || product.id}
                  className="col-6 col-lg-3"
                  onClick={(e) => handleProductClick(product.product_id || product.id, e)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-card h-100 rounded-4 overflow-hidden">
                    <div className="image-container position-relative">
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
                      {product.reason && (
                        <span className="badge badge-ai position-absolute top-0 start-0 m-3">
                          <i className="bi bi-stars me-1"></i>
                          AI Pick
                        </span>
                      )}
                    </div>
                    <div className="card-body p-3">
                      <h5 className="card-title h6 mb-2 fw-bold">{product.name}</h5>
                      {product.reason && (
                        <p className="small text-muted mb-3" title={product.reason}>
                          <i className="bi bi-lightbulb me-1 text-warning"></i>
                          {product.reason.length > 45 ? product.reason.substring(0, 45) + '...' : product.reason}
                        </p>
                      )}
                      <div className="d-flex align-items-center mb-3">
                        <div className="rating-stars me-2">
                          {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;
                            const rating = product.rating || 4.0;
                            return (
                              <i
                                key={i}
                                className={`bi bi-star${
                                  ratingValue <= Math.floor(rating)
                                    ? "-fill"
                                    : ratingValue - 0.5 <= rating
                                    ? "-half"
                                    : ""
                                }`}
                              ></i>
                            );
                          })}
                        </div>
                        <span className="text-muted small">
                          {(product.rating || 4.0).toFixed(1)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="price-tag">
                          ${(product.price || 0).toFixed(2)}
                        </span>
                        <button
                          className="add-to-cart-btn"
                          onClick={(e) => handleAddToCart(e, product)}
                          title="Add to Cart"
                        >
                          <i className="bi bi-cart-plus text-white"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold h1 mb-3">Shop By Category</h2>
            <div className="section-divider"></div>
          </div>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted fs-5">Loading categories...</p>
            </div>
          ) : (
            <div className="row g-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="col-6 col-md-4 col-lg-2"
                  onClick={() => handleCategoryClick(category.name)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="category-card position-relative overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-100"
                      style={{ height: "140px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x140?text=' + category.name;
                      }}
                    />
                    <div className="position-absolute bottom-0 start-0 end-0 p-3 text-white" 
                         style={{background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'}}>
                      <h5 className="fw-bold mb-1 h6">{category.name}</h5>
                      <p className="small mb-0 opacity-90">
                        {category.count} products
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;