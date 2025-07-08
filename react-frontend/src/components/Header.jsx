import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../context/AuthContext";
  
  const Header = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { state } = useShop();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeNav, setActiveNav] = useState(null);
    const [hoveredNav, setHoveredNav] = useState(null);
    const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
    const categoriesDropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollTop = useRef(0);
  
    // New search-related states
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
    const searchResultsRef = useRef(null);
    const [allProducts, setAllProducts] = useState([]);
  
    // Get real cart count from context
    const cartItemsCount = state.cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  
    const categories = [
      { name: "Electronics", icon: "bi-cpu", color: "#3a7bd5" },
      { name: "Fashion", icon: "bi-bag-heart", color: "#ff4757" },
      { name: "Home & Kitchen", icon: "bi-house-heart", color: "#20bf6b" },
      { name: "Beauty", icon: "bi-brush", color: "#8e44ad" },
      { name: "Toys & Games", icon: "bi-joystick", color: "#f39c12" },
      { name: "Sports", icon: "bi-bicycle", color: "#16a085" },
    ];
  
    // Fetch all products on component mount for search functionality
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/products');
          if (response.ok) {
            const products = await response.json();
            setAllProducts(products);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };
  
      fetchProducts();
    }, []);
  
    // Search functionality
    useEffect(() => {
      const searchProducts = async () => {
        if (searchQuery.trim().length < 2) {
          setSearchResults([]);
          setShowSearchResults(false);
          setIsSearching(false);
          return;
        }
  
        setIsSearching(true);
        
        // Simulate a small delay for better UX
        const searchTimeout = setTimeout(() => {
          const filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 8); // Limit to 8 results
  
          setSearchResults(filteredProducts);
          setShowSearchResults(true);
          setIsSearching(false);
          setSelectedSearchIndex(-1);
        }, 300);
  
        return () => clearTimeout(searchTimeout);
      };
  
      searchProducts();
    }, [searchQuery, allProducts]);
  
    // Handle keyboard navigation in search results
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (!showSearchResults || searchResults.length === 0) return;
  
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedSearchIndex(prev => 
              prev < searchResults.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedSearchIndex(prev => prev > 0 ? prev - 1 : prev);
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedSearchIndex >= 0) {
              handleProductClick(searchResults[selectedSearchIndex]);
            } else if (searchQuery.trim()) {
              handleSearchSubmit(e);
            }
            break;
          case 'Escape':
            setShowSearchResults(false);
            setSelectedSearchIndex(-1);
            searchInputRef.current?.blur();
            break;
        }
      };
  
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showSearchResults, searchResults, selectedSearchIndex, searchQuery]);
  
    // Handle scroll effects
    useEffect(() => {
      const handleScroll = () => {
        const currentScrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
  
        // Detect scroll direction
        if (currentScrollTop > lastScrollTop.current + 10) {
          // Scrolling down - hide header
          setIsHeaderVisible(false);
        } else if (currentScrollTop < lastScrollTop.current - 5) {
          // Scrolling up - show header
          setIsHeaderVisible(true);
        }
  
        // Set scrolled state for glass effect
        setScrolled(currentScrollTop > 20);
  
        lastScrollTop.current = currentScrollTop <= 0 ? 0 : currentScrollTop;
      };
  
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
  
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          categoriesDropdownRef.current &&
          !categoriesDropdownRef.current.contains(event.target)
        ) {
          setShowCategoriesDropdown(false);
        }
  
        // Close search results when clicking outside
        if (
          searchResultsRef.current &&
          !searchResultsRef.current.contains(event.target) &&
          !searchInputRef.current?.contains(event.target)
        ) {
          setShowSearchResults(false);
          setSelectedSearchIndex(-1);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    // Handle escape key to close dropdown
    useEffect(() => {
      const handleEscKey = (event) => {
        if (event.key === "Escape") {
          setShowCategoriesDropdown(false);
          setShowSearchResults(false);
          setSelectedSearchIndex(-1);
          if (searchFocused) {
            searchInputRef.current?.blur();
            setSearchFocused(false);
          }
        }
      };
  
      document.addEventListener("keydown", handleEscKey);
      return () => {
        document.removeEventListener("keydown", handleEscKey);
      };
    }, [searchFocused]);
  
    const formatCategorySlug = (name) => {
      return name.toLowerCase().replace(/\s+/g, "-").replace("&-", "-");
    };
  
    const handleNavigation = (page, category = null) => {
      if (page === "category" && category) {
        const formattedCategory = formatCategorySlug(category);
        setActiveNav(formattedCategory);
        navigate(`/category/${formattedCategory}`);
        setShowCategoriesDropdown(false);
        return;
      }
  
      setActiveNav(category || page);
  
      switch (page) {
        case "home":
          navigate("/");
          break;
        case "visual-search":
          navigate("/visual-search");
          break;
        case "cart":
          navigate("/cart");
          break;
        case "profile":
          navigate("/profile");
          break;
        case "seller-dashboard":
          navigate("/seller-dashboard");
          break;
        default:
          navigate("/");
      }
    };
  
    const handleSearchSubmit = (e) => {
      e.preventDefault?.(); // Safely call preventDefault if it's a real event
    
      if (searchQuery.trim()) {
        // Animate search bar
        setIsSearchExpanded(true);
        setTimeout(() => setIsSearchExpanded(false), 300);
    
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    
        // Close dropdown
        setShowSearchResults(false);
        setSelectedSearchIndex(-1);
    
        // Optional: Add pulse effect only if called via form submit
        const searchButton = e?.currentTarget?.querySelector?.("button[type='submit']");
        if (searchButton) {
          searchButton.classList.add("btn-pulse");
          setTimeout(() => searchButton.classList.remove("btn-pulse"), 500);
        }
      }
    };
      
    const handleProductClick = (product) => {
      // Navigate to product detail page
      navigate(`/product/${product.id}`);
      
      // Close search results and clear search
      setShowSearchResults(false);
      setSearchQuery("");
      setSelectedSearchIndex(-1);
      searchInputRef.current?.blur();
    };
  
    const handleSearchInputChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const handleSearchFocus = () => {
      setSearchFocused(true);
      if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
        setShowSearchResults(true);
      }
    };
  
    const handleSearchBlur = () => {
      // Delay hiding results to allow for click events
      setTimeout(() => {
        setSearchFocused(false);
      }, 150);
    };
  
    const toggleCategoriesDropdown = () => {
      setShowCategoriesDropdown(!showCategoriesDropdown);
    };
  
    const highlightSearchTerm = (text, term) => {
      if (!term) return text;
      const regex = new RegExp(`(${term})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, index) => 
        regex.test(part) ? 
          <span key={index} style={{ backgroundColor: '#ffeb3b', color: '#333', padding: '1px 2px', borderRadius: '2px' }}>
            {part}
          </span> : part
      );
    };
  
    return (
      <header
        className={`sticky-top ${scrolled ? "scrolled" : ""} ${
          isHeaderVisible ? "header-visible" : "header-hidden"
        }`}
      >
        {/* Main Navigation Bar */}
        <nav
          className="navbar navbar-expand-lg px-3 px-lg-4"
          style={{
            backgroundColor: scrolled
              ? "rgba(255, 255, 255, 0.92)"
              : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(12px)",
            boxShadow: scrolled
              ? "0 4px 20px rgba(58, 123, 213, 0.15), 0 2px 0 rgba(58, 123, 213, 0.1)"
              : "0 2px 15px rgba(58, 123, 213, 0.08)",
            borderBottom: "2px solid rgba(58, 123, 213, 0.15)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            height: scrolled ? "75px" : "85px",
          }}
        >
          <div className="container-fluid">
            {/* Logo */}
            <button
              className="navbar-brand p-0 border-0 bg-transparent"
              onClick={() => handleNavigation("home")}
              aria-label="Home"
              style={{
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
              }}
              onMouseEnter={() => setHoveredNav("logo")}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <div className="logo-container">
                <img
                  src="/assets/images/logo-copy.png"
                  alt="Intelli Logo"
                  className="img-fluid logo-image"
                  style={{
                    height: scrolled ? "36px" : "42px",
                    width: "auto",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: hoveredNav === "logo" ? "scale(1.1)" : "scale(1)",
                    filter:
                      hoveredNav === "logo"
                        ? "drop-shadow(0 4px 8px rgba(58, 123, 213, 0.3))"
                        : "drop-shadow(0 2px 4px rgba(58, 123, 213, 0.1))",
                  }}
                />
                {hoveredNav === "logo" && <div className="logo-glow" />}
              </div>
            </button>
  
            {/* Mobile Menu Toggle */}
            <button
              className="navbar-toggler border-0 px-2 py-1"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-label="Toggle navigation"
              style={{
                borderRadius: "10px",
                transition: "all 0.3s ease",
                backgroundColor:
                  hoveredNav === "menu"
                    ? "rgba(58, 123, 213, 0.15)"
                    : "rgba(58, 123, 213, 0.05)",
                border: "1px solid rgba(58, 123, 213, 0.1)",
                padding: "6px 8px",
              }}
              onMouseEnter={() => setHoveredNav("menu")}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
  
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              {/* Enhanced Search Bar */}
              <div className="position-relative mx-auto my-2 my-lg-0" style={{ maxWidth: "520px", width: "100%" }}>
                <form
                  className={`d-flex ${
                    searchFocused ? "flex-grow-1" : ""
                  } ${isSearchExpanded ? "search-expanded" : ""}`}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onSubmit={handleSearchSubmit}
                >
                  <div
                    className="input-group search-container"
                    style={{
                      borderRadius: "12px",
                      boxShadow: searchFocused
                        ? "0 6px 24px rgba(58, 123, 213, 0.25), 0 0 0 2px rgba(58, 123, 213, 0.1)"
                        : "0 2px 12px rgba(58, 123, 213, 0.08)",
                      overflow: "hidden",
                      border: searchFocused
                        ? "1px solid rgba(58, 123, 213, 0.3)"
                        : "1px solid rgba(58, 123, 213, 0.08)",
                    }}
                  >
                    <span
                      className="input-group-text border-0 bg-transparent ps-3"
                      style={{ color: searchFocused ? "#3a7bd5" : "#999" }}
                    >
                      {isSearching ? (
                        <div className="spinner-border spinner-border-sm" role="status" style={{ width: "16px", height: "16px" }}>
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <i className="bi bi-search"></i>
                      )}
                    </span>
                    <input
                      ref={searchInputRef}
                      type="search"
                      className="form-control border-0 ps-2"
                      placeholder="Search products, brands..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      aria-label="Search"
                      autoComplete="off"
                      style={{
                        height: "46px",
                        backgroundColor: "rgba(252, 252, 252, 0.95)",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                    />
                    <button
                      className="btn border-0 px-3 search-button"
                      type="submit"
                      disabled={!searchQuery.trim()}
                      style={{
                        background: searchQuery.trim()
                          ? "linear-gradient(135deg, #3a7bd5, #00d2ff)"
                          : "rgba(58, 123, 213, 0.1)",
                        color: searchQuery.trim()
                          ? "white"
                          : "rgba(58, 123, 213, 0.5)",
                        fontWeight: 500,
                        minWidth: "85px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {searchFocused ? "Search" : <i className="bi bi-search"></i>}
                    </button>
                  </div>
                </form>
  
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div
                    ref={searchResultsRef}
                    className="position-absolute w-100 mt-1 search-results-dropdown"
                    style={{
                      zIndex: 1050,
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(58, 123, 213, 0.2), 0 0 0 1px rgba(58, 123, 213, 0.05)",
                      overflow: "hidden",
                      backgroundColor: "white",
                      border: "1px solid rgba(58, 123, 213, 0.08)",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <div className="py-2">
                      {searchResults.map((product, index) => (
                        <button
                          key={product.id}
                          className="dropdown-item d-flex align-items-center px-3 py-2 search-result-item"
                          onClick={() => handleProductClick(product)}
                          style={{
                            backgroundColor: selectedSearchIndex === index
                              ? "rgba(58, 123, 213, 0.08)"
                              : "transparent",
                            color: "#444",
                            transition: "all 0.2s ease",
                            border: "none",
                            width: "100%",
                            textAlign: "left",
                          }}
                          onMouseEnter={() => setSelectedSearchIndex(index)}
                        >
                          <div
                            className="product-image me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "6px",
                              overflow: "hidden",
                              backgroundColor: "#f8f9fa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div
                              style={{
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#e9ecef',
                                color: '#6c757d',
                                fontSize: '12px',
                              }}
                            >
                              <i className="bi bi-image"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <div
                              className="product-name"
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: "500",
                                marginBottom: "2px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {highlightSearchTerm(product.name, searchQuery)}
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <span
                                className="product-category"
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#6c757d",
                                  backgroundColor: "rgba(58, 123, 213, 0.1)",
                                  padding: "2px 6px",
                                  borderRadius: "10px",
                                }}
                              >
                                {product.category}
                              </span>
                              <span
                                className="product-price"
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#3a7bd5",
                                }}
                              >
                                ${product.price}
                              </span>
                            </div>
                          </div>
                          <i
                            className="bi bi-arrow-right ms-2"
                            style={{
                              fontSize: "0.8rem",
                              opacity: 0.6,
                              transition: "transform 0.3s ease, opacity 0.3s ease",
                              transform: selectedSearchIndex === index ? "translateX(4px)" : "translateX(0)",
                            }}
                          ></i>
                        </button>
                      ))}
                      
                      {searchQuery.trim() && (
                        <div className="border-top mx-3 mt-2 pt-2">
                          <button
                            className="btn btn-sm btn-outline-primary w-100"
                            onClick={() => handleSearchSubmit({ preventDefault: () => {} })}
                            style={{
                              borderRadius: "8px",
                              fontSize: "0.85rem",
                              fontWeight: "500",
                            }}
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
  
                {/* No Results Message */}
                {showSearchResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                  <div
                    ref={searchResultsRef}
                    className="position-absolute w-100 mt-1"
                    style={{
                      zIndex: 1050,
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(58, 123, 213, 0.2)",
                      backgroundColor: "white",
                      border: "1px solid rgba(58, 123, 213, 0.08)",
                      padding: "20px",
                      textAlign: "center",
                    }}
                  >
                    <i className="bi bi-search" style={{ fontSize: "2rem", color: "#ccc", marginBottom: "10px" }}></i>
                    <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                      No products found for "<strong>{searchQuery}</strong>"
                    </p>
                  </div>
                )}
              </div>
  
              <ul
                className="navbar-nav ms-auto mb-2 mb-lg-0"
                style={{ gap: "6px" }}
              >
                {/* Categories Dropdown */}
                <li
                  className="nav-item position-relative"
                  ref={categoriesDropdownRef}
                >
                  <button
                    className="nav-link position-relative p-2 border-0 d-flex align-items-center"
                    onClick={toggleCategoriesDropdown}
                    aria-label="Explore by Categories"
                    onMouseEnter={() => setHoveredNav("categories")}
                    onMouseLeave={() => setHoveredNav(null)}
                    style={{
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                      backgroundColor: showCategoriesDropdown
                        ? "rgba(58, 123, 213, 0.15)"
                        : hoveredNav === "categories"
                        ? "rgba(58, 123, 213, 0.08)"
                        : "transparent",
                      color: showCategoriesDropdown
                        ? "#3a7bd5"
                        : hoveredNav === "categories"
                        ? "#3a7bd5"
                        : "#444",
                      padding: "8px 12px",
                      border: showCategoriesDropdown
                        ? "1px solid rgba(58, 123, 213, 0.2)"
                        : "1px solid transparent",
                      boxShadow: showCategoriesDropdown
                        ? "0 4px 12px rgba(58, 123, 213, 0.12)"
                        : "none",
                    }}
                  >
                    <i
                      className="bi bi-grid"
                      style={{
                        fontSize: "1.05rem",
                        transition: "all 0.2s ease",
                        transform: showCategoriesDropdown
                          ? "rotate(-10deg)"
                          : "rotate(0deg)",
                      }}
                    ></i>
                    <span
                      className="ms-2 d-none d-lg-inline"
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      Explore Categories
                    </span>
                    <i
                      className={`bi ${
                        showCategoriesDropdown
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      } ms-1`}
                      style={{
                        fontSize: "0.8rem",
                        transition: "transform 0.3s ease",
                        transform: showCategoriesDropdown
                          ? "translateY(-2px)"
                          : "translateY(2px)",
                      }}
                    ></i>
                  </button>
  
                  {/* Categories Dropdown Menu */}
                  {showCategoriesDropdown && (
                    <div
                      className="position-absolute mt-1 categories-dropdown"
                      style={{
                        width: "260px",
                        zIndex: 1000,
                        borderRadius: "16px",
                        boxShadow:
                          "0 10px 40px rgba(58, 123, 213, 0.2), 0 0 0 1px rgba(58, 123, 213, 0.05)",
                        overflow: "hidden",
                        backgroundColor: "white",
                        border: "1px solid rgba(58, 123, 213, 0.08)",
                      }}
                    >
                      <div className="py-2">
                        {categories.map(({ name, icon, color }, index) => {
                          const categorySlug = formatCategorySlug(name);
                          const isActive = activeNav === categorySlug;
                          return (
                            <button
                              key={categorySlug}
                              className="dropdown-item d-flex align-items-center px-3 py-2 category-item"
                              onClick={() => handleNavigation("category", name)}
                              style={{
                                backgroundColor: isActive
                                  ? "rgba(58, 123, 213, 0.08)"
                                  : "transparent",
                                color: isActive ? "#3a7bd5" : "#444",
                                transition: "all 0.2s ease",
                                animation: `fadeInItem 0.3s ease forwards ${
                                  index * 0.05
                                }s`,
                                opacity: 0,
                                transform: "translateY(10px)",
                              }}
                            >
                              <div
                                className="category-icon-container me-3 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  backgroundColor: `${color}10`,
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <i
                                  className={`bi ${icon}`}
                                  style={{
                                    fontSize: "1rem",
                                    color: color,
                                    transition: "all 0.3s ease",
                                  }}
                                ></i>
                              </div>
                              <span
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: isActive ? "500" : "400",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {name}
                              </span>
                              <i
                                className="bi bi-chevron-right ms-auto"
                                style={{
                                  fontSize: "0.8rem",
                                  opacity: 0.6,
                                  transition: "transform 0.3s ease",
                                }}
                              ></i>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </li>
  
                <NavButton
                  icon="bi-camera"
                  label="Visual Search"
                  active={activeNav === "visual-search"}
                  onClick={() => handleNavigation("visual-search")}
                  hoveredNav={hoveredNav}
                  setHoveredNav={setHoveredNav}
                  id="visual-search"
                />
  
                <NavButton
                  icon="bi-cart3"
                  label="Cart"
                  active={activeNav === "cart"}
                  onClick={() => handleNavigation("cart")}
                  badge={cartItemsCount}
                  hoveredNav={hoveredNav}
                  setHoveredNav={setHoveredNav}
                  id="cart"
                />
  
  {isAuthenticated ? (
  <>
    <NavButton
      icon="bi-person"
      label="Profile"
      active={activeNav === "profile"}
      onClick={() => handleNavigation("profile")}
      hoveredNav={hoveredNav}
      setHoveredNav={setHoveredNav}
      id="profile"
    />

    {user?.role === "seller" && (
      <NavButton
        icon="bi-shop"
        label="Seller Dashboard"
        active={activeNav === "seller-dashboard"}
        onClick={() => handleNavigation("seller-dashboard")}
        hoveredNav={hoveredNav}
        setHoveredNav={setHoveredNav}
        id="seller-dashboard"
      />
    )}

    <NavButton
      icon="bi-box-arrow-right"
      label="Logout"
      active={activeNav === "logout"}
      onClick={() => {
        logout();
        setActiveNav(null);
      }}
      hoveredNav={hoveredNav}
      setHoveredNav={setHoveredNav}
      id="logout"
    />
  </>
) : (
  <NavButton
    icon="bi-box-arrow-in-right"
    label="Login"
    active={activeNav === "login"}
    onClick={() => {
      navigate("/login");
      setActiveNav("login");
    }}
    hoveredNav={hoveredNav}
    setHoveredNav={setHoveredNav}
    id="login"
  />
)}            </ul>
          </div>
        </div>
      </nav>

      {/* Added CSS for enhanced animations and effects */}
      <style jsx>{`
        /* Header visibility animations */
        .header-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .header-hidden {
          transform: translateY(-100%);
          opacity: 0.95;
        }

        header {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.4s ease;
        }

        /* Logo effects */
        .logo-container {
          position: relative;
          display: inline-block;
        }

        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(58, 123, 213, 0.2) 0%,
            rgba(0, 210, 255, 0) 70%
          );
          border-radius: 50%;
          z-index: -1;
          animation: pulse 2s infinite ease-in-out;
        }

        /* Search bar animations */
        .search-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-expanded {
          transform: scale(1.02);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .btn-pulse {
          animation: btnPulse 0.5s cubic-bezier(0.4, 0, 0.6, 1);
        }

        /* Category dropdown animations */
        .categories-dropdown {
          animation: dropdownFadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .category-item:hover {
          background-color: rgba(58, 123, 213, 0.05) !important;
          padding-left: 16px !important;
        }

        .category-item:hover .category-icon-container {
          transform: scale(1.1);
        }

        .category-item:hover i.bi-chevron-right {
          transform: translateX(4px);
          opacity: 1;
        }

        /* Keyframe Animations */
        @keyframes pulse {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.95);
          }
          50% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1.15);
          }
          100% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.95);
          }
        }

        @keyframes btnPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeInItem {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Nav button hover effects */
        .nav-link:hover i {
          transform: translateY(-2px);
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .categories-dropdown {
            width: 240px !important;
          }
        }
      `}</style>
    </header>
  );
};

// Enhanced NavButton component with improved animations
const NavButton = ({
  icon,
  label,
  onClick,
  badge,
  hoveredNav,
  setHoveredNav,
  id,
  active,
}) => (
  <li className="nav-item">
    <button
      className="nav-link position-relative p-2 border-0 d-flex align-items-center"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHoveredNav(id)}
      onMouseLeave={() => setHoveredNav(null)}
      style={{
        borderRadius: "10px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: active
          ? "rgba(58, 123, 213, 0.15)"
          : hoveredNav === id
          ? "rgba(58, 123, 213, 0.08)"
          : "transparent",
        color: active ? "#3a7bd5" : hoveredNav === id ? "#3a7bd5" : "#444",
        padding: "8px 12px",
        border: active
          ? "1px solid rgba(58, 123, 213, 0.2)"
          : "1px solid transparent",
        boxShadow: active
          ? "0 4px 12px rgba(58, 123, 213, 0.12)"
          : hoveredNav === id
          ? "0 2px 8px rgba(58, 123, 213, 0.08)"
          : "none",
        transform: hoveredNav === id ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <i
        className={`bi ${icon}`}
        style={{
          fontSize: "1.05rem",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hoveredNav === id ? "scale(1.1)" : "scale(1)",
        }}
      ></i>
      <span
        className="ms-2 d-none d-lg-inline"
        style={{
          fontSize: "0.9rem",
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
      >
        {label}
      </span>
      {badge > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-wiggle"
          style={{
            backgroundColor: "#ff4757",
            color: "white",
            fontSize: "0.65rem",
            padding: "4px 6px",
            minWidth: "20px",
            boxShadow: "0 2px 6px rgba(255, 71, 87, 0.4)",
            border: "1.5px solid white",
            animation:
              badge > 1 ? "badgeWiggle 1.5s ease-in-out infinite" : "none",
          }}
        >
          {badge}
          <style jsx>{`
            @keyframes badgeWiggle {
              0%,
              100% {
                transform: scale(1);
              }
              10% {
                transform: scale(1.1) rotate(5deg);
              }
              20% {
                transform: scale(1.1) rotate(-5deg);
              }
              30% {
                transform: scale(1.1) rotate(3deg);
              }
              40% {
                transform: scale(1) rotate(0);
              }
            }
            .badge-wiggle {
              transform-origin: center center;
            }
          `}</style>
        </span>
      )}
    </button>
  </li>
);

export default Header;
