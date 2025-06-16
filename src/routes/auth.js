const express = require('express');
const router = express.Router();

// Import controllers
const {
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  adminChangeUserPassword,
  getSalesUser
} = require('../controllers/authController');

// Import middleware
const { auth, adminOnly } = require('../middleware/auth');

// Import validation
const {
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  adminChangePasswordValidation
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

// @route   PUT /api/auth/admin/change-user-password
// @desc    Admin change another user's password
// @access  Private (Admin only)
router.put('/admin/change-user-password', auth, adminOnly, adminChangePasswordValidation, adminChangeUserPassword);

// @route   GET /api/auth/admin/sales-user
// @desc    Get sales user info for admin
// @access  Private (Admin only)
router.get('/admin/sales-user', auth, adminOnly, getSalesUser);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (sends email to admin)
// @access  Public
router.post('/forgot-password', forgotPasswordValidation, requestPasswordReset);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPasswordValidation, resetPassword);

module.exports = router; 