const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics (counts and recent data)
// @access  Private (Admin/Sale)
router.get('/stats', auth, getDashboardStats);

module.exports = router; 