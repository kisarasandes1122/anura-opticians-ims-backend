const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const { checkRequiredEnvVars } = require('./config/envConfig');

const PORT = process.env.PORT || 5000;

// Check environment variables
checkRequiredEnvVars();

// Connect to MongoDB
connectDB();

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    logger.info(`🔐 Auth Endpoints:`);
    logger.info(`   POST http://localhost:${PORT}/api/auth/login`);
    logger.info(`   GET  http://localhost:${PORT}/api/auth/me`);
    logger.info(`🏷️  Brand Endpoints:`);
    logger.info(`   GET  http://localhost:${PORT}/api/brands`);
    logger.info(`   POST http://localhost:${PORT}/api/brands (with image upload)`);
    logger.info(`📦 Item Endpoints:`);
    logger.info(`   GET  http://localhost:${PORT}/api/items (search & filter)`);
    logger.info(`   POST http://localhost:${PORT}/api/items`);
  }
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    
    // Close database connection
    const mongoose = require('mongoose');
    mongoose.connection.close(() => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force close server after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;