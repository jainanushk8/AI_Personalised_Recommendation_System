const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('AUTH MIDDLEWARE - Authorization Header:', authHeader); // ADDED

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('AUTH MIDDLEWARE - No Bearer token found'); // ADDED
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    console.log('AUTH MIDDLEWARE - Token:', token); // ADDED

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('AUTH MIDDLEWARE - Decoded Token:', decoded); // ADDED
      req.user = await User.findById(decoded.userId);
      console.log('AUTH MIDDLEWARE - Found User:', req.user); // ADDED
      if (!req.user) {
        console.log('AUTH MIDDLEWARE - User not found in database'); // ADDED
        return res.status(401).json({ message: 'Authentication failed' });
      }
      console.log('AUTH MIDDLEWARE - User attached to request:', req.user); // ADDED
      next();
      console.log('AUTH MIDDLEWARE - next() called'); // ADDED
    } catch (jwtError) {
      console.error('AUTH MIDDLEWARE - JWT Verification Error:', jwtError); // ADDED
      return res.status(401).json({ message: 'Authentication failed' });
    }

  } catch (error) {
    console.error('AUTH MIDDLEWARE - General Error:', error); // ADDED
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('AUTH MIDDLEWARE - Authorization failed for roles:', roles, 'user role:', req.user ? req.user.role : 'null'); // ADDED
      return res.status(403).json({ message: 'Unauthorized' });
    }
    console.log('AUTH MIDDLEWARE - Authorization successful for role:', req.user.role); // ADDED
    next();
  };
};

module.exports = { authenticate, authorize };