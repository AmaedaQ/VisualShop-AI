import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { logInteraction } from '../api/interactionService';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useShop();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState({
    price: true,
    rating: true,
    features: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const categoryMappings = {
    'electronics': ['Electronics', 'electronics', 'ELECTRONICS'],
    'fashion': ['Fashion', 'fashion', 'FASHION'],
    'home-kitchen': ['Home & Kitchen', 'Home &amp; Kitchen', 'Home and Kitchen', 'home & kitchen', 'home-kitchen', 'homekitchen', 'Home Kitchen'],
    'home-and-kitchen': ['Home & Kitchen', 'Home &amp; Kitchen', 'Home and Kitchen', 'home & kitchen', 'home-kitchen', 'homekitchen', 'Home Kitchen'],
    'homekitchen': ['Home & Kitchen', 'Home &amp; Kitchen', 'Home and Kitchen', 'home & kitchen', 'home-kitchen', 'homekitchen', 'Home Kitchen'],
    'beauty': ['Beauty', 'beauty', 'BEAUTY'],
    'toys-games': ['Toys & Games', 'Toys &amp; Games', 'Toys and Games', 'toys & games', 'toys-games', 'toysgames', 'Toys Games'],
    'toys-and-games': ['Toys & Games', 'Toys &amp; Games', 'Toys and Games', 'toys & games', 'toys-games', 'toysgames', 'Toys Games'],
    'toysgames': ['Toys & Games', 'Toys &amp; Games', 'Toys and Games', 'toys & games', 'toys-games', 'toysgames', 'Toys Games'],
    'sports': ['Sports', 'sports', 'SPORTS'],
  };

  const normalizeCategory = (category) => {
    if (!category) return '';
    return category
      .toLowerCase()
      .trim()
      .replace(/\s*&\s*/g, '-')
      .replace(/\s*and\s*/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const getDisplayName = (categorySlug) => {
    const normalizedSlug = normalizeCategory(categorySlug);
    
    for (const [key, variations] of Object.entries(categoryMappings)) {
      if (key === normalizedSlug || variations.some(v => normalizeCategory(v) === normalizedSlug)) {
        return variations[0];
      }
    }
    
    return categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isProductInCategory = (productCategory, urlCategoryName) => {
    if (!productCategory || !urlCategoryName) return false;
    
    const normalizedUrl = normalizeCategory(urlCategoryName);
    const normalizedProduct = normalizeCategory(productCategory);
    
    if (normalizedProduct === normalizedUrl) return true;
    
    for (const [key, variations] of Object.entries(categoryMappings)) {
      const normalizedVariations = variations.map(v => normalizeCategory(v));
      if (key === normalizedUrl || normalizedVariations.includes(normalizedUrl)) {
        return normalizedVariations.includes(normalizedProduct);
      }
    }
    
    return false;
  };

  const ratingOptions = [
    { value: 4, label: "4 Stars & Up" },
    { value: 3, label: "3 Stars & Up" },
    { value: 2, label: "2 Stars & Up" },
    { value: 1, label: "1 Star & Up" },
  ];

  const featureOptions = [
    { value: "free-shipping", label: "Free Shipping" },
    { value: "deal", label: "Special Deal" },
    { value: "new", label: "New Arrival" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const allProducts = await response.json();
        
        const processedProducts = allProducts.map((product) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          rating: typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating,
        }));

        const filtered = processedProducts.filter((product) => {
          return isProductInCategory(product.category, categoryName);
        });
        
        setProducts(filtered);
        setFilteredProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryName) {
      fetchProducts();
    }
    
  }, [categoryName]);

  const applyFilters = useCallback(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    let results = [...products];

    results = results.filter(
      (product) => {
        const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      }
    );

    if (selectedRatings.length > 0) {
      results = results.filter((product) => {
        const rating = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0;
        return selectedRatings.some((selectedRating) => rating >= selectedRating);
      });
    }

    switch (sortOption) {
      case "price-low":
        results.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        results.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
          return priceB - priceA;
        });
        break;
      case "rating":
        results.sort((a, b) => {
          const ratingA = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating) || 0;
          const ratingB = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        });
        break;
      case "newest":
        results.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, sortOption, priceRange, selectedRatings]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const toggleRating = (rating) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleProductClick = async (productId) => {
    await logInteraction(productId, 'view');
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await actions.addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color || '',
        quantity: 1,
        discount: product.discount || 0
      });
      await logInteraction(product.id, 'add_to_cart');
      alert(`Added ${product.name} to cart!`);
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
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const resetFilters = () => {
    setPriceRange([0, 200]);
    setSelectedRatings([]);
    setSortOption("featured");
    setCurrentPage(1);
  };

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayCategoryName = getDisplayName(categoryName);

  return (
    <div className="container py-5">
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
          border-radius: 12px;
          overflow: hidden;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
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
        .image-wishlist-btn {
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
        .image-wishlist-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        .filter-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 25px;
          padding: 0.5rem 1.5rem;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        .pagination-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .pagination-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .pagination-btn.active {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          transform: scale(1.1);
        }
        .pagination-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <button className="btn p-2 me-3 filter-btn" onClick={handleBackClick}>
            <i className="bi bi-arrow-left fs-5"></i>
          </button>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/" className="text-decoration-none">
                    <i className="bi bi-house-door-fill"></i> Home
                  </a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {displayCategoryName}
                </li>
              </ol>
            </nav>
            <h1 className="h3 fw-bold mb-0">{displayCategoryName}</h1>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <span className="me-2 text-muted small">Sort by:</span>
          <select
            className="form-select form-select-sm w-auto rounded-pill"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 mb-4 mb-lg-0">
          <div className="glass-card p-4">
            <div className="mb-4">
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => toggleFilterSection("price")}
              >
                <h3 className="h6 fw-bold mb-0">Price Range</h3>
                <i
                  className={`bi bi-chevron-${expandedFilters.price ? "up" : "down"}`}
                ></i>
              </div>
              {expandedFilters.price && (
                <>
                  <div className="mb-3">
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="200"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                    />
                    <div className="d-flex justify-content-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-grow-1 rounded-pill"
                      onClick={() => setPriceRange([0, 50])}
                    >
                      Under $50
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary flex-grow-1 rounded-pill"
                      onClick={() => setPriceRange([50, 100])}
                    >
                      $50-$100
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="mb-4">
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => toggleFilterSection("rating")}
              >
                <h3 className="h6 fw-bold mb-0">Customer Rating</h3>
                <i
                  className={`bi bi-chevron-${expandedFilters.rating ? "up" : "down"}`}
                ></i>
              </div>
              {expandedFilters.rating && (
                <div className="d-flex flex-column gap-2">
                  {ratingOptions.map((option) => (
                    <div key={option.value} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`rating-${option.value}`}
                        checked={selectedRatings.includes(option.value)}
                        onChange={() => toggleRating(option.value)}
                      />
                      <label
                        className="form-check-label d-flex align-items-center"
                        htmlFor={`rating-${option.value}`}
                      >
                        <div className="text-warning me-2">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`bi bi-star${i < option.value ? "-fill" : ""} small`}
                            ></i>
                          ))}
                        </div>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => toggleFilterSection("features")}
              >
                <h3 className="h6 fw-bold mb-0">Features</h3>
                <i
                  className={`bi bi-chevron-${expandedFilters.features ? "up" : "down"}`}
                ></i>
              </div>
              {expandedFilters.features && (
                <div className="d-flex flex-column gap-2">
                  {featureOptions.map((option) => (
                    <div key={option.value} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`feature-${option.value}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`feature-${option.value}`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn filter-btn w-100"
              onClick={resetFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <div className="col-lg-9">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading {displayCategoryName} products...</p>
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0 text-muted">
                  Showing {currentProducts.length} of {filteredProducts.length} products
                </p>
              </div>

              <div className="row g-4">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="col-6 col-lg-3"
                    onClick={() => handleProductClick(product.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="product-card h-100">
                      <div className="image-container position-relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200?text=Product+Image";
                          }}
                        />
                        <span className="badge badge-modern position-absolute top-0 end-0">
                          {product.category}
                        </span>
                        <button
                          className={`image-wishlist-btn ${state.wishlist.some(item => String(item.id) === String(product.id)) ? "btn-danger" : "btn-light"}`}
                          onClick={(e) => handleToggleWishlist(e, product)}
                          aria-label={state.wishlist.some(item => String(item.id) === String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <i className={`bi ${state.wishlist.some(item => String(item.id) === String(product.id)) ? "bi-heart-fill" : "bi-heart"}`}>
                          </i>
                        </button>
                      </div>
                      <div className="card-body p-3">
                        <h5 className="card-title h6 mb-2 fw-bold text-truncate">{product.name}</h5>
                        <div className="d-flex align-items-center mb-3">
                          <div className="rating-stars me-2">
                            {[...Array(5)].map((_, i) => {
                              const rating = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0;
                              const ratingValue = i + 1;
                              return (
                                <i
                                  key={i}
                                  className={`bi bi-star${ratingValue <= Math.floor(rating) ? "-fill" : ratingValue - 0.5 <= rating ? "-half" : ""}`}
                                ></i>
                              );
                            })}
                          </div>
                          <span className="text-muted small">
                            {(typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="price-tag">
                            ${(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}
                          </span>
                          <button
                            className="add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={state.loading}
                            title="Add to Cart"
                          >
                            <i className="bi bi-cart-plus text-white"></i>
                          </button>
                        </div>
                        {(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0) > 100 && (
                          <span className="text-success small mt-2 d-block">
                            <i className="bi bi-truck"></i> Free Shipping
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <nav aria-label="Page navigation">
                    <ul className="pagination">
                      <li className="page-item">
                        <button
                          className="pagination-btn"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li key={index + 1} className="page-item">
                          <button
                            className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => paginate(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className="page-item">
                        <button
                          className="pagination-btn"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-5 text-center">
              <div
                className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto mb-4"
                style={{ width: "80px", height: "80px" }}
              >
                <i className="bi bi-exclamation-circle fs-1 text-secondary"></i>
              </div>
              <h2 className="h4 fw-bold mb-3">No Products Found</h2>
              <p className="text-secondary mb-4">
                We couldn't find any products matching your filters in the{" "}
                {displayCategoryName} category.
              </p>
              <button
                className="btn filter-btn px-4 py-2 d-inline-flex align-items-center"
                onClick={resetFilters}
              >
                <i className="bi bi-arrow-left me-2"></i>Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;