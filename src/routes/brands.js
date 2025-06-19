const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');

// Validation rules for brand
const brandValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand name must be between 2 and 50 characters')
];

// @route   GET /api/brands
// @desc    Get all brands
// @access  Private (Admin/Sale)
router.get('/', auth, getAllBrands);

// @route   GET /api/brands/:id
// @desc    Get single brand
// @access  Private (Admin/Sale)
router.get('/:id', auth, getBrand);

// @route   POST /api/brands
// @desc    Create new brand
// @access  Private (Admin only)
router.post('/', 
  auth, 
  adminAuth, 
  upload.single('image'), 
  brandValidation, 
  createBrand
);

// @route   PUT /api/brands/:id
// @desc    Update brand
// @access  Private (Admin only)
router.put('/:id', 
  auth, 
  adminAuth, 
  upload.single('image'), 
  brandValidation, 
  updateBrand
);

// @route   DELETE /api/brands/:id
// @desc    Delete brand
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, deleteBrand);

module.exports = router; 