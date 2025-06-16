const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid.' 
    });
  }
};

// Middleware to check for admin role
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Middleware to check for sale role
const saleAuth = (req, res, next) => {
  if (req.user && req.user.role === 'Sale') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Sale privileges required.' 
    });
  }
};

// Middleware to check for admin or sale role
const adminOrSaleAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Sale')) {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Insufficient privileges.' 
    });
  }
};

module.exports = {
  auth,
  adminAuth,
  adminOnly: adminAuth,
  saleAuth,
  adminOrSaleAuth
}; 