require("dotenv").config();
const path = require("path");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const productRoutes = require("./routes/productRoutes");
const productDetailRoutes = require("./routes/productDetailRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbot");
const interactionRoutes = require("./routes/interactionRoutes");
const extractVisitorId = require("./middlewares/visitorId");
const recommendationsRoutes = require("./routes/recommendations");
const errorHandler = require("./middlewares/errorMiddleware");
const sellerOrderRoutes = require("./routes/sellerOrderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes"); // New import

const { pool, connectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from intellicart-react directory
app.use('/assets', express.static(path.join(__dirname, "..", "intellicart-react", "public", "assets")));

connectDB().then(() => {
  console.log("✅ DB connection established, starting server...");

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-visitor-id']
  }));

  app.use(extractVisitorId);

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Body:`, req.body);
    next();
  });

  app.use("/api/products", productRoutes);
  app.use("/api/product-details", productDetailRoutes);
  app.use("/api", reviewRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/chat", chatbotRoutes);
  app.use("/api/interactions", interactionRoutes);
  app.use("/api/recommendations", recommendationsRoutes);
  app.use("/api/seller/orders", sellerOrderRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/analytics", analyticsRoutes); // Register analytics routes

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString()
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.path
    });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🟢 Listening on port ${PORT}`);
  });
}).catch(err => {
  console.error("❌ Failed to connect to DB, server not started:", err);
});