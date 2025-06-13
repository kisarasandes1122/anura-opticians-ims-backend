// Environment configuration
// Make sure to set these environment variables in your .env file

const requiredEnvVars = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Frontend URL for CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/anura-opticians-ims',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h'
};

// Check for missing required environment variables
const checkRequiredEnvVars = () => {
  const missing = [];
  
  if (!process.env.MONGODB_URI) {
    missing.push('MONGODB_URI');
  }
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-key-change-in-production') {
    missing.push('JWT_SECRET');
  }
  
  // Only show warnings if there are actually missing variables
  if (missing.length > 0) {
    console.warn('⚠️  Missing required environment variables:', missing);
  }
};

module.exports = {
  ...requiredEnvVars,
  checkRequiredEnvVars
}; 