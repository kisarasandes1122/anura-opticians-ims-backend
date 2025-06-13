const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemsByBrand
} = require('../controllers/itemController');

// Validation rules for item
const itemValidation = [
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

// @route   GET /api/items
// @desc    Get all items (search and filter)
// @access  Private (Admin/Sale)
router.get('/', auth, getAllItems);

// @route   GET /api/items/brand/:brandId
// @desc    Get items by brand
// @access  Private (Admin/Sale)
router.get('/brand/:brandId', auth, getItemsByBrand);

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Private (Admin/Sale)
router.get('/:id', auth, getItem);

// @route   POST /api/items
// @desc    Create new item
// @access  Private (Admin only)
router.post('/', auth, adminAuth, itemValidation, createItem);

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, itemValidation, updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, deleteItem);

module.exports = router; 