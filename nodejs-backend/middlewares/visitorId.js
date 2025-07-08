// middlewares/visitorId.js

module.exports = (req, res, next) => {
    const visitorId = req.headers['x-visitor-id'];
    if (visitorId) {
      req.visitor_id = visitorId;
    }
    next();
  };
  