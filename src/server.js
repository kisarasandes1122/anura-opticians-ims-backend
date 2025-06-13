const app = require('./app');
const connectDB = require('./config/database');
const { checkRequiredEnvVars } = require('./config/envConfig');

const PORT = process.env.PORT || 5000;

// Check environment variables
checkRequiredEnvVars();

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
});