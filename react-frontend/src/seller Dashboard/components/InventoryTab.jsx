import React, { useState, useEffect } from "react";
import { BiDownload, BiPlusCircle, BiBulb, BiEdit } from "react-icons/bi";
import { Modal, Button, Badge, Alert, Form, Pagination, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const InventoryTab = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateType, setUpdateType] = useState('stock');
  const [stockUpdate, setStockUpdate] = useState({
    addStock: 0,
    newReorderLevel: 0,
    notes: "",
  });
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortByPriority, setSortByPriority] = useState(false);
  const productsPerPage = 10;

  // Calculate status based on stock and reorder level
  const calculateStatus = (stock, reorderLevel) => {
    const stockNum = Number(stock) || 0;
    const reorderNum = Number(reorderLevel) || 0;
    
    if (stockNum === 0) return "Out of Stock";
    if (stockNum <= reorderNum) return "Low Stock";
    return "In Stock";
  };

  // Calculate priority score for insights
  const calculatePriorityScore = (insight) => {
    let score = 0;
    if (insight.current_stock === 0) score += 50; // Out of stock
    else if (insight.current_stock <= insight.reorder_level) score += 30; // Low stock
    if (insight.sales > 0) score += Math.min(insight.sales * 20, 100); // High sales
    if (insight.views >= 5) score += 10 + Math.min((insight.views - 5) * 2, 40); // High views
    if (score === 0) score = 5; // Default for new/inactive
    return score;
  };

  // Get priority class and label
  const getPriorityInfo = (score) => {
    if (score >= 100) return { class: 'danger', label: 'Critical' };
    if (score >= 30) return { class: 'warning', label: 'Moderate' };
    return { class: 'info', label: 'Low' };
  };

  // Fetch inventory from backend
  useEffect(() => {
    if (isAuthenticated && isSeller) {
      fetchInventory();
      fetchInsights();
    }
  }, [isAuthenticated, isSeller]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get("http://localhost:5000/api/inventory", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      const inventoryWithStatus = (response.data || []).map(item => ({
        ...item,
        status: calculateStatus(item.stock, item.reorder_level)
      }));

      console.log('Inventory with status:', inventoryWithStatus);
      setInventory(inventoryWithStatus);
      setError(null);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  // Fetch insights from backend
  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get("http://localhost:5000/api/inventory/insights", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      const insightsWithPriority = (response.data || []).map(insight => ({
        ...insight,
        priority_score: calculatePriorityScore(insight)
      })).sort((a, b) => b.priority_score - a.priority_score);

      console.log('Fetched insights:', insightsWithPriority);
      setInsights(insightsWithPriority);
      setInsightsError(null);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsightsError('Failed to fetch inventory insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Calculate inventory stats
  const inventoryStats = {
    totalProducts: inventory.length,
    inStock: inventory.filter(item => item.status === "In Stock").length,
    lowStock: inventory.filter(item => item.status === "Low Stock").length,
    outOfStock: inventory.filter(item => item.status === "Out of Stock").length,
  };

  // Get unique categories
  const categories = ['All', ...new Set(inventory.map(item => item.category))];

  // Filter and paginate inventory
  const filteredInventory = inventory
    .filter(item => categoryFilter === 'All' || item.category === categoryFilter)
    .sort((a, b) => {
      if (sortByPriority) {
        const aInsight = insights.find(i => i.product_id === a.id) || { priority_score: 0 };
        const bInsight = insights.find(i => i.product_id === b.id) || { priority_score: 0 };
        return bInsight.priority_score - aInsight.priority_score;
      }
      return 0; // Default order
    });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredInventory.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredInventory.length / productsPerPage);

  // Open update modal
  const handleShowModal = (product, type = 'stock') => {
    setSelectedProduct(product);
    setUpdateType(type);
    setStockUpdate({
      addStock: 0,
      newReorderLevel: product.reorder_level || 0,
      notes: "",
    });
    setShowModal(true);
  };

  // Close update modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setStockUpdate({ addStock: 0, newReorderLevel: 0, notes: "" });
    setUpdateType('stock');
  };

  // Open insight modal
  const handleShowInsightModal = (product) => {
    const insight = insights.find(i => i.product_id === product.id);
    if (insight) {
      setSelectedInsight(insight);
      setShowInsightModal(true);
    }
  };

  // Close insight modal
  const handleCloseInsightModal = () => {
    setShowInsightModal(false);
    setSelectedInsight(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStockUpdate(prev => ({
      ...prev,
      [name]: name === "addStock" || name === "newReorderLevel" ? parseInt(value) || 0 : value,
    }));
  };

  // Handle stock update
  const handleStockUpdate = async () => {
    try {
      if (!selectedProduct || !selectedProduct.id) {
        console.error('No product selected');
        return;
      }

      const token = localStorage.getItem('token');
      const newStockLevel = parseInt(selectedProduct.stock) + parseInt(stockUpdate.addStock);
      
      if (newStockLevel < 0) {
        setError('Stock cannot be negative');
        return;
      }

      const response = await axios.patch('http://localhost:5000/api/inventory/stock', {
        id: selectedProduct.id,
        stock: newStockLevel,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.success) {
        const updatedInventory = inventory.map(item => {
          if (item.id === selectedProduct.id) {
            const updatedItem = { ...item, stock: newStockLevel };
            updatedItem.status = calculateStatus(updatedItem.stock, updatedItem.reorder_level);
            return updatedItem;
          }
          return item;
        });
        
        setInventory(updatedInventory);
        fetchInsights();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      setError('Failed to update stock');
    }
  };

  // Handle reorder level update
  const handleReorderLevelUpdate = async () => {
    try {
      if (!selectedProduct || !selectedProduct.id) {
        console.error('No product selected');
        return;
      }

      const token = localStorage.getItem('token');
      const newReorderLevel = parseInt(stockUpdate.newReorderLevel);
      
      if (newReorderLevel < 0) {
        setError('Reorder level cannot be negative');
        return;
      }

      const response = await axios.patch('http://localhost:5000/api/inventory/reorder-level', {
        id: selectedProduct.id,
        reorderLevel: newReorderLevel,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.success) {
        const updatedInventory = inventory.map(item => {
          if (item.id === selectedProduct.id) {
            const updatedItem = { ...item, reorder_level: newReorderLevel };
            updatedItem.status = calculateStatus(updatedItem.stock, updatedItem.reorder_level);
            return updatedItem;
          }
          return item;
        });
        
        setInventory(updatedInventory);
        fetchInsights();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating reorder level:', error);
      setError('Failed to update reorder level');
    }
  };

  // Handle update based on type
  const handleUpdate = () => {
    if (updateType === 'stock') handleStockUpdate();
    else handleReorderLevelUpdate();
  };

  // Get badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "In Stock": return "success";
      case "Low Stock": return "warning";
      case "Out of Stock": return "danger";
      default: return "secondary";
    }
  };

  // Get preview status based on updates
  const getPreviewStatus = () => {
    if (!selectedProduct) return "";
    
    if (updateType === 'stock') {
      const newStock = parseInt(selectedProduct.stock) + parseInt(stockUpdate.addStock || 0);
      return calculateStatus(newStock, selectedProduct.reorder_level);
    } else {
      const newReorderLevel = parseInt(stockUpdate.newReorderLevel || 0);
      return calculateStatus(selectedProduct.stock, newReorderLevel);
    }
  };

  if (loading) {
    return (
      <div className="tab-pane fade show active">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-pane fade show active">
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header and Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="mb-0 fw-bold fs-2">Inventory Management</h2>        <div>
          <button className="btn btn-outline-secondary me-2">
            <BiDownload className="me-2" /> Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              fetchInventory();
              fetchInsights();
            }}
          >
            <BiPlusCircle className="me-2" /> Refresh Inventory
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-light h-100">
            <div className="card-body">
              <h6 className="card-title">Total Products</h6>
              <h3 className="card-text text-primary">{inventoryStats.totalProducts}</h3>
              <p className="card-text text-muted">
                <small>Across all categories</small>
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light h-100">
            <div className="card-body">
              <h6 className="card-title">In Stock</h6>
              <h3 className="card-text text-success">{inventoryStats.inStock}</h3>
              <p className="card-text text-muted">
                <small>Available for sale</small>
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light h-100">
            <div className="card-body">
              <h6 className="card-title">Low Stock</h6>
              <h3 className="card-text text-warning">{inventoryStats.lowStock}</h3>
              <p className="card-text text-muted">
                <small>Below threshold</small>
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light h-100">
            <div className="card-body">
              <h6 className="card-title">Out of Stock</h6>
              <h3 className="card-text text-danger">{inventoryStats.outOfStock}</h3>
              <p className="card-text text-muted">
                <small>Need restock</small>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Inventory Insights */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <BiBulb className="me-2" /> AI-Powered Inventory Insights
          </h5>
        </div>
        <div className="card-body">
          {insightsError && (
            <Alert variant="danger" dismissible onClose={() => setInsightsError(null)}>
              {insightsError}
            </Alert>
          )}
          {insightsLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading insights...</span>
              </div>
            </div>
          ) : (
            <Alert variant="info">
              <h6>
                <BiBulb className="me-2" /> Priority Restocking Recommendations
              </h6>
              <p className="mb-2">
                📊 <strong>{insights.length} insights available!</strong> Below are the top priority recommendations. Click the <BiBulb className="mx-1" /> icons in the table to view all insights.
              </p>
              {insights.slice(0, 3).map(insight => {
                const priority = getPriorityInfo(insight.priority_score);
                return (
                  <div key={insight.product_id} className="border rounded p-2 mb-2 bg-light">
                    <strong>{insight.product_name}</strong> ({insight.category}) - <Badge bg={priority.class}>{priority.label}</Badge>
                    <p className="mb-0">{insight.insight}</p>
                  </div>
                );
              })}
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => document.getElementById('inventory-table').scrollIntoView({ behavior: 'smooth' })}
                className="mt-2"
              >
                View All Insights
              </Button>
            </Alert>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card shadow-sm" id="inventory-table">
        <div className="card-body p-0">
          <div className="d-flex justify-content-between align-items-center p-3">
            <Form.Group controlId="categoryFilter">
              <Form.Label className="me-2">Filter by Category</Form.Label>
              <Form.Select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                style={{ width: '200px', display: 'inline-block' }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Sort by Priority"
              checked={sortByPriority}
              onChange={() => setSortByPriority(!sortByPriority)}
              className="ms-3"
            />
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map(product => {
                    const insight = insights.find(i => i.product_id === product.id);
                    const priority = insight ? getPriorityInfo(insight.priority_score) : { class: 'info', label: 'Low' };
                    return (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td className="fw-semibold">{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.stock}</td>
                        <td>{product.reorder_level}</td>
                        <td>
                          <Badge bg={getStatusBadgeColor(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleShowModal(product, 'stock')}
                              title="Update Stock"
                            >
                              Stock
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleShowModal(product, 'reorder')}
                              title="Update Reorder Level"
                            >
                              <BiEdit />
                            </button>
                            {insight && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>View {priority.label} Insight</Tooltip>}
                              >
                                <button
                                  className={`btn btn-sm btn-outline-${priority.class}`}
                                  onClick={() => handleShowInsightModal(product)}
                                  aria-label={`View ${priority.label} insight for ${product.name}`}
                                >
                                  <BiBulb />
                                </button>
                              </OverlayTrigger>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center p-3">
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages).keys()].map(page => (
                <Pagination.Item
                  key={page + 1}
                  active={page + 1 === currentPage}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {updateType === 'stock' ? 'Update Stock' : 'Update Reorder Level'} - {selectedProduct?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedProduct?.name || ""}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedProduct?.category || ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Current Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={selectedProduct?.stock || 0}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Current Reorder Level</label>
                  <input
                    type="number"
                    className="form-control"
                    value={selectedProduct?.reorder_level || 0}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Current Status</label>
              <div>
                <Badge bg={getStatusBadgeColor(selectedProduct?.status)} className="fs-6">
                  {selectedProduct?.status}
                </Badge>
              </div>
            </div>

            {updateType === 'stock' ? (
              <>
                <div className="mb-3">
                  <label htmlFor="addStock" className="form-label">
                    Add/Subtract Stock
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="addStock"
                    name="addStock"
                    value={stockUpdate.addStock}
                    onChange={handleInputChange}
                    placeholder="e.g., 10 to add, -5 to subtract"
                  />
                  <div className="form-text">
                    Enter positive number to add stock, negative to subtract
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Stock Level (Preview)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={(parseInt(selectedProduct?.stock || 0) + parseInt(stockUpdate.addStock || 0))}
                    readOnly
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </>
            ) : (
              <div className="mb-3">
                <label htmlFor="newReorderLevel" className="form-label">
                  New Reorder Level
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="newReorderLevel"
                  name="newReorderLevel"
                  min="0"
                  value={stockUpdate.newReorderLevel}
                  onChange={handleInputChange}
                  placeholder="Enter new reorder level"
                />
                <div className="form-text">
                  Products will show as "Low Stock" when inventory falls to or below this level
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">New Status (Preview)</label>
              <div>
                <Badge bg={getStatusBadgeColor(getPreviewStatus())} className="fs-6">
                  {getPreviewStatus()}
                </Badge>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="stockNotes" className="form-label">
                Notes (Optional)
              </label>
              <textarea
                className="form-control"
                id="stockNotes"
                name="notes"
                rows="2"
                value={stockUpdate.notes}
                onChange={handleInputChange}
                placeholder="Add any notes about this update..."
              ></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdate}
            disabled={
              updateType === 'stock' 
                ? (!stockUpdate.addStock || stockUpdate.addStock === 0)
                : (stockUpdate.newReorderLevel === selectedProduct?.reorder_level)
            }
          >
            {updateType === 'stock' ? 'Update Stock' : 'Update Reorder Level'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Insight Modal */}
      <Modal show={showInsightModal} onHide={handleCloseInsightModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <BiBulb className="me-2" /> Insight for {selectedInsight?.product_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInsight && (
            <div>
              <p><strong>Priority:</strong> <Badge bg={getPriorityInfo(selectedInsight.priority_score).class}>
                {getPriorityInfo(selectedInsight.priority_score).label}
              </Badge></p>
              <p><strong>Category:</strong> {selectedInsight.category}</p>
              <p><strong>Recommendation:</strong> {selectedInsight.insight}</p>
              <p><strong>Suggested Restock:</strong> {selectedInsight.restock_quantity} units</p>
              <p><strong>Current Stock:</strong> {selectedInsight.current_stock} units</p>
              <p><strong>Views:</strong> {selectedInsight.views}</p>
              <p><strong>Sales:</strong> {selectedInsight.sales} units</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={() => {
              const product = inventory.find(p => p.id === selectedInsight.product_id);
              handleCloseInsightModal();
              handleShowModal(product, 'stock');
            }}
          >
            Update Stock
          </Button>
          <Button variant="secondary" onClick={handleCloseInsightModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InventoryTab;
