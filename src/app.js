const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./config/logger');
const { generalLimiter, helmetConfig } = require('./middleware/security');

const app = express();

// Trust proxy for accurate IP addresses when behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);

// Compression middleware
app.use(compression());

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use(generalLimiter);

// CORS middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://192.168.8.153:3000',
    'https://anura-opticians-ims.vercel.app/',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      logger.error('Invalid JSON payload received');
      res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON payload' 
      });
      return;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced health check
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'Anura Opticians API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version
  };

  // Check database connection
  const mongoose = require('mongoose');
  healthCheck.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  logger.info('Health check requested', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });

  res.json(healthCheck);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/products', require('./routes/products'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Request logging middleware (after routes)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error('Application error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(err.status || 500).json({ 
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;