const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

// Protect routes - Updated to handle both cookies and Authorization header
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback to cookies if no Authorization header
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Not authorized, no token" 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the database
    const [user] = await pool.execute(
      "SELECT id, email, role, account_type FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!user || user.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized, user not found" 
      });
    }

    req.user = user[0];
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ 
      success: false,
      message: "Not authorized, token failed" 
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };