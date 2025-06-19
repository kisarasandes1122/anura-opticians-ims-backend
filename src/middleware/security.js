const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests
    skipSuccessfulRequests: false,
    // Skip failed requests  
    skipFailedRequests: false,
  });
};

// General rate limiter - 100 requests per 15 minutes
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for auth endpoints - 10 requests per 15 minutes
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 requests per window
  'Too many authentication attempts from this IP, please try again later.'
);

// Password reset limiter - 3 requests per hour
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per window
  'Too many password reset requests from this IP, please try again later.'
);

// File upload limiter - 10 requests per 5 minutes
const uploadLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  10, // 10 requests per window
  'Too many file upload requests from this IP, please try again later.'
);

// Helmet security headers configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  helmetConfig
}; 