// const Inventory = require("../models/inventoryModel");

// const getInventory = async (req, res) => {
//   try {
//     const seller_id = req.user.id;
//     console.log('Fetching inventory for seller:', seller_id); // Debug log
    
//     const inventory = await Inventory.getInventory(seller_id);
//     console.log('Raw inventory data:', inventory); // Debug log
    
//     // Format inventory data (status will be calculated in frontend)
//     const formattedInventory = inventory.map(item => {
//       return {
//         id: item.id,
//         name: item.name,
//         category: item.category,
//         stock: Number(item.stock) || 0,
//         reorder_level: Number(item.reorder_level) || 0
//       };
//     });
    
//     console.log('Formatted inventory:', formattedInventory); // Debug log
//     res.status(200).json(formattedInventory);
//   } catch (error) {
//     console.error("Error fetching inventory:", error);
//     res.status(500).json({ error: "Failed to fetch inventory" });
//   }
// };

// const updateStock = async (req, res) => {
//   try {
//     const { id, stock } = req.body;
//     const seller_id = req.user.id;
    
//     console.log('Update stock request:', { id, stock, seller_id }); // Debug log
    
//     // Validate input
//     if (!id || stock === undefined || stock === null) {
//       return res.status(400).json({ error: "Product ID and stock are required" });
//     }

//     // Ensure stock is a valid number and not negative
//     const newStock = parseInt(stock);
//     if (isNaN(newStock) || newStock < 0) {
//       return res.status(400).json({ error: "Stock must be a valid non-negative number" });
//     }

//     const affectedRows = await Inventory.updateStock(id, seller_id, newStock);
//     console.log('Affected rows:', affectedRows); // Debug log
    
//     if (affectedRows === 0) {
//       return res.status(404).json({ error: "Product not found or unauthorized" });
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       message: "Stock updated successfully",
//       newStock: newStock 
//     });
//   } catch (error) {
//     console.error("Error updating stock:", error);
//     res.status(500).json({ error: "Failed to update stock" });
//   }
// };

// const updateReorderLevel = async (req, res) => {
//   try {
//     const { id, reorderLevel } = req.body;
//     const seller_id = req.user.id;
    
//     console.log('Update reorder level request:', { id, reorderLevel, seller_id }); // Debug log
    
//     // Validate input
//     if (!id || reorderLevel === undefined || reorderLevel === null) {
//       return res.status(400).json({ error: "Product ID and reorder level are required" });
//     }

//     // Ensure reorder level is a valid number and not negative
//     const newReorderLevel = parseInt(reorderLevel);
//     if (isNaN(newReorderLevel) || newReorderLevel < 0) {
//       return res.status(400).json({ error: "Reorder level must be a valid non-negative number" });
//     }

//     const affectedRows = await Inventory.updateReorderLevel(id, seller_id, newReorderLevel);
//     console.log('Affected rows:', affectedRows); // Debug log
    
//     if (affectedRows === 0) {
//       return res.status(404).json({ error: "Product not found or unauthorized" });
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       message: "Reorder level updated successfully",
//       newReorderLevel: newReorderLevel 
//     });
//   } catch (error) {
//     console.error("Error updating reorder level:", error);
//     res.status(500).json({ error: "Failed to update reorder level" });
//   }
// };

// module.exports = {
//   getInventory,
//   updateStock,
//   updateReorderLevel
// };



const Inventory = require("../models/inventoryModel");
const InventoryInsightsService = require("../services/inventoryInsightsService");

const getInventory = async (req, res) => {
  try {
    const seller_id = req.user.id;
    console.log('Fetching inventory for seller:', seller_id);
    
    const inventory = await Inventory.getInventory(seller_id);
    console.log('Raw inventory data:', inventory);
    
    const formattedInventory = inventory.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: Number(item.stock) || 0,
      reorder_level: Number(item.reorder_level) || 0
    }));
    
    console.log('Formatted inventory:', formattedInventory);
    res.status(200).json(formattedInventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

const getInsights = async (req, res) => {
  try {
    const seller_id = req.user.id;
    console.log('=== Inventory Insights Controller ===');
    console.log('Fetching insights for seller:', seller_id);

    // Fetch data
    const [inventory, interactions, sales] = await Promise.all([
      Inventory.getInventory(seller_id),
      Inventory.getInteractions(seller_id),
      Inventory.getSales(seller_id)
    ]);

    console.log('=== Data Fetch Results ===');
    console.log('Inventory count:', inventory.length, 'Sample:', inventory[0]);
    console.log('Interactions count:', interactions.length, 'Sample:', interactions[0]);
    console.log('Sales count:', sales.length, 'Sample:', sales[0]);

    // Generate insights
    console.log('=== Generating Insights ===');
    const insights = await InventoryInsightsService.generateInsights(
      inventory,
      interactions,
      sales
    );

    console.log('=== Final Response ===');
    console.log('Generated insights:', insights);
    res.status(200).json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ error: "Failed to fetch inventory insights" });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id, stock } = req.body;
    const seller_id = req.user.id;
    
    console.log('Update stock request:', { id, stock, seller_id });
    
    if (!id || stock === undefined || stock === null) {
      return res.status(400).json({ error: "Product ID and stock are required" });
    }

    const newStock = parseInt(stock);
    if (isNaN(newStock) || newStock < 0) {
      return res.status(400).json({ error: "Stock must be a valid non-negative number" });
    }

    const affectedRows = await Inventory.updateStock(id, seller_id, newStock);
    console.log('Affected rows:', affectedRows);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Stock updated successfully",
      newStock: newStock 
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
};

const updateReorderLevel = async (req, res) => {
  try {
    const { id, reorderLevel } = req.body;
    const seller_id = req.user.id;
    
    console.log('Update reorder level request:', { id, reorderLevel, seller_id });
    
    if (!id || reorderLevel === undefined || reorderLevel === null) {
      return res.status(400).json({ error: "Product ID and reorder level are required" });
    }

    const newReorderLevel = parseInt(reorderLevel);
    if (isNaN(newReorderLevel) || newReorderLevel < 0) {
      return res.status(400).json({ error: "Reorder level must be a valid non-negative number" });
    }

    const affectedRows = await Inventory.updateReorderLevel(id, seller_id, newReorderLevel);
    console.log('Affected rows:', affectedRows);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Reorder level updated successfully",
      newReorderLevel: newReorderLevel 
    });
  } catch (error) {
    console.error("Error updating reorder level:", error);
    res.status(500).json({ error: "Failed to update reorder level" });
  }
};

module.exports = {
  getInventory,
  getInsights,
  updateStock,
  updateReorderLevel
};