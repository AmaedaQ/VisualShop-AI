// routes/index.js
const express = require("express");
const router = express.Router();

// Sample test route
router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports = router;
