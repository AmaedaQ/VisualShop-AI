import React, { useState, useEffect } from "react";
import { BiPlusCircle, BiSearch, BiEdit, BiTrash, BiInfoCircle } from "react-icons/bi";
import { Modal, Button, Form, Spinner, Alert, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ProductsTab = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [colorList, setColorList] = useState([]);
  const [featureList, setFeatureList] = useState([]);
  const [specificationList, setSpecificationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Sort By");

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentDetails, setCurrentDetails] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    reorderLevel: "",
    image: null,
  });

  const [detailsForm, setDetailsForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    rating: "",
    review_count: "",
    colors: "",
    features: "",
    specifications: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !isSeller || !user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch products
        const productsResponse = await axios.get(`http://localhost:5000/api/products/seller`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        // Ensure price is a number
        const parsedProducts = productsResponse.data.products.map(product => ({
          ...product,
          price: parseFloat(product.price),
        }));
        setProducts(parsedProducts);

        // Fetch product details
        const detailsResponse = await axios.get(`http://localhost:5000/api/product-details`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const detailsMap = detailsResponse.data.reduce((acc, detail) => {
          acc[detail.id] = {
            ...detail,
            price: parseFloat(detail.price),
            rating: parseFloat(detail.rating) || 0,
            colors: Array.isArray(detail.colors) ? detail.colors : [],
            features: Array.isArray(detail.features) ? detail.features : [],
            specifications: typeof detail.specifications === 'object' 
              ? detail.specifications 
              : {},
          };
          return acc;
        }, {});
        setProductDetails(detailsMap);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, isSeller, user?.id]);

  // Helper function to update visual search embeddings
  const updateVisualSearch = async (imagePath) => {
    try {
      await fetch("http://localhost:8000/update-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_path: imagePath }),
      });
    } catch (err) {
      console.error("⚠️ Visual Search Update Failed:", err);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All Status" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Name (A-Z)":
        return a.name.localeCompare(b.name);
      case "Price (Low-High)":
        return a.price - b.price;
      case "Price (High-Low)":
        return b.price - a.price;
      case "Stock (Low-High)":
        return a.stock - b.stock;
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle product form input
  const handleProductInput = (e) => {
    const { name, value, files } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : name === "price" || name === "stock" || name === "reorderLevel" ? value : value,
    }));
  };

  // Handle details form input
  const handleDetailsInput = (e) => {
    const { name, value } = e.target;
    setDetailsForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "rating" || name === "review_count" ? value : value,
    }));
  };

  // Submit product form
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!isSeller) {
      setError("Only sellers can manage products");
      return;
    }

    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      category: productForm.category,
      stock: parseInt(productForm.stock),
      reorderLevel: productForm.reorderLevel ? parseInt(productForm.reorderLevel) : 20,
    };

    const formDataToSend = new FormData();
    Object.keys(productData).forEach((key) => formDataToSend.append(key, productData[key]));
    if (productForm.image) formDataToSend.append("image", productForm.image);

    try {
      if (currentProduct) {
        // Update product
        await axios.put(`http://localhost:5000/api/products/${currentProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProducts(
          products.map((p) =>
            p.id === currentProduct.id
              ? { ...p, ...productData, price: parseFloat(productData.price), status: p.stock > 10 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock" }
              : p
          )
        );
        setSuccess("Product updated successfully");
      } else {
        // Add product
        const response = await axios.post("http://localhost:5000/api/products", formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        
        // Update visual search embeddings
        const fullImagePath = response.data.image; // Like "/assets/images/Electronics/xyz.jpg"
        updateVisualSearch(fullImagePath);
        
        // Add product to state
        setProducts([...products, { ...productData, id: response.data.id, image: response.data.image, status: "In Stock" }]);
        setSuccess("Product added successfully");
      }
      handleCloseProductModal();
    } catch (err) {
      setError("Failed to save product");
      console.error(err);
    }
  };

  // Submit details form
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!isSeller) {
      setError("Only sellers can manage product details");
      return;
    }

    const colors = colorList.filter((c) => c.trim() !== "");
    const features = featureList.filter((f) => f.trim() !== "");
    const specifications = {};
    specificationList.forEach(({ key, value }) => {
      if (key && value) specifications[key] = value;
    });

    const detailsData = {
      id: parseInt(detailsForm.id),
      name: detailsForm.name,
      description: detailsForm.description,
      price: parseFloat(detailsForm.price),
      rating: parseFloat(detailsForm.rating) || 0,
      review_count: parseInt(detailsForm.review_count) || 0,
      colors,
      features,
      specifications,
    };

    try {
      if (currentDetails) {
        // Update details
        await axios.put(`http://localhost:5000/api/product-details/${currentDetails.id}`, detailsData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProductDetails((prev) => ({
          ...prev,
          [currentDetails.id]: { ...detailsData, id: currentDetails.id, price: parseFloat(detailsData.price) },
        }));
        setSuccess("Product details updated successfully");
      } else {
        // Add details
        await axios.post("http://localhost:5000/api/product-details", detailsData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProductDetails((prev) => ({
          ...prev,
          [detailsData.id]: { ...detailsData, price: parseFloat(detailsData.price) },
        }));
        setSuccess("Product details added successfully");
      }
      handleCloseDetails();
    } catch (err) {
      setError("Failed to save product details");
      console.error(err);
    }
  };

  // Open product modal
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(), // Convert to string for form input
      stock: product.stock.toString(),
      reorderLevel: product.reorder_level || "",
      image: null,
    });
    setShowProductModal(true);
    setShowDetailsModal(false);
  };

  // Open product details modal
  const handleEditDetails = async (product, details = null) => {
    setCurrentProduct(product);
    setCurrentDetails(details);
    
    // If editing existing details, fetch them directly from API
    if (details) {
      try {
        const response = await axios.get(`http://localhost:5000/api/product-details/${product.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        const fetchedDetails = response.data;
        console.log('Fetched details:', fetchedDetails);
        
        // Set the form values
        setDetailsForm({
          id: product.id,
          name: product.name,
          description: fetchedDetails.description || "",
          price: fetchedDetails.price ? fetchedDetails.price.toString() : product.price.toString(),
          rating: fetchedDetails.rating ? fetchedDetails.rating.toString() : "",
          review_count: fetchedDetails.review_count ? fetchedDetails.review_count.toString() : "",
        });
        
        // Set the lists with proper type checking
        setColorList(Array.isArray(fetchedDetails.colors) ? fetchedDetails.colors : []);
        setFeatureList(Array.isArray(fetchedDetails.features) ? fetchedDetails.features : []);
        setSpecificationList(
          typeof fetchedDetails.specifications === 'object'
            ? Object.entries(fetchedDetails.specifications).map(([key, value]) => ({ key, value }))
            : []
        );
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to fetch product details');
        return;
      }
    } else {
      // For new details
      setDetailsForm({
        id: product.id,
        name: product.name,
        description: "",
        price: product.price.toString(),
        rating: "",
        review_count: "",
      });
      setColorList([]);
      setFeatureList([]);
      setSpecificationList([]);
    }

    setShowDetailsModal(true);
    setShowProductModal(false);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product and its details?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProducts(products.filter((p) => p.id !== id));
        setProductDetails((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setSuccess("Product and details deleted successfully");
      } catch (err) {
        setError("Failed to delete product");
        console.error(err);
      }
    }
  };

  // Close product modal
  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setCurrentProduct(null);
    setProductForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      reorderLevel: "",
      image: null,
    });
    setError(null);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setCurrentProduct(null);
    setCurrentDetails(null);
    setDetailsForm({
      id: "",
      name: "",
      description: "",
      price: "",
      rating: "",
      review_count: "",
      colors: "",
      features: "",
      specifications: "",
    });
    setColorList([]);
    setFeatureList([]);
    setSpecificationList([]);
    setError(null);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "In Stock":
        return "success";
      case "Low Stock":
        return "warning";
      case "Out of Stock":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Safely format price
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "N/A" : `$${numPrice.toFixed(2)}`;
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;

  return (
    <div className="tab-pane fade show active">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" className="p-3">
        {success && (
          <Toast onClose={() => setSuccess(null)} show={!!success} delay={3000} autohide>
            <Toast.Header>
              <strong className="me-auto">Success</strong>
            </Toast.Header>
            <Toast.Body>{success}</Toast.Body>
          </Toast>
        )}
        {error && (
          <Toast onClose={() => setError(null)} show={!!error} delay={3000} autohide>
            <Toast.Header>
              <strong className="me-auto">Error</strong>
            </Toast.Header>
            <Toast.Body>{error}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>

      {/* Header and Add Product Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold fs-2">Product Management</h2>
        {isSeller && (
          <Button
            variant="primary"
            className="d-flex align-items-center"
            onClick={() => setShowProductModal(true)}
          >
            <BiPlusCircle className="me-2" /> Add New Product
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">
                  <BiSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="Beauty">Beauty</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home_Kitchen">Home & Kitchen</option>
                <option value="Sports">Sports</option>
                <option value="Toys and Games">Toys and Games</option>
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Sort By">Sort By</option>
                <option value="Name (A-Z)">Name (A-Z)</option>
                <option value="Price (Low-High)">Price (Low-High)</option>
                <option value="Price (High-Low)">Price (High-Low)</option>
                <option value="Stock (Low-High)">Stock (Low-High)</option>
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All Categories");
                  setStatusFilter("All Status");
                  setSortBy("Sort By");
                  setCurrentPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "50px" }}>
                    <Form.Check type="checkbox" id="selectAll" />
                  </th>
                  <th style={{ width: "80px" }}>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th style={{ width: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <Form.Check type="checkbox" />
                      </td>
                      <td>
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                          className="img-thumbnail rounded"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td className="fw-semibold">{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>{product.reorder_level || 20}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeClass(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            onClick={() => handleEditProduct(product)}
                            disabled={!isSeller}
                            title="Edit Product"
                          >
                            <BiEdit />
                          </Button>
                          {productDetails[product.id] ? (
                            <Button
                              variant="outline-info"
                              onClick={() => handleEditDetails(product, productDetails[product.id])}
                              disabled={!isSeller}
                              title="Edit Details"
                            >
                              <BiInfoCircle />
                            </Button>
                          ) : (
                            <Button
                              variant="outline-warning"
                              onClick={() => handleEditDetails(product)}
                              disabled={!isSeller}
                              title="Add Details"
                            >
                              <BiPlusCircle />
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDelete(product.id)}
                            disabled={!isSeller}
                            title="Delete Product"
                          >
                            <BiTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No products found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
            </li>
            {[...Array(totalPages).keys()].map((page) => (
              <li
                key={page + 1}
                className={`page-item ${currentPage === page + 1 ? "active" : ""}`}
              >
                <Button
                  className="page-link"
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </Button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </li>
          </ul>
        </nav>
      )}

{/* Enhanced Product Modal */}
<Modal show={showProductModal} onHide={handleCloseProductModal} size="lg" centered>
  <Modal.Header closeButton className="bg-light border-0 pb-2">
    <Modal.Title className="fw-bold text-dark fs-4">
      <i className="bi bi-box me-2 text-primary"></i>
      {currentProduct ? "Edit Product" : "Add New Product"}
    </Modal.Title>
  </Modal.Header>
  
  <Modal.Body className="px-4 py-3">
    <Form onSubmit={handleProductSubmit}>
      {/* Basic Product Information */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 d-flex align-items-center">
          <i className="bi bi-info-circle me-2"></i>
          Basic Information
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Product Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductInput}
                required
                className="border-2 rounded-3 shadow-sm"
                placeholder="Enter product name"
                style={{ fontSize: '0.95rem' }}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Category <span className="text-danger">*</span>
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-2">
                  <i className="bi bi-tag"></i>
                </span>
                <Form.Select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductInput}
                  required
                  className="border-2 shadow-sm"
                  style={{ fontSize: '0.95rem' }}
                >
                  <option value="">Select Category</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home_Kitchen">Home & Kitchen</option>
                  <option value="Sports">Sports</option>
                  <option value="Toys and Games">Toys and Games</option>
                </Form.Select>
              </div>
            </Form.Group>
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 d-flex align-items-center">
          <i className="bi bi-calculator me-2"></i>
          Pricing & Inventory
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Price ($) <span className="text-danger">*</span>
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-2">
                  <i className="bi bi-currency-dollar"></i>
                </span>
                <Form.Control
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleProductInput}
                  step="0.01"
                  min="0"
                  required
                  className="border-2 shadow-sm"
                  placeholder="0.00"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Stock Quantity <span className="text-danger">*</span>
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-2">
                  <i className="bi bi-box-seam"></i>
                </span>
                <Form.Control
                  type="number"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleProductInput}
                  min="0"
                  required
                  className="border-2 shadow-sm"
                  placeholder="0"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            </Form.Group>
          </div>
          <div className="col-12">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Reorder Level
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-2">
                  <i className="bi bi-exclamation-triangle"></i>
                </span>
                <Form.Control
                  type="number"
                  name="reorderLevel"
                  value={productForm.reorderLevel}
                  onChange={handleProductInput}
                  min="0"
                  placeholder="20"
                  className="border-2 shadow-sm"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
              <Form.Text className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                Products will show as "Low Stock" when quantity is at or below this level
              </Form.Text>
            </Form.Group>
          </div>
        </div>
      </div>

      {/* Product Media */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 d-flex align-items-center">
          <i className="bi bi-image me-2"></i>
          Product Media
        </h5>
        <div className="row g-3">
          <div className="col-12">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Product Image
              </Form.Label>
              <div className="border-2 border-dashed rounded-3 p-3 bg-light text-center">
                <i className="bi bi-cloud-upload fs-2 text-muted mb-2 d-block"></i>
                <Form.Control
                  type="file"
                  name="image"
                  onChange={handleProductInput}
                  accept="image/jpeg,image/jpg,image/png"
                  className="border-0 bg-transparent"
                  style={{ fontSize: '0.95rem' }}
                />
                <small className="text-muted d-block mt-2">
                  <i className="bi bi-file-earmark-image me-1"></i>
                  Accepted formats: JPEG, JPG, PNG
                </small>
              </div>
            </Form.Group>
          </div>
        </div>
      </div>
    </Form>
  </Modal.Body>
  
  <Modal.Footer className="bg-light border-0 pt-3">
    <Button 
      variant="outline-secondary" 
      onClick={handleCloseProductModal}
      className="px-4 py-2 rounded-3 fw-semibold"
    >
      <i className="bi bi-x-circle me-2"></i>
      Cancel
    </Button>
    <Button 
      variant="primary" 
      onClick={handleProductSubmit}
      className="px-4 py-2 rounded-3 fw-semibold shadow-sm"
    >
      <i className="bi bi-check-circle me-2"></i>
      {currentProduct ? "Update Product" : "Add Product"}
    </Button>
  </Modal.Footer>
</Modal>
{/* Enhanced Details Modal */}
<Modal show={showDetailsModal} onHide={handleCloseDetails} size="lg" centered>
  <Modal.Header closeButton className="bg-light border-0 pb-2">
    <Modal.Title className="fw-bold text-dark fs-4">
      <i className="bi bi-box-seam me-2 text-primary"></i>
      {currentDetails ? "Edit Product Details" : "Add Product Details"}
    </Modal.Title>
  </Modal.Header>
  
  <Modal.Body className="px-4 py-3">
    <Form onSubmit={handleDetailsSubmit}>
      {/* Basic Information Section */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 d-flex align-items-center">
          <i className="bi bi-info-circle me-2"></i>
          Basic Information
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Product ID
              </Form.Label>
              <Form.Control
                type="number"
                name="id"
                value={detailsForm.id}
                readOnly
                className="bg-light border-2 rounded-3"
                style={{ fontSize: '0.95rem' }}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Product Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={detailsForm.name}
                onChange={handleDetailsInput}
                required
                className="border-2 rounded-3 shadow-sm"
                placeholder="Enter product name"
                style={{ fontSize: '0.95rem' }}
              />
            </Form.Group>
          </div>
          <div className="col-12">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={detailsForm.description}
                onChange={handleDetailsInput}
                rows={4}
                className="border-2 rounded-3 shadow-sm"
                placeholder="Enter product description..."
                style={{ fontSize: '0.95rem', resize: 'vertical' }}
              />
            </Form.Group>
          </div>
        </div>
      </div>

      {/* Pricing & Rating Section */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 d-flex align-items-center">
          <i className="bi bi-star me-2"></i>
          Pricing & Rating
        </h5>
        <div className="row g-3">
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Price ($) <span className="text-danger">*</span>
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-2">
                  <i className="bi bi-currency-dollar"></i>
                </span>
                <Form.Control
                  type="number"
                  name="price"
                  value={detailsForm.price}
                  onChange={handleDetailsInput}
                  step="0.01"
                  min="0"
                  required
                  className="border-2 shadow-sm"
                  placeholder="0.00"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Rating (0-5)
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-2">
                  <i className="bi bi-star-fill text-warning"></i>
                </span>
                <Form.Control
                  type="number"
                  name="rating"
                  value={detailsForm.rating}
                  onChange={handleDetailsInput}
                  step="0.1"
                  min="0"
                  max="5"
                  className="border-2 shadow-sm"
                  placeholder="0.0"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small">
                Review Count
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-2">
                  <i className="bi bi-chat-dots"></i>
                </span>
                <Form.Control
                  type="number"
                  name="review_count"
                  value={detailsForm.review_count}
                  onChange={handleDetailsInput}
                  min="0"
                  className="border-2 shadow-sm"
                  placeholder="0"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            </Form.Group>
          </div>
        </div>
      </div>

      {/* Product Attributes Section */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 d-flex align-items-center">
          <i className="bi bi-palette me-2"></i>
          Product Attributes
        </h5>
        <div className="row g-4">
          {/* Colors */}
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small d-flex align-items-center">
                <i className="bi bi-palette2 me-2"></i>
                Available Colors
              </Form.Label>
              <div className="border rounded-3 p-3 bg-light">
                {colorList.map((color, index) => (
                  <div key={index} className="d-flex mb-2 align-items-center">
                    <div className="position-relative flex-grow-1">
                      <Form.Control
                        type="text"
                        value={color}
                        onChange={(e) => {
                          const updated = [...colorList];
                          updated[index] = e.target.value;
                          setColorList(updated);
                        }}
                        placeholder="Enter color name"
                        className="border-2 rounded-3 pe-5"
                        style={{ fontSize: '0.9rem' }}
                      />
                      {color && (
                        <div 
                          className="position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle border"
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            backgroundColor: color.toLowerCase(),
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }}
                        ></div>
                      )}
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        const updated = [...colorList];
                        updated.splice(index, 1);
                        setColorList(updated);
                      }} 
                      className="ms-2 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', minWidth: '32px' }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setColorList([...colorList, ""])}
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: 'auto', padding: '6px 16px' }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Color
                </Button>
              </div>
            </Form.Group>
          </div>

          {/* Features */}
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-muted small d-flex align-items-center">
                <i className="bi bi-list-check me-2"></i>
                Key Features
              </Form.Label>
              <div className="border rounded-3 p-3 bg-light">
                {featureList.map((feature, index) => (
                  <div key={index} className="d-flex mb-2 align-items-center">
                    <Form.Control
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const updated = [...featureList];
                        updated[index] = e.target.value;
                        setFeatureList(updated);
                      }}
                      placeholder="Enter feature description"
                      className="border-2 rounded-3"
                      style={{ fontSize: '0.9rem' }}
                    />
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        const updated = [...featureList];
                        updated.splice(index, 1);
                        setFeatureList(updated);
                      }} 
                      className="ms-2 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', minWidth: '32px' }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setFeatureList([...featureList, ""])}
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: 'auto', padding: '6px 16px' }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Feature
                </Button>
              </div>
            </Form.Group>
          </div>
        </div>
      </div>

      {/* Technical Specifications Section */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 d-flex align-items-center">
          <i className="bi bi-gear me-2"></i>
          Technical Specifications
        </h5>
        <div className="border rounded-3 p-3 bg-light">
          {specificationList.map((spec, index) => (
            <div key={index} className="d-flex gap-2 mb-2 align-items-center">
              <Form.Control
                type="text"
                value={spec.key}
                placeholder="Spec name"
                onChange={(e) => {
                  const updated = [...specificationList];
                  updated[index].key = e.target.value;
                  setSpecificationList(updated);
                }}
                className="border-2 rounded-3"
                style={{ fontSize: '0.9rem', flex: '1' }}
              />
              <Form.Control
                type="text"
                value={spec.value}
                placeholder="Spec value"
                onChange={(e) => {
                  const updated = [...specificationList];
                  updated[index].value = e.target.value;
                  setSpecificationList(updated);
                }}
                className="border-2 rounded-3"
                style={{ fontSize: '0.9rem', flex: '1' }}
              />
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => {
                  const updated = [...specificationList];
                  updated.splice(index, 1);
                  setSpecificationList(updated);
                }}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', minWidth: '32px' }}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
          ))}
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => setSpecificationList([...specificationList, { key: "", value: "" }])}
            className="d-flex align-items-center justify-content-center"
            style={{ width: 'auto', padding: '6px 16px' }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Specification
          </Button>
        </div>
      </div>
    </Form>
  </Modal.Body>
  
  <Modal.Footer className="bg-light border-0 pt-3">
    <Button 
      variant="outline-secondary" 
      onClick={handleCloseDetails}
      className="px-4 py-2 rounded-3 fw-semibold"
    >
      <i className="bi bi-x-circle me-2"></i>
      Cancel
    </Button>
    <Button 
      variant="primary" 
      onClick={handleDetailsSubmit}
      className="px-4 py-2 rounded-3 fw-semibold shadow-sm"
    >
      <i className="bi bi-check-circle me-2"></i>
      {currentDetails ? "Update Details" : "Add Details"}
    </Button>
  </Modal.Footer>
</Modal>    </div>
  );
};

export default ProductsTab;