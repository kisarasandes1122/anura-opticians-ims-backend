const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByBrand
} = require('../controllers/productController');

// Validation rules for product
const productValidation = [
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isMongoId()
    .withMessage('Invalid brand ID'),
  body('modelNumber')
    .trim()
    .notEmpty()
    .withMessage('Model number is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Model number must be between 2 and 50 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number')
];

// @route   GET /api/products
// @desc    Get all products (search and filter)
// @access  Private (Admin/Sale)
router.get('/', auth, getAllProducts);

// @route   GET /api/products/brand/:brandId
// @desc    Get products by brand
// @access  Private (Admin/Sale)
router.get('/brand/:brandId', auth, getProductsByBrand);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private (Admin/Sale)
router.get('/:id', auth, getProduct);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', auth, adminAuth, productValidation, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, productValidation, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, deleteProduct);

module.exports = router;