 
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const { validationResult } = require('express-validator');

// Helper function to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper function to format product data
const formatProductData = (product) => {
  if (!product) return null;
  
  const productObj = product.toObject ? product.toObject() : product;
  
  return {
    _id: productObj._id,
    brand: productObj.brand,
    modelNumber: productObj.modelNumber,
    price: productObj.price,
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
    createdBy: productObj.createdBy
  };
};

// Get all products (with search and filter)
const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      brand,
      modelNumber,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};

    // Add search filter (search in model number)
    if (search) {
      query.modelNumber = { $regex: escapeRegex(search), $options: 'i' };
    }

    // Add model number filter
    if (modelNumber) {
      query.modelNumber = { $regex: escapeRegex(modelNumber), $options: 'i' };
    }

    // Add brand filter
    if (brand) {
      query.brand = brand;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('brand', 'name image')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    // Format products data
    const formattedProducts = products.map(formatProductData);

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name image')  
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const formattedProduct = formatProductData(product);

    res.status(200).json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
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

    // Check if product with same brand and model number already exists
    const existingProduct = await Product.findOne({ 
      brand: brand, 
      modelNumber: modelNumber.trim()
    });
    
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this brand and model number already exists'
      });
    }

    // Create product
    const product = new Product({
      brand,
      modelNumber: modelNumber.trim(),
      price: parseFloat(price),
      createdBy: req.user._id
    });

    await product.save();

    // Populate brand and user data
    await product.populate('brand', 'name image');
    await product.populate('createdBy', 'name email');

    const formattedProduct = formatProductData(product);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: formattedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if brand exists (if brand is being updated)
    if (brand && brand !== product.brand.toString()) {
      const brandExists = await Brand.findById(brand);
      if (!brandExists) {
        return res.status(400).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }

    // Check if brand and model number combination is unique
    if ((brand && brand !== product.brand.toString()) || (modelNumber && modelNumber.trim() !== product.modelNumber)) {
      const checkBrand = brand || product.brand;
      const checkModelNumber = modelNumber ? modelNumber.trim() : product.modelNumber;
      
      const existingProduct = await Product.findOne({ 
        brand: checkBrand, 
        modelNumber: checkModelNumber,
        _id: { $ne: req.params.id }
      });
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this brand and model number already exists'
        });
      }
    }

    // Update product
    product.brand = brand || product.brand;
    product.modelNumber = modelNumber ? modelNumber.trim() : product.modelNumber;
    product.price = price ? parseFloat(price) : product.price;

    await product.save();

    // Populate brand data
    await product.populate('brand', 'name image');
    await product.populate('createdBy', 'name email');

    const formattedProduct = formatProductData(product);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: formattedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Get products by brand
const getProductsByBrand = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { brand: req.params.brandId };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('brand', 'name image')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    // Format products data
    const formattedProducts = products.map(formatProductData);

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by brand',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,  
  updateProduct,
  deleteProduct,
  getProductsByBrand
};