// src/middlewares/errorHandler.middleware.js
const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error (optional)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
};

module.exports = errorHandler;
// This middleware should be the last one in your middleware stack
