import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Carousel from "react-bootstrap/Carousel";
import { logInteraction } from "../api/interactionService";
import { fetchProductRecommendations } from "../api/recommendationService";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useShop();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: "",
    rating: 0,
    comment: "",
  });
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const discountedPrice = useMemo(() => {
    return product
      ? parseFloat(product.price) * (1 - (product.discount || 0) / 100)
      : 0;
  }, [product]);

  const isWishlisted = useMemo(
    () => state.wishlist.some((item) => String(item.id) === String(product?.id)),
    [state.wishlist, product]
  );

  useEffect(() => {
    const fetchProductAndRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = parseInt(productId, 10);
        if (isNaN(id)) throw new Error("Invalid product ID");

        const productResponse = await fetch(
          `http://localhost:5000/api/product-details/${id}`
        );
        if (!productResponse.ok) {
          throw new Error("Failed to fetch product");
        }
        const productData = await productResponse.json();

        const processedProduct = {
          ...productData,
          price: parseFloat(productData.price),
          rating: parseFloat(productData.rating),
          reviewCount: productData.review_count,
          images: productData.images || [],
          colors: productData.colors || [],
          features: productData.features || [],
          specifications: productData.specifications || {},
          relatedProducts: productData.relatedProducts || [],
          reviewsData: {
            averageRating: parseFloat(productData.reviewsData?.averageRating) || 0,
            reviewCount: parseInt(productData.reviewsData?.reviewCount) || 0,
            reviews: productData.reviewsData?.reviews || [],
          },
        };
        setProduct(processedProduct);
        setMainImage(processedProduct.images?.[0] || "");
        setSelectedColor(processedProduct.colors?.[0] || "");

        if (processedProduct && processedProduct.id) {
          logInteraction(processedProduct.id, 'view', { source: 'product_details_page' })
            .then(() => console.log('Product view interaction logged for item:', processedProduct.id))
            .catch(err => console.error('Failed to log product view interaction:', err));
        }

        const recommendations = await fetchProductRecommendations(id, 5);
        if (recommendations && recommendations.length > 0) {
          const topRecommendations = recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(rec => rec.product_id);

          const recommendedProductsData = await Promise.all(
            topRecommendations.map(async (recId) => {
              try {
                const response = await fetch(
                  `http://localhost:5000/api/product-details/${recId}`
                );
                if (response.ok) {
                  const data = await response.json();
                  return {
                    id: data.id,
                    name: data.name,
                    price: parseFloat(data.price),
                    discount: parseFloat(data.discount || 0),
                    image: data.images?.[0] || '',
                    rating: parseFloat(data.rating || 0),
                  };
                }
                return null;
              } catch (err) {
                console.error(`Failed to fetch product ${recId}:`, err);
                return null;
              }
            })
          );

          setRecommendedProducts(recommendedProductsData.filter(item => item !== null));
        } else {
          setRecommendedProducts([]);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRecommendations();
  }, [productId]);

  const handleThumbnailClick = useCallback((image) => {
    setMainImage(image);
  }, []);

  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  const decreaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const increaseQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    actions.addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      discount: product.discount || 0,
      image: mainImage,
      color: selectedColor,
      quantity: quantity,
    });

    logInteraction(product.id, 'add_to_cart', { 
      source: 'product_details_page',
      quantity: quantity,
      color: selectedColor
    })
      .then(() => console.log('Add to cart interaction logged for item:', product.id))
      .catch(err => console.error('Failed to log add to cart interaction:', err));
  }, [product, mainImage, selectedColor, quantity, actions]);

  const toggleWishlist = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!product) return;

      actions.toggleWishlistItem({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        discount: product.discount || 0,
        image: mainImage,
      });

      logInteraction(product.id, isWishlisted ? 'remove_wishlist' : 'add_wishlist', { 
        source: 'product_details_page'
      })
        .then(() => console.log(`Wishlist interaction logged for item: ${product.id}`))
        .catch(err => console.error('Failed to log wishlist interaction:', err));
    },
    [product, mainImage, actions, isWishlisted]
  );

  const navigateToProduct = useCallback(
    (id) => {
      navigate(`/product/${id}`);
      window.scrollTo(0, 0);
    },
    [navigate]
  );

  const handleShowReviewModal = useCallback(() => {
    setShowReviewModal(true);
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setShowReviewModal(false);
    setReviewForm({
      user_name: "",
      rating: 0,
      comment: "",
    });
    setReviewSubmitError(null);
  }, []);

  const handleReviewInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value, 10) : value,
    }));
  }, []);

  const handleStarClick = useCallback((rating) => {
    setReviewForm((prev) => ({
      ...prev,
      rating,
    }));
  }, []);

  const handleReviewSubmit = useCallback(async () => {
    if (!reviewForm.user_name || !reviewForm.rating) {
      setReviewSubmitError("Name and rating are required");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewSubmitError("Rating must be between 1 and 5");
      return;
    }

    try {
      setReviewSubmitLoading(true);
      setReviewSubmitError(null);

      const response = await fetch(
        `http://localhost:5000/api/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Date.now(),
            user_name: reviewForm.user_name,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      if (product && product.id) {
        logInteraction(product.id, 'review', { 
          rating: reviewForm.rating,
          comment_length: reviewForm.comment.length 
        })
          .then(() => console.log('Review submission interaction logged for item:', product.id))
          .catch(err => console.error('Failed to log review submission interaction:', err));
      }

      const productResponse = await fetch(
        `http://localhost:5000/api/product-details/${productId}`
      );
      const productData = await productResponse.json();
      setProduct({
        ...productData,
        price: parseFloat(productData.price),
        rating: parseFloat(productData.rating),
        reviewCount: productData.review_count,
        images: productData.images || [],
        colors: productData.colors || [],
        features: productData.features || [],
        specifications: productData.specifications || {},
        relatedProducts: productData.relatedProducts || [],
        reviewsData: {
          averageRating: parseFloat(productData.reviewsData?.averageRating) || 0,
          reviewCount: parseInt(productData.reviewsData?.reviewCount) || 0,
          reviews: productData.reviewsData?.reviews || [],
        },
      });

      handleCloseReviewModal();
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewSubmitError(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitLoading(false);
    }
  }, [reviewForm, productId, handleCloseReviewModal, product]);

  const renderStars = useCallback((rating, interactive = false, onClick) => {
    return (
      <div className={`star-rating ${interactive ? "interactive" : ""}`}>
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          return (
            <i
              key={i}
              className={`bi ${
                rating >= starValue
                  ? "bi-star-fill"
                  : rating >= starValue - 0.5
                  ? "bi-star-half"
                  : "bi-star"
              } ${interactive ? "clickable" : ""}`}
              onClick={interactive ? () => onClick(starValue) : undefined}
              style={{
                color: interactive && starValue <= rating ? "#ffc107" : "#6c757d",
                cursor: interactive ? "pointer" : "default",
                fontSize: interactive ? "1.5rem" : "1rem",
              }}
            ></i>
          );
        })}
      </div>
    );
  }, []);

  const formatReviewDate = useCallback((dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  const handleRecommendedProductWishlist = useCallback((e, recommendedProduct) => {
    e.stopPropagation();
    actions.toggleWishlistItem({
      id: String(recommendedProduct.id),
      name: recommendedProduct.name,
      price: parseFloat(recommendedProduct.price),
      image: recommendedProduct.image,
    });

    const isRecommendedWishlisted = state.wishlist.some((item) => String(item.id) === String(recommendedProduct.id));
    logInteraction(recommendedProduct.id, isRecommendedWishlisted ? 'remove_wishlist' : 'add_wishlist', {
      source: 'recommended_products',
    })
      .then(() => console.log(`Wishlist interaction logged for item: ${recommendedProduct.id}`))
      .catch((err) => console.error('Failed to log wishlist interaction:', err));
  }, [actions, state.wishlist]);

  const handleRecommendedProductAddToCart = useCallback((e, recommendedProduct) => {
    e.stopPropagation();
    actions.addToCart({
      id: String(recommendedProduct.id),
      name: recommendedProduct.name,
      price: parseFloat(recommendedProduct.price),
      image: recommendedProduct.image,
      quantity: 1,
      color: '',
    });

    logInteraction(recommendedProduct.id, 'add_to_cart', {
      source: 'recommended_products',
      quantity: 1,
    })
      .then(() => console.log(`Add to cart interaction logged for item: ${recommendedProduct.id}`))
      .catch((err) => console.error('Failed to log add to cart interaction:', err));
  }, [actions]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5">
          <div className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto mb-4" style={{ width: "80px", height: "80px" }}>
            <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
          </div>
          <h4 className="fw-bold mb-3">{error}</h4>
          <button className="btn filter-btn px-4 py-2" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left me-2"></i>Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5">
          <div className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto mb-4" style={{ width: "80px", height: "80px" }}>
            <i className="bi bi-exclamation-circle fs-1 text-secondary"></i>
          </div>
          <h4 className="fw-bold mb-3">Product not found</h4>
          <button className="btn filter-btn px-4 py-2" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left me-2"></i>Back to Home
          </button>
        </div>
      </div>
    );
  }

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
          height: 450px;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .product-image:hover {
          transform: scale(1.05);
        }
        .thumbnail-image {
          width: 80px;
          height: 80px;
          object-fit: contain;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          outline: none !important;
        }
        .thumbnail-image:hover {
          transform: scale(1.1);
        }
        .thumbnail-selected {
          border: 2px solid #007bff;
          border-radius: 4px;
          outline: none !important;
        }
        .rating-stars {
          color: #ffc107;
          font-size: 0.9rem;
        }
        .price-tag {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .add-to-cart-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: none;
          border-radius: 25px;
          padding: 0.75rem 1.5rem;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 48px;
        }
        .add-to-cart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        .wishlist-btn {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          border: none;
          border-radius: 25px;
          padding: 0.75rem 1.5rem;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 48px;
        }
        .wishlist-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
        }
        .color-btn {
          border-radius: 25px;
          padding: 0.5rem 1.5rem;
          transition: all 0.3s ease;
        }
        .color-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .quantity-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .quantity-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .review-btn {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 25px;
          padding: 0.5rem 1.5rem;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(78, 205, 196, 0.3);
        }
        .carousel-control-prev, .carousel-control-next {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          top: 50%;
          transform: translateY(-50%);
        }
        .carousel-indicators [data-bs-target] {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ccc;
          margin: 0 5px;
          transition: all 0.3s ease;
        }
        .carousel-indicators .active {
          background: linear-gradient(45deg, #667eea, #764ba2);
          width: 24px;
          border-radius: 12px;
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
          top: 10px;
          right: 10px;
          transition: all 0.3s ease;
          z-index: 1;
        }
        .image-wishlist-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
      `}</style>

      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              <i className="bi bi-house-door-fill"></i> Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="glass-card p-4 position-relative image-container">
            <img
              src={mainImage || product.images?.[0]}
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Product+Image"; }}
            />
            <button
              className={`image-wishlist-btn ${isWishlisted ? "btn-danger" : "btn-light"}`}
              onClick={toggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
            </button>
            {product.isNew && (
              <span className="badge badge-modern position-absolute top-0 start-0 m-3">
                <i className="bi bi-star-fill me-1"></i> New
              </span>
            )}
            {product.discount > 0 && (
              <span className="badge badge-modern position-absolute bottom-0 start-0 m-3">
                {product.discount}% OFF
              </span>
            )}
          </div>
          <div className="d-flex gap-2 flex-wrap mt-3">
            {product.images?.map((image, index) => (
              <button
                key={index}
                className={`glass-card p-1 ${mainImage === image ? "thumbnail-selected" : ""}`}
                onClick={() => handleThumbnailClick(image)}
                style={{ width: "80px", height: "80px", border: 'none', padding: 0 }}
                aria-label={`View thumbnail ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-image p-1"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="h2 fw-bold mb-2">{product.name}</h1>
                <div className="d-flex align-items-center mb-3">
                  <div className="rating-stars me-2">
                    {renderStars(product.reviewsData?.averageRating || 0)}
                  </div>
                  <span className="text-muted small">
                    ({product.reviewsData?.reviewCount || 0} reviews) |{" "}
                    <button
                      onClick={handleShowReviewModal}
                      className="text-decoration-none btn btn-link p-0 border-0 align-baseline"
                    >
                      Write a review
                    </button>
                  </span>
                </div>
              </div>
              <button
                className="btn btn-outline-secondary rounded-circle"
                onClick={() => navigate(-1)}
                style={{ width: "40px", height: "40px" }}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="mb-4">
              {product.discount > 0 ? (
                <div>
                  <span className="price-tag me-2">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-decoration-line-through text-muted me-2">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="badge badge-modern">
                    Save {product.discount}%
                  </span>
                </div>
              ) : (
                <span className="price-tag">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              )}
              {parseFloat(product.price) > 100 && (
                <div className="text-success small mt-1">
                  <i className="bi bi-truck"></i> Free Shipping
                </div>
              )}
            </div>

            <p className="text-secondary mb-4">{product.description}</p>

            {product.colors?.length > 0 && (
              <div className="mb-4">
                <h3 className="h6 fw-bold mb-3">
                  Color: <span className="text-primary">{selectedColor}</span>
                </h3>
                <div className="d-flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-btn ${selectedColor === color ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => handleColorSelect(color)}
                      aria-label={`Select color ${color}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="h6 fw-bold mb-3">Quantity</h3>
              <div className="d-flex align-items-center gap-3">
                <button
                  className="quantity-btn"
                  onClick={decreaseQuantity}
                  aria-label="Decrease quantity"
                >
                  <i className="bi bi-dash text-white"></i>
                </button>
                <span
                  className="fs-5 fw-bold"
                  style={{ minWidth: "40px", textAlign: "center" }}
                >
                  {quantity}
                </span>
                <button
                  className="quantity-btn"
                  onClick={increaseQuantity}
                  aria-label="Increase quantity"
                >
                  <i className="bi bi-plus text-white"></i>
                </button>
              </div>
            </div>

            <div className="d-flex gap-3 mb-4">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={state.loading}
              >
                {state.loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-fill me-2"></i>Add to Cart
                  </>
                )}
              </button>
              <button
                className={`wishlist-btn ${isWishlisted ? "btn-danger" : ""}`}
                onClick={toggleWishlist}
              >
                <i
                  className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"} me-2`}
                ></i>
                {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              </button>
              <button
                className="btn btn-outline-primary rounded-circle"
                style={{ width: "60px", height: "48px" }}
                aria-label="Share product"
              >
                <i className="bi bi-share-fill"></i>
              </button>
            </div>

            <div className="glass-card p-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-truck text-primary fs-4 me-3"></i>
                <div>
                  <h6 className="mb-1">Free Delivery</h6>
                  <p className="small text-muted mb-0">
                    Estimated delivery:{" "}
                    {new Date(
                      Date.now() + 5 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {product.features?.length > 0 && (
            <div className="glass-card p-4 mt-4">
              <h3 className="h6 fw-bold mb-3">Key Features</h3>
              <ul className="list-unstyled row row-cols-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="d-flex align-items-start mb-2 col">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {product.specifications &&
        Object.keys(product.specifications).length > 0 && (
          <div className="glass-card p-4 mb-5">
            <h2 className="h4 fw-bold mb-4">Product Specifications</h2>
            <div className="section-divider"></div>
            <div className="row">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="col-md-6 mb-3">
                  <div className="d-flex">
                    <span
                      className="text-muted me-2"
                      style={{ width: "150px" }}
                    >
                      {key}:
                    </span>
                    <span className="fw-medium">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="glass-card p-4 mb-5" id="reviews">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 fw-semibold mb-0">
            Customer Reviews{" "}
            <span className="text-muted fs-6 fw-normal">
              ({product.reviewsData?.reviewCount || 0})
            </span>
          </h2>
          <button
            className="review-btn btn-sm px-3 py-1"
            onClick={handleShowReviewModal}
          >
            <i className="bi bi-pencil-fill me-1"></i>Write Review
          </button>
        </div>
        <div className="section-divider"></div>

        {product.reviewsData?.reviews?.length > 0 ? (
          <>
            <div className="text-center mb-4">
              <div className="glass-card p-3 d-inline-block mb-3">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="rating-stars me-2 fs-3 lh-1">
                    {renderStars(Number(product.reviewsData?.averageRating) || 0)}
                  </div>
                  <span className="fw-bold fs-4 lh-1">
                    {typeof product.reviewsData?.averageRating === 'number' 
                      ? product.reviewsData.averageRating.toFixed(1) 
                      : parseFloat(product.reviewsData?.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <p className="text-muted small mb-0 mt-1">
                  Based on {product.reviewsData.reviewCount} review{product.reviewsData.reviewCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="position-relative px-lg-4">
              <Carousel
                indicators={product.reviewsData?.reviews?.length > 1}
                interval={null}
                controls={product.reviewsData?.reviews?.length > 1}
                nextIcon={
                  <span 
                    className="carousel-control-next-icon bg-white text-primary rounded-circle p-2 border border-2 border-primary shadow-sm"
                    style={{ width: "40px", height: "40px", backgroundImage: "none" }}
                  >
                    <i className="bi bi-chevron-right fs-5 text-primary"></i>
                  </span>
                }
                prevIcon={
                  <span 
                    className="carousel-control-prev-icon bg-white text-primary rounded-circle p-2 border border-2 border-primary shadow-sm"
                    style={{ width: "40px", height: "40px", backgroundImage: "none" }}
                  >
                    <i className="bi bi-chevron-left fs-5 text-primary"></i>
                  </span>
                }
              >
                {product.reviewsData?.reviews?.map((review, index) => (
                  <Carousel.Item key={review.id || index}>
                    <div className="px-2 pb-4">
                      <div className="glass-card p-4" style={{ maxWidth: "650px", margin: "0 auto" }}>
                        <div className="d-flex mb-3">
                          <div className="bg-primary text-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center me-3" 
                            style={{ width: "48px", height: "48px", fontWeight: "600", fontSize: "18px" }}>
                            <span>{review.user_name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h5 className="mb-1 fw-semibold">{review.user_name}</h5>
                                <span className="text-muted small">
                                  {review.created_at && formatReviewDate(review.created_at)}
                                </span>
                              </div>
                              <div className="rating-stars ms-2">
                                {renderStars(Number(review.rating) || 0, true)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="border-top border-light-subtle pt-3">
                          <p className="mb-0">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          </>
        ) : (
          <div className="text-center py-5 glass-card">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: "80px", height: "80px" }}>
              <i className="bi bi-chat-square-text fs-3 text-primary"></i>
            </div>
            <h5 className="fw-bold mb-2">No Reviews Yet</h5>
            <p className="text-muted mb-4">Be the first to share your experience with this product</p>
            <button
              className="review-btn px-4 py-2 d-inline-flex align-items-center"
              onClick={handleShowReviewModal}
            >
              <i className="bi bi-pencil-fill me-2"></i>Write Review
            </button>
          </div>
        )}
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mb-5">
          <h2 className="h4 fw-bold mb-4">You May Also Like</h2>
          <div className="section-divider"></div>
          <div className="row g-4">
            {recommendedProducts.map((recommendedProduct) => {
              const discountedPrice = parseFloat(recommendedProduct.price) * (1 - (recommendedProduct.discount || 0) / 100);
              const isRecommendedWishlisted = state.wishlist.some((item) => String(item.id) === String(recommendedProduct.id));

              return (
                <div
                  key={recommendedProduct.id}
                  className="col-6 col-lg-3"
                  onClick={() => navigateToProduct(recommendedProduct.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-card h-100">
                    <div className="image-container position-relative">
                      <img
                        src={recommendedProduct.image}
                        alt={recommendedProduct.name}
                        className="product-image"
                        style={{ height: "200px" }}
                        loading="lazy"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Product+Image"; }}
                      />
                      <button
                        className="image-wishlist-btn"
                        onClick={(e) => handleRecommendedProductWishlist(e, recommendedProduct)}
                        aria-label={isRecommendedWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <i className={`bi ${isRecommendedWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
                      </button>
                      {recommendedProduct.discount > 0 && (
                        <span className="badge badge-modern position-absolute bottom-0 start-0 m-3">
                          {recommendedProduct.discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="card-body p-3">
                      <h5 className="card-title h6 mb-2 fw-bold text-truncate">{recommendedProduct.name}</h5>
                      <div className="d-flex align-items-center mb-3">
                        <div className="rating-stars me-2">
                          {renderStars(Number(recommendedProduct.rating) || 0)}
                        </div>
                        <span className="text-muted small">{recommendedProduct.rating.toFixed(1)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {recommendedProduct.discount > 0 ? (
                            <>
                              <span className="price-tag">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-decoration-line-through text-muted ms-2">
                                ${parseFloat(recommendedProduct.price).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="price-tag">
                              ${parseFloat(recommendedProduct.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          className="add-to-cart-btn"
                          style={{ width: "48px", height: "48px", borderRadius: "50%", padding: 0 }}
                          onClick={(e) => handleRecommendedProductAddToCart(e, recommendedProduct)}
                          aria-label={`Add ${recommendedProduct.name} to cart`}
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

      <Modal show={showReviewModal} onHide={handleCloseReviewModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewSubmitError && (
            <div className="alert alert-danger">{reviewSubmitError}</div>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                name="user_name"
                value={reviewForm.user_name}
                onChange={handleReviewInputChange}
                placeholder="Enter your name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex align-items-center">
                {renderStars(reviewForm.rating, true, handleStarClick)}
                <span className="ms-2 fw-bold">
                  {reviewForm.rating > 0 ? `${reviewForm.rating} stars` : ""}
                </span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Review (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewInputChange}
                placeholder="Share your thoughts about this product"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReviewModal}>
            Cancel
          </Button>
          <Button
            className="review-btn"
            onClick={handleReviewSubmit}
            disabled={reviewSubmitLoading}
          >
            {reviewSubmitLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default React.memo(ProductDetails);