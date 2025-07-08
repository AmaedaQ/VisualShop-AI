import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import visualSearchService from "../api/visualSearchService";
import { useShop } from "../context/ShopContext";

const VisualSearch = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const { state, actions } = useShop();
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setShowResults(false);
        setShowAllMatches(false);
        setError(null);
        setCurrentPage(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageSrc("");
    setShowResults(false);
    setShowAllMatches(false);
    setUploadedFile(null);
    setMatches([]);
    setError(null);
    setCurrentPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCameraClick = () => {
    alert("Camera functionality would open the device camera to take a photo.");
  };

  const navigateToProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const toggleAllMatches = () => {
    setShowAllMatches(!showAllMatches);
    setCurrentPage(1);
    if (!showAllMatches) {
      setTimeout(() => {
        const element = document.getElementById("all-matches-section");
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await actions.addToCart({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        image: product.image,
        color: product.color || '',
        quantity: 1,
        discount: product.discount || 0
      });
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
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
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

  const filterValidMatches = (products) => {
    return products.filter(product => {
      const similarity = parseFloat(product.similarity);
      return !isNaN(similarity) && similarity >= 0 && similarity <= 100;
    });
  };

  const searchWithImage = async () => {
    if (!imageSrc || !uploadedFile || isSearching) return;

    setIsSearching(true);
    setShowResults(false);
    setShowAllMatches(false);
    setError(null);
    setCurrentPage(1);

    try {
      const searchResults = await visualSearchService.findSimilarProducts(uploadedFile);

      if (searchResults.topMatches.length === 0 && searchResults.allMatches.length === 0) {
        setError("No matching products found. Try uploading a clearer image of a product.");
        setIsSearching(false);
        return;
      }

      const formatProducts = (products) => products.map((product) => ({
        ...product,
        similarityDisplay: `${Math.round(product.similarity || 0)}%`,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        image: product.image.startsWith('/')
          ? process.env.PUBLIC_URL + product.image.replace(/^\/+/, '')
          : process.env.PUBLIC_URL + '/' + product.image
      }));

      const validTopMatches = filterValidMatches(formatProducts(searchResults.topMatches));
      const validAllMatches = filterValidMatches(formatProducts(searchResults.allMatches));

      const allMatches = [...validTopMatches, ...validAllMatches.filter(m => !validTopMatches.some(tm => tm.id === m.id))];
      setMatches(allMatches);
      setTotalResults(allMatches.length);
      setShowResults(true);

      setTimeout(() => {
        const element = document.getElementById("visual-search-results");
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to analyze the image. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const getPaginatedItems = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items) => Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      const element = document.getElementById("all-matches-section");
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const Pagination = ({ items, currentPage, onPageChange }) => {
    const totalPages = getTotalPages(items);
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 3;
      if ( totalPages <= maxVisiblePages ) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 2) {
          pages.push(1, 2, 3, '...', totalPages);
        } else if (currentPage >= totalPages - 1) {
          pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', currentPage, '...', totalPages);
        }
      }
      return pages;
    };

    return (
      <nav className="d-flex justify-content-center mt-4">
        <ul className="pagination pagination-sm mb-0 shadow-sm rounded-pill" style={{ backgroundColor: 'white', padding: '0.5rem' }}>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link border-0 rounded-pill me-2"
              style={{
                background: currentPage === 1 ? '#f8f9fa' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: currentPage === 1 ? '#6c757d' : 'white',
                width: "36px",
                height: "36px",
                padding: "0",
                fontSize: "0.9rem",
                transition: 'all 0.3s ease'
              }}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              onMouseEnter={(e) => {
                if (currentPage !== 1) e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          {getPageNumbers().map((page, index) => (
            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''}`}>
              {page === '...' ? (
                <span className="page-link border-0 bg-transparent text-muted d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", fontSize: "0.75rem" }}>...</span>
              ) : (
                <button
                  className={`page-link border-0 rounded-pill mx-1 ${page === currentPage ? 'active' : ''}`}
                  style={{
                    background: page === currentPage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: page === currentPage ? 'white' : '#2c3e50',
                    width: "36px",
                    height: "36px",
                    padding: "0",
                    fontSize: "0.85rem",
                    transition: 'all 0.3s ease',
                    fontWeight: page === currentPage ? '600' : '500'
                  }}
                  onClick={() => onPageChange(page)}
                  onMouseEnter={(e) => {
                    if (page !== currentPage) e.target.style.background = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    if (page !== currentPage) e.target.style.background = 'transparent';
                  }}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link border-0 rounded-pill ms-2"
              style={{
                background: currentPage === totalPages ? '#f8f9fa' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: currentPage === totalPages ? '#6c757d' : 'white',
                width: "36px",
                height: "36px",
                padding: "0",
                fontSize: "0.9rem",
                transition: 'all 0.3s ease'
              }}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const getBadgeVariant = (similarity) => {
    const numericSimilarity = parseFloat(similarity);
    if (numericSimilarity >= 95) return { bg: 'linear-gradient(45deg, #ff70a6, #ff9770)', text: 'white', icon: 'award-fill', label: 'Perfect Match' };
    if (numericSimilarity >= 90) return { bg: 'linear-gradient(45deg, #6d4aff, #ff70a6)', text: 'white', icon: 'star-fill', label: 'Great Match' };
    if (numericSimilarity >= 80) return { bg: 'linear-gradient(45deg, #00c4cc, #6d4aff)', text: 'white', icon: 'gem', label: 'Good Match' };
    if (numericSimilarity >= 70) return { bg: 'linear-gradient(45deg, #ff9f43, #ee5253)', text: 'white', icon: 'lightning-fill', label: 'Fair Match' };
    if (numericSimilarity >= 50) return { bg: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', text: 'white', icon: 'search', label: 'Possible Match' };    return { bg: 'linear-gradient(45deg, #ff6b6b, #ee5a52)', text: 'white', icon: 'question-circle', label: 'Low Match' };
  };

  const ProductCard = ({ product }) => {
    const badgeVariant = getBadgeVariant(product.similarity);
    const isHovered = hoveredCard === product.id;
    const isInWishlist = state.wishlist.some(item => String(item.id) === String(product.id));

    return (
      <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
        <div
          className="product-card h-100 rounded-4 overflow-hidden"
          onMouseEnter={() => setHoveredCard(product.id)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: 'none',
            boxShadow: isHovered ? '0 12px 25px rgba(0, 0, 0, 0.15)' : '0 4px 6px rgba(0, 0, 0, 0.07)',
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
            minHeight: '400px'
          }}
          onClick={() => navigateToProduct(product.id)}
        >
          <div className="image-container position-relative">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image'; }}
            />
            <span
              className={`badge position-absolute top-0 end-0 m-1`}
              style={{
                background: badgeVariant.bg,
                color: badgeVariant.text,
                fontSize: '0.65rem',
                fontWeight: '600',
                padding: '0.2rem 0.5rem',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <i className={`bi bi-${badgeVariant.icon} me-1`}></i>
              {badgeVariant.label} ({product.similarityDisplay})
            </span>
            <button
              className={`image-wishlist-btn ${isInWishlist ? "btn-danger" : "btn-light"}`}
              onClick={(e) => handleToggleWishlist(e, product)}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              style={{
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                zIndex: 1,
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              }}
            >
              <i className={`bi ${isInWishlist ? "bi-heart-fill" : "bi-heart"}`}></i>
            </button>
          </div>
          <div className="card-body p-3">
            <h5 className="card-title h6 mb-2 fw-bold text-truncate">{product.name}</h5>
            <div className="d-flex justify-content-between align-items-center">
              <span
                className="price-tag"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                ${(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}
              </span>
              <button
                className="add-to-cart-btn"
                onClick={(e) => handleAddToCart(e, product)}
                disabled={state.loading}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isHovered ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
                }}
              >
                <i className="bi bi-cart-plus text-white"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="visual-search-page" className="min-vh-100 bg-light">
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .section-divider {
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          borderRadius: 2px;
          width: 60px;
          margin: 0 auto 2rem;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
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
                  <i className="bi bi-camera-reels"></i>Visual Search
                </h4>
                <p className="text-muted mb-0">AI-powered product discovery</p>
              </div>
            </div>
            <span
              className="badge badge-ai text-white px-3 py-1"
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '20px',
                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)'
              }}
            >
              <i className="bi bi-grid-3x3-gap me-1"></i>{totalResults} Results
            </span>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            {isInitializing ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Initializing...</span>
                </div>
                <h5 className="fw-bold mb-2">Initializing Visual Search</h5>
                <p className="text-muted">Loading AI models...</p>
              </div>
            ) : (
              <>
                <div className="glass-card rounded-4 mb-5 p-4">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold h1 mb-3">Upload Your Image</h2>
                    <div className="section-divider"></div>
                  </div>
                  {!imageSrc ? (
                    <div
                      className="upload-zone p-5 text-center rounded-4"
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        border: '2px dashed #e9ecef',
                        backgroundColor: '#fafbfc',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.backgroundColor = '#f0f8ff';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.backgroundColor = '#fafbfc';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.backgroundColor = '#f0f8ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.backgroundColor = '#fafbfc';
                      }}
                    >
                      <div className="mb-3">
                        <i className="bi bi-cloud-arrow-up" style={{ fontSize: '3.5rem', color: '#667eea' }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">Upload Product Image</h5>
                      <p className="text-muted mb-4 lead">Drag and drop or click to browse</p>
                      <div className="d-flex justify-content-center gap-2 mb-3">
                        <span className="badge badge-modern px-3 py-2">JPG</span>
                        <span className="badge badge-modern px-3 py-2">PNG</span>
                        <span className="badge badge-modern px-3 py-2">WEBP</span>
                      </div>
                      <small className="text-muted">Maximum file size: 5MB</small>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="position-relative d-inline-block">
                        <img
                          ref={imageRef}
                          src={imageSrc}
                          alt="Preview"
                          className="img-fluid shadow-lg rounded-4"
                          style={{ maxHeight: '300px', maxWidth: '100%' }}
                        />
                        <button
                          className="btn position-absolute top-0 end-0 m-3 rounded-circle"
                          onClick={removeImage}
                          style={{
                            background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                          }}
                          onMouseEnter={(e) => { e.target.style.transform = 'scale(1.1)'; }}
                          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="d-none"
                  />
                  {error && (
                    <div className="alert alert-danger mt-4 border-0 shadow-sm rounded-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-3 text-danger" style={{ fontSize: '1.2rem' }}></i>
                        <div>
                          <strong>Search Failed</strong>
                          <p className="mb-0 mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-top">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                      <div>
                        <h6 className="fw-bold mb-2">Quick Actions</h6>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-outline-light text-primary fw-semibold px-4 py-2 rounded-pill"
                            onClick={handleCameraClick}
                          >
                            <i className="bi bi-camera me-2"></i>Use Camera
                          </button>
                          <button
                            className="btn btn-outline-light text-primary fw-semibold px-4 py-2 rounded-pill"
                            disabled={!imageSrc}
                          >
                            <i className="bi bi-collection me-2"></i>Browse Samples
                          </button>
                        </div>
                      </div>
                      {imageSrc && (
                        <button
                          className="refresh-btn d-flex align-items-center"
                          onClick={searchWithImage}
                          disabled={isSearching}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '0.5rem 1.5rem',
                            color: 'white',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            opacity: isSearching ? 0.7 : 1,
                            cursor: isSearching ? 'not-allowed' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSearching) e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSearching) e.target.style.boxShadow = 'none';
                          }}
                        >
                          {isSearching ? (
                            <>
                              <i className="bi bi-arrow-clockwise me-2 spin"></i>Analyzing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-search me-2"></i>Find Similar Products
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {showResults && (
                  <div id="visual-search-results">
                    {matches.length > 0 && (
                      <>
                        <div className="mb-5">
                          <div className="text-center mb-4">
                            <h2 className="fw-bold h1 mb-3">Top Matches</h2>
                            <div className="section-divider"></div>
                          </div>
                          <div className="glass-card rounded-4 p-4">
                            <div className="row g-4">
                              {matches.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {matches.length > 4 && (
                          <div className="mb-5">
                            <div className="text-center mb-4">
                              <h2 className="fw-bold h1 mb-3">More Matches</h2>
                              <div className="section-divider"></div>
                            </div>
                            <div className="glass-card rounded-4 p-4">
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                                    <i className="bi bi-collection text-info" style={{ fontSize: '1.5rem' }}></i>
                                  </div>
                                  <div>
                                    <h5 className="fw-bold mb-1">Additional Matches</h5>
                                    <p className="text-muted mb-0">More products with visual similarity</p>
                                  </div>
                                </div>
                                <button
                                  onClick={toggleAllMatches}
                                  className="refresh-btn d-flex align-items-center"
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
                                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.boxShadow = 'none';
                                  }}
                                >
                                  <i className={`bi bi-chevron-${showAllMatches ? 'up' : 'down'} me-2`}></i>
                                  {showAllMatches ? 'Collapse' : 'View More'}
                                </button>
                              </div>
                              {showAllMatches && (
                                <div id="all-matches-section">
                                  <div className="row g-4">
                                    {getPaginatedItems(matches.slice(4)).map((product) => (
                                      <ProductCard key={product.id} product={product} />
                                    ))}
                                  </div>
                                  <Pagination items={matches.slice(4)} currentPage={currentPage} onPageChange={handlePageChange} />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSearch;