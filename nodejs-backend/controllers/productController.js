// controllers/productController.js
const Product = require("../models/productModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const category = req.body.category;
    const dir = path.join(
      __dirname,
      "..",
      "..",
      "intellicart-react",
      "public",
      "assets",
      "images",
      category
    );
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Get the original filename and extension
    const originalName = path.basename(file.originalname);
    const ext = path.extname(originalName).toLowerCase();
    
    // Sanitize the filename to remove unsafe characters
    const safeName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '_') // Replace non-alphanumeric chars with underscore
      .replace(/_+/g, '_'); // Replace multiple underscores with single underscore
    
    // Keep the original extension
    const finalName = safeName + ext;
    cb(null, finalName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG, JPG, and PNG files are allowed!"));
  },
}).single("image");

const getProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Product.getProductsBySeller(sellerId);
    
    // Add status field to each product based on stock level and reorder level
    const productsWithStatus = products.map(product => ({
      ...product,
      status: product.stock <= (product.reorder_level || 20) 
        ? product.stock === 0 
          ? "Out of Stock" 
          : "Low Stock"
        : "In Stock"
    }));
    
    res.status(200).json({ products: productsWithStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      const { name, price, category, stock, reorderLevel } = req.body;
      const seller_id = req.user.id;
      const image = req.file
        ? `/assets/images/${category}/${req.file.filename}`
        : null;

      if (!category) {
        return res.status(400).json({ error: "Category is required for image upload" });
      }

      const productId = await Product.addProduct({
        name,
        price: parseFloat(price),
        category,
        image,
        seller_id,
        stock: parseInt(stock),
        reorderLevel: parseInt(reorderLevel) || 20
      });
      res.status(201).json({ success: true, productId, image });
    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, stock, reorderLevel } = req.body;
    const seller_id = req.user.id;

    const affectedRows = await Product.updateProduct(id, { 
      name,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      reorderLevel: parseInt(reorderLevel) || 20,
      seller_id 
    });
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    const affectedRows = await Product.deleteProduct(id, seller_id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getProductsByName = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false,
        message: "Search query is required"
      });
    }

    // Search products by name
    const products = await Product.searchProducts(query);
    
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found",
        products: []
      });
    }

    // Format the response
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      rating: parseFloat(product.rating),
      image: product.image
    }));

    res.status(200).json({
      success: true,
      products: formattedProducts
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to search products"
    });
  }
};

module.exports = {
  getProducts,
  getSellerProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsByName
};