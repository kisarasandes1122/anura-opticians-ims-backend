const Item = require('../models/Item');
const Brand = require('../models/Brand');
const { validationResult } = require('express-validator');

// Get all items (with search and filter)
const getAllItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      brand,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};

    // Add search filter (search in model number)
    if (search) {
      query.modelNumber = { $regex: search, $options: 'i' };
    }

    // Add brand filter
    if (brand) {
      query.brand = brand;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find(query)
      .populate('brand', 'name image')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// Get single item
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('brand', 'name image')  
      .populate('createdBy', 'name email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message
    });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { brand, modelNumber, price } = req.body;

    // Check if brand exists
    const brandExists = await Brand.findById(brand);
    if (!brandExists) {
      return res.status(400).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if item with same brand and model number already exists
    const existingItem = await Item.findOne({ 
      brand: brand, 
      modelNumber: modelNumber.trim() 
    });
    
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item with this brand and model number already exists'
      });
    }

    // Create item
    const item = new Item({
      brand,
      modelNumber: modelNumber.trim(),
      price: parseFloat(price),
      createdBy: req.user._id
    });

    await item.save();

    // Populate brand and user data
    await item.populate('brand', 'name image');
    await item.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { brand, modelNumber, price } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if brand exists (if brand is being updated)
    if (brand && brand !== item.brand.toString()) {
      const brandExists = await Brand.findById(brand);
      if (!brandExists) {
        return res.status(400).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }

    // Check if brand and model number combination is unique (if either is being updated)
    if ((brand && brand !== item.brand.toString()) || (modelNumber && modelNumber.trim() !== item.modelNumber)) {
      const checkBrand = brand || item.brand;
      const checkModel = modelNumber ? modelNumber.trim() : item.modelNumber;
      
      const existingItem = await Item.findOne({ 
        brand: checkBrand, 
        modelNumber: checkModel,
        _id: { $ne: req.params.id }
      });
      
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Item with this brand and model number already exists'
        });
      }
    }

    // Update fields
    if (brand) item.brand = brand;
    if (modelNumber) item.modelNumber = modelNumber.trim();
    if (price !== undefined) item.price = parseFloat(price);
    
    await item.save();

    // Populate brand and user data
    await item.populate('brand', 'name image');
    await item.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};

// Get items by brand (for dropdown population)
const getItemsByBrand = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const brandId = req.params.brandId;

    // Check if brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const items = await Item.find({ brand: brandId })
      .populate('brand', 'name image')
      .sort({ modelNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments({ brand: brandId });

    res.status(200).json({
      success: true,
      data: items,
      brand: brand,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get items by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items by brand',
      error: error.message
    });
  }
};

module.exports = {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemsByBrand
}; 