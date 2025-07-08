const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token'
      });
    }
  
    // Handle token expiration
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired'
      });
    }
  
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        messages
      });
    }
  
    // Handle other errors
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal Server Error';
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;