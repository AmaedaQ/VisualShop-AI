// const ProductDetail = require("../models/productDetailModel");
// const Review = require("../models/reviewModel");

// const productDetailController = {
//   // Get all product details
//   getAllProductDetails: async (req, res) => {
//     try {
//       const productDetails = await ProductDetail.getAll();
//       res.status(200).json(productDetails);
//     } catch (error) {
//       console.error("Error retrieving product details:", error);
//       res.status(500).json({
//         message: "Error retrieving product details",
//         error: error.message,
//       });
//     }
//   },

//   // Get product detail by ID with reviews
//   getProductDetailById: async (req, res) => {
//     try {
//       const productId = parseInt(req.params.id);
//       if (isNaN(productId)) {
//         return res.status(400).json({ message: "Invalid product ID" });
//       }

//       // Fetch product details
//       const productDetail = await ProductDetail.getById(productId);

//       if (!productDetail) {
//         return res.status(404).json({ message: "Product detail not found" });
//       }

//       // Fetch reviews data in parallel for better performance
//       const [reviews, averageRating, reviewCount] = await Promise.all([
//         Review.getByProductId(productId).catch(err => {
//           console.warn(`Error fetching reviews for product ${productId}:`, err);
//           return [];
//         }),
//         Review.getAverageRating(productId).catch(err => {
//           console.warn(`Error fetching average rating for product ${productId}:`, err);
//           return 0;
//         }),
//         Review.getReviewCount(productId).catch(err => {
//           console.warn(`Error fetching review count for product ${productId}:`, err);
//           return 0;
//         })
//       ]);

//       // Combine product details with review data (removed redundant reviews array)
//       const productWithReviews = {
//         ...productDetail,
//         reviewsData: {
//           averageRating: averageRating || 0,
//           reviewCount: reviewCount || 0,
//           reviews: reviews || []
//         }
//       };

//       res.status(200).json(productWithReviews);
//     } catch (error) {
//       console.error(
//         `Error retrieving product detail with ID ${req.params.id}:`,
//         error
//       );
//       res.status(500).json({
//         message: "Error retrieving product detail",
//         error: error.message,
//       });
//     }
//   },

//   // Create a new product detail
//   createProductDetail: async (req, res) => {
//     try {
//       const productDetail = req.body;

//       // Validate required fields
//       if (!productDetail.name || !productDetail.price) {
//         return res
//           .status(400)
//           .json({ message: "Name and price are required fields" });
//       }

//       const createdProductDetail = await ProductDetail.create(productDetail);
//       res.status(201).json(createdProductDetail);
//     } catch (error) {
//       console.error("Error creating product detail:", error);
//       res.status(500).json({
//         message: "Error creating product detail",
//         error: error.message,
//       });
//     }
//   },

//   // Update product detail
//   updateProductDetail: async (req, res) => {
//     try {
//       const productId = parseInt(req.params.id);
//       if (isNaN(productId)) {
//         return res.status(400).json({ message: "Invalid product ID" });
//       }

//       const productDetail = req.body;

//       // Check if product exists
//       const existingProduct = await ProductDetail.getById(productId);
//       if (!existingProduct) {
//         return res.status(404).json({ message: "Product detail not found" });
//       }

//       const updatedProductDetail = await ProductDetail.update(
//         productId,
//         productDetail
//       );
//       res.status(200).json(updatedProductDetail);
//     } catch (error) {
//       console.error(
//         `Error updating product detail with ID ${req.params.id}:`,
//         error
//       );
//       res.status(500).json({
//         message: "Error updating product detail",
//         error: error.message,
//       });
//     }
//   },

//   // Delete product detail
//   deleteProductDetail: async (req, res) => {
//     try {
//       const productId = parseInt(req.params.id);
//       if (isNaN(productId)) {
//         return res.status(400).json({ message: "Invalid product ID" });
//       }

//       // Check if product exists
//       const existingProduct = await ProductDetail.getById(productId);
//       if (!existingProduct) {
//         return res.status(404).json({ message: "Product detail not found" });
//       }

//       const deleted = await ProductDetail.delete(productId);

//       if (deleted) {
//         res
//           .status(200)
//           .json({ message: "Product detail deleted successfully" });
//       } else {
//         res.status(500).json({ message: "Failed to delete product detail" });
//       }
//     } catch (error) {
//       console.error(
//         `Error deleting product detail with ID ${req.params.id}:`,
//         error
//       );
//       res.status(500).json({
//         message: "Error deleting product detail",
//         error: error.message,
//       });
//     }
//   },
// };

// module.exports = productDetailController;


const ProductDetail = require("../models/productDetailModel");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const { protect, authorize } = require("../middlewares/authMiddleware");

const productDetailController = {
  // Get all product details
  getAllProductDetails: async (req, res) => {
    try {
      const productDetails = await ProductDetail.getAll();
      res.status(200).json(productDetails);
    } catch (error) {
      console.error("Error retrieving product details:", error);
      res.status(500).json({
        message: "Error retrieving product details",
        error: error.message,
      });
    }
  },

  // Get product detail by ID with reviews
  getProductDetailById: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Fetch product details
      const productDetail = await ProductDetail.getById(productId);

      if (!productDetail) {
        return res.status(404).json({ message: "Product detail not found" });
      }

      // Fetch reviews data in parallel for better performance
      const [reviews, averageRating, reviewCount] = await Promise.all([
        Review.getByProductId(productId).catch(err => {
          console.warn(`Error fetching reviews for product ${productId}:`, err);
          return [];
        }),
        Review.getAverageRating(productId).catch(err => {
          console.warn(`Error fetching average rating for product ${productId}:`, err);
          return 0;
        }),
        Review.getReviewCount(productId).catch(err => {
          console.warn(`Error fetching review count for product ${productId}:`, err);
          return 0;
        })
      ]);

      // Combine product details with review data
      const productWithReviews = {
        ...productDetail,
        reviewsData: {
          averageRating: averageRating || 0,
          reviewCount: reviewCount || 0,
          reviews: reviews || []
        }
      };

      res.status(200).json(productWithReviews);
    } catch (error) {
      console.error(
        `Error retrieving product detail with ID ${req.params.id}:`,
        error
      );
      res.status(500).json({
        message: "Error retrieving product detail",
        error: error.message,
      });
    }
  },

  // Create a new product detail
  createProductDetail: async (req, res) => {
    try {
      const productDetail = req.body;
      const sellerId = req.user.id;

      // Validate required fields
      if (!productDetail.name || !productDetail.price || !productDetail.id) {
        return res
          .status(400)
          .json({ message: "Name, price, and product ID are required fields" });
      }

      const productId = parseInt(productDetail.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Verify product exists and belongs to the seller
      const product = await Product.getById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.seller_id !== sellerId) {
        return res.status(403).json({ message: "Unauthorized: Seller ID does not match" });
      }

      // Fetch product image and construct images array
      const productName = productDetail.name.replace(/\s+/g, '+');
      const images = [
        product.image || "/assets/images/default.jpg",
        `https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=${productName}+Angle+1`,
        `https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=${productName}+Angle+2`,
        `https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=${productName}+Details`
      ];

      // Prepare product detail with images and optional relatedProducts
      const preparedDetail = {
        ...productDetail,
        images,
        relatedProducts: productDetail.relatedProducts || null
      };

      const createdProductDetail = await ProductDetail.create(preparedDetail);
      res.status(201).json(createdProductDetail);
    } catch (error) {
      console.error("Error creating product detail:", error);
      res.status(500).json({
        message: "Error creating product detail",
        error: error.message,
      });
    }
  },

  // Update product detail
  updateProductDetail: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const sellerId = req.user.id;

      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Check if product exists and belongs to the seller
      const product = await Product.getById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.seller_id !== sellerId) {
        return res.status(403).json({ message: "Unauthorized: Seller ID does not match" });
      }

      const productDetail = req.body;

      // Check if product detail exists
      const existingDetail = await ProductDetail.getById(productId);
      if (!existingDetail) {
        return res.status(404).json({ message: "Product detail not found" });
      }

      // Update images array if not provided, using product image and placeholders
      if (!productDetail.images) {
        const productName = productDetail.name ? productDetail.name.replace(/\s+/g, '+') : product.name.replace(/\s+/g, '+');
        productDetail.images = [
          product.image || "/assets/images/default.jpg",
          `https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=${productName}+Angle+1`,
          `https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=${productName}+Angle+2`,
          `https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=${productName}+Details`
        ];
      }

      const updatedProductDetail = await ProductDetail.update(productId, {
        ...productDetail,
        relatedProducts: productDetail.relatedProducts || null
      });
      res.status(200).json(updatedProductDetail);
    } catch (error) {
      console.error(
        `Error updating product detail with ID ${req.params.id}:`,
        error
      );
      res.status(500).json({
        message: "Error updating product detail",
        error: error.message,
      });
    }
  },

  // Delete product detail
  deleteProductDetail: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const sellerId = req.user.id;

      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Check if product exists and belongs to the seller
      const product = await Product.getById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.seller_id !== sellerId) {
        return res.status(403).json({ message: "Unauthorized: Seller ID does not match" });
      }

      // Check if product detail exists
      const existingDetail = await ProductDetail.getById(productId);
      if (!existingDetail) {
        return res.status(404).json({ message: "Product detail not found" });
      }

      const deleted = await ProductDetail.delete(productId);

      if (deleted) {
        res.status(200).json({ message: "Product detail deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete product detail" });
      }
    } catch (error) {
      console.error(
        `Error deleting product detail with ID ${req.params.id}:`,
        error
      );
      res.status(500).json({
        message: "Error deleting product detail",
        error: error.message,
      });
    }
  },
};

module.exports = productDetailController;