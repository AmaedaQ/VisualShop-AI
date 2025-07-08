// import React, { useState, useEffect } from "react";
// import { BiDownload, BiPlusCircle, BiBulb, BiEdit } from "react-icons/bi";
// import { Modal, Button, Badge, Alert } from "react-bootstrap";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";

// const InventoryTab = () => {
//   const { isAuthenticated, isSeller } = useAuth();
//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [updateType, setUpdateType] = useState('stock'); // 'stock' or 'reorder'
//   const [stockUpdate, setStockUpdate] = useState({
//     addStock: 0,
//     newReorderLevel: 0,
//     notes: "",
//   });

//   // Calculate status based on stock and reorder level
//   const calculateStatus = (stock, reorderLevel) => {
//     const stockNum = Number(stock) || 0;
//     const reorderNum = Number(reorderLevel) || 0;
    
//     if (stockNum === 0) {
//       return "Out of Stock";
//     } else if (stockNum <= reorderNum) {
//       return "Low Stock";
//     } else {
//       return "In Stock";
//     }
//   };

//   // Fetch inventory from backend
//   useEffect(() => {
//     if (isAuthenticated && isSeller) {
//       fetchInventory();
//     }
//   }, [isAuthenticated, isSeller]);

//   const fetchInventory = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       const response = await axios.get("http://localhost:5000/api/inventory", {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         withCredentials: true
//       });

//       // Calculate status for each item in frontend
//       const inventoryWithStatus = (response.data || []).map(item => ({
//         ...item,
//         status: calculateStatus(item.stock, item.reorder_level)
//       }));

//       console.log('Inventory with status:', inventoryWithStatus);
//       setInventory(inventoryWithStatus);
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching inventory:', error);
//       setError('Failed to fetch inventory');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate inventory stats based on actual data
//   const inventoryStats = {
//     totalProducts: inventory.length,
//     inStock: inventory.filter((item) => item.status === "In Stock").length,
//     lowStock: inventory.filter((item) => item.status === "Low Stock").length,
//     outOfStock: inventory.filter((item) => item.status === "Out of Stock").length,
//   };

//   // Open update modal
//   const handleShowModal = (product, type = 'stock') => {
//     console.log('Selected product:', product, 'Type:', type);
//     setSelectedProduct(product);
//     setUpdateType(type);
//     setStockUpdate({
//       addStock: 0,
//       newReorderLevel: product.reorder_level || 0,
//       notes: "",
//     });
//     setShowModal(true);
//   };

//   // Close modal
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedProduct(null);
//     setStockUpdate({ addStock: 0, newReorderLevel: 0, notes: "" });
//     setUpdateType('stock');
//   };

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setStockUpdate((prev) => ({
//       ...prev,
//       [name]: name === "addStock" || name === "newReorderLevel" ? parseInt(value) || 0 : value,
//     }));
//   };

//   // Handle stock update
//   const handleStockUpdate = async () => {
//     try {
//       if (!selectedProduct || !selectedProduct.id) {
//         console.error('No product selected');
//         return;
//       }

//       const token = localStorage.getItem('token');
//       const newStockLevel = parseInt(selectedProduct.stock) + parseInt(stockUpdate.addStock);
      
//       if (newStockLevel < 0) {
//         setError('Stock cannot be negative');
//         return;
//       }

//       console.log('Updating stock:', {
//         id: selectedProduct.id,
//         currentStock: selectedProduct.stock,
//         addStock: stockUpdate.addStock,
//         newStock: newStockLevel
//       });

//       const response = await axios.patch('http://localhost:5000/api/inventory/stock', {
//         id: selectedProduct.id,
//         stock: newStockLevel,
//       }, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         withCredentials: true
//       });

//       if (response.data.success) {
//         // Update local state with new stock and recalculated status
//         const updatedInventory = inventory.map(item => {
//           if (item.id === selectedProduct.id) {
//             const updatedItem = { ...item, stock: newStockLevel };
//             updatedItem.status = calculateStatus(updatedItem.stock, updatedItem.reorder_level);
//             return updatedItem;
//           }
//           return item;
//         });
        
//         setInventory(updatedInventory);
//         handleCloseModal();
//         console.log('Stock updated successfully');
//       }
//     } catch (error) {
//       console.error('Error updating stock:', error);
//       setError('Failed to update stock');
//     }
//   };

//   // Handle reorder level update
//   const handleReorderLevelUpdate = async () => {
//     try {
//       if (!selectedProduct || !selectedProduct.id) {
//         console.error('No product selected');
//         return;
//       }

//       const token = localStorage.getItem('token');
//       const newReorderLevel = parseInt(stockUpdate.newReorderLevel);
      
//       if (newReorderLevel < 0) {
//         setError('Reorder level cannot be negative');
//         return;
//       }

//       console.log('Updating reorder level:', {
//         id: selectedProduct.id,
//         currentReorderLevel: selectedProduct.reorder_level,
//         newReorderLevel: newReorderLevel
//       });

//       const response = await axios.patch('http://localhost:5000/api/inventory/reorder-level', {
//         id: selectedProduct.id,
//         reorderLevel: newReorderLevel,
//       }, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         withCredentials: true
//       });

//       if (response.data.success) {
//         // Update local state with new reorder level and recalculated status
//         const updatedInventory = inventory.map(item => {
//           if (item.id === selectedProduct.id) {
//             const updatedItem = { ...item, reorder_level: newReorderLevel };
//             updatedItem.status = calculateStatus(updatedItem.stock, updatedItem.reorder_level);
//             return updatedItem;
//           }
//           return item;
//         });
        
//         setInventory(updatedInventory);
//         handleCloseModal();
//         console.log('Reorder level updated successfully');
//       }
//     } catch (error) {
//       console.error('Error updating reorder level:', error);
//       setError('Failed to update reorder level');
//     }
//   };

//   // Handle update based on type
//   const handleUpdate = () => {
//     if (updateType === 'stock') {
//       handleStockUpdate();
//     } else {
//       handleReorderLevelUpdate();
//     }
//   };

//   // Get badge color based on status
//   const getStatusBadgeColor = (status) => {
//     switch (status) {
//       case "In Stock":
//         return "success";
//       case "Low Stock":
//         return "warning";
//       case "Out of Stock":
//         return "danger";
//       default:
//         return "secondary";
//     }
//   };

//   // Get preview status based on updates
//   const getPreviewStatus = () => {
//     if (!selectedProduct) return "";
    
//     if (updateType === 'stock') {
//       const newStock = parseInt(selectedProduct.stock) + parseInt(stockUpdate.addStock || 0);
//       return calculateStatus(newStock, selectedProduct.reorder_level);
//     } else {
//       const newReorderLevel = parseInt(stockUpdate.newReorderLevel || 0);
//       return calculateStatus(selectedProduct.stock, newReorderLevel);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="tab-pane fade show active">
//         <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="tab-pane fade show active">
//       {/* Error Alert */}
//       {error && (
//         <Alert variant="danger" dismissible onClose={() => setError(null)}>
//           {error}
//         </Alert>
//       )}

//       {/* Header and Action Buttons */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h3 className="mb-0">Inventory Management</h3>
//         <div>
//           <button className="btn btn-outline-secondary me-2">
//             <BiDownload className="me-2" /> Export
//           </button>
//           <button
//             className="btn btn-primary"
//             onClick={() => fetchInventory()}
//           >
//             <BiPlusCircle className="me-2" /> Refresh Inventory
//           </button>
//         </div>
//       </div>

//       {/* Inventory Stats */}
//       <div className="row g-3 mb-4">
//         <div className="col-md-3">
//           <div className="card bg-light h-100">
//             <div className="card-body">
//               <h6 className="card-title">Total Products</h6>
//               <h3 className="card-text text-primary">{inventoryStats.totalProducts}</h3>
//               <p className="card-text text-muted">
//                 <small>Across all categories</small>
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-3">
//           <div className="card bg-light h-100">
//             <div className="card-body">
//               <h6 className="card-title">In Stock</h6>
//               <h3 className="card-text text-success">{inventoryStats.inStock}</h3>
//               <p className="card-text text-muted">
//                 <small>Available for sale</small>
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-3">
//           <div className="card bg-light h-100">
//             <div className="card-body">
//               <h6 className="card-title">Low Stock</h6>
//               <h3 className="card-text text-warning">{inventoryStats.lowStock}</h3>
//               <p className="card-text text-muted">
//                 <small>Below threshold</small>
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-3">
//           <div className="card bg-light h-100">
//             <div className="card-body">
//               <h6 className="card-title">Out of Stock</h6>
//               <h3 className="card-text text-danger">{inventoryStats.outOfStock}</h3>
//               <p className="card-text text-muted">
//                 <small>Need restock</small>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* AI Inventory Insights */}
//       <div className="card mb-4 shadow-sm">
//         <div className="card-header bg-white">
//           <h5 className="mb-0">
//             <BiBulb className="me-2" /> AI-Powered Inventory Insights
//           </h5>
//         </div>
//         <div className="card-body">
//           <Alert variant="info">
//             <h6>
//               <BiBulb className="me-2" /> Smart Recommendations
//             </h6>
//             <p className="mb-0">
//               Based on current stock levels and reorder thresholds:
//             </p>
//             <ul className="mb-0">
//               {inventory.filter(item => item.status === "Low Stock").slice(0, 3).map(item => (
//                 <li key={item.id}>
//                   <strong>{item.name}</strong> ({item.stock} in stock) - Below reorder level of {item.reorder_level}
//                 </li>
//               ))}
//               {inventory.filter(item => item.status === "Out of Stock").slice(0, 2).map(item => (
//                 <li key={item.id}>
//                   <strong>{item.name}</strong> - Out of stock! Reorder level: {item.reorder_level}
//                 </li>
//               ))}
//               {inventory.filter(item => item.status === "Low Stock" || item.status === "Out of Stock").length === 0 && (
//                 <li>All products are well-stocked! 🎉</li>
//               )}
//             </ul>
//           </Alert>
//         </div>
//       </div>

//       {/* Inventory Table */}
//       <div className="card shadow-sm">
//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table table-hover mb-0">
//               <thead className="bg-light">
//                 <tr>
//                   <th>Product ID</th>
//                   <th>Product Name</th>
//                   <th>Category</th>
//                   <th>Current Stock</th>
//                   <th>Reorder Level</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {inventory.length > 0 ? (
//                   inventory.map((product) => (
//                     <tr key={product.id}>
//                       <td>{product.id}</td>
//                       <td className="fw-semibold">{product.name}</td>
//                       <td>{product.category}</td>
//                       <td>{product.stock}</td>
//                       <td>{product.reorder_level}</td>
//                       <td>
//                         <Badge bg={getStatusBadgeColor(product.status)}>
//                           {product.status}
//                         </Badge>
//                       </td>
//                       <td>
//                         <div className="btn-group" role="group">
//                           <button
//                             className="btn btn-sm btn-outline-primary"
//                             onClick={() => handleShowModal(product, 'stock')}
//                             title="Update Stock"
//                           >
//                             Stock
//                           </button>
//                           <button
//                             className="btn btn-sm btn-outline-secondary"
//                             onClick={() => handleShowModal(product, 'reorder')}
//                             title="Update Reorder Level"
//                           >
//                             <BiEdit />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="text-center py-4">
//                       No inventory items found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Update Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {updateType === 'stock' ? 'Update Stock' : 'Update Reorder Level'} - {selectedProduct?.name}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <form>
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">Product Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={selectedProduct?.name || ""}
//                     readOnly
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Category</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={selectedProduct?.category || ""}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">Current Stock</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={selectedProduct?.stock || 0}
//                     readOnly
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Current Reorder Level</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={selectedProduct?.reorder_level || 0}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Current Status</label>
//               <div>
//                 <Badge bg={getStatusBadgeColor(selectedProduct?.status)} className="fs-6">
//                   {selectedProduct?.status}
//                 </Badge>
//               </div>
//             </div>

//             {updateType === 'stock' ? (
//               <>
//                 <div className="mb-3">
//                   <label htmlFor="addStock" className="form-label">
//                     Add/Subtract Stock
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     id="addStock"
//                     name="addStock"
//                     value={stockUpdate.addStock}
//                     onChange={handleInputChange}
//                     placeholder="e.g., 10 to add, -5 to subtract"
//                   />
//                   <div className="form-text">
//                     Enter positive number to add stock, negative to subtract
//                   </div>
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">New Stock Level (Preview)</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={(parseInt(selectedProduct?.stock || 0) + parseInt(stockUpdate.addStock || 0))}
//                     readOnly
//                     style={{ backgroundColor: '#f8f9fa' }}
//                   />
//                 </div>
//               </>
//             ) : (
//               <div className="mb-3">
//                 <label htmlFor="newReorderLevel" className="form-label">
//                   New Reorder Level
//                 </label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   id="newReorderLevel"
//                   name="newReorderLevel"
//                   min="0"
//                   value={stockUpdate.newReorderLevel}
//                   onChange={handleInputChange}
//                   placeholder="Enter new reorder level"
//                 />
//                 <div className="form-text">
//                   Products will show as "Low Stock" when inventory falls to or below this level
//                 </div>
//               </div>
//             )}

//             <div className="mb-3">
//               <label className="form-label">New Status (Preview)</label>
//               <div>
//                 <Badge bg={getStatusBadgeColor(getPreviewStatus())} className="fs-6">
//                   {getPreviewStatus()}
//                 </Badge>
//               </div>
//             </div>

//             <div className="mb-3">
//               <label htmlFor="stockNotes" className="form-label">
//                 Notes (Optional)
//               </label>
//               <textarea
//                 className="form-control"
//                 id="stockNotes"
//                 name="notes"
//                 rows="2"
//                 value={stockUpdate.notes}
//                 onChange={handleInputChange}
//                 placeholder="Add any notes about this update..."
//               ></textarea>
//             </div>
//           </form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button 
//             variant="primary" 
//             onClick={handleUpdate}
//             disabled={
//               updateType === 'stock' 
//                 ? (!stockUpdate.addStock || stockUpdate.addStock === 0)
//                 : (stockUpdate.newReorderLevel === selectedProduct?.reorder_level)
//             }
//           >
//             {updateType === 'stock' ? 'Update Stock' : 'Update Reorder Level'}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default InventoryTab;


