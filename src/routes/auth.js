const express = require('express');
const router = express.Router();

// Import controllers
const {
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword
} = require('../controllers/authController');

// Import middleware
const { auth } = require('../middleware/auth');

// Import validation
const {
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../utils/validation');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidation, loginUser);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfileValidation, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, changePasswordValidation, changePassword);

module.exports = router; 