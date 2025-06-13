const Brand = require('../models/Brand');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;

// Get all brands
const getAllBrands = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const brands = await Brand.find(query)
      .populate('createdBy', 'name email')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Brand.countDocuments(query);

    res.status(200).json({
      success: true,
      data: brands,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
};

// Get single brand
const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand',
      error: error.message
    });
  }
};

// Create new brand
const createBrand = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name } = req.body;

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name: name.trim() });
    if (existingBrand) {
      // Clean up uploaded file
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Brand with this name already exists'
      });
    }

    // Check if image is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Brand image is required'
      });
    }

    // Upload image to Cloudinary
    const imageResult = await uploadImage(req.file, 'anura-opticians/brands');

    // Clean up local file
    await fs.unlink(req.file.path).catch(() => {});

    // Create brand
    const brand = new Brand({
      name: name.trim(),
      image: {
        public_id: imageResult.public_id,
        secure_url: imageResult.secure_url,
        url: imageResult.url
      },
      createdBy: req.user._id
    });

    await brand.save();

    // Populate user data
    await brand.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    console.error('Create brand error:', error);
    
    // Clean up uploaded file
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message: 'Error creating brand',
      error: error.message
    });
  }
};

// Update brand
const updateBrand = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name } = req.body;
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      // Clean up uploaded file
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name.trim() !== brand.name) {
      const existingBrand = await Brand.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingBrand) {
        // Clean up uploaded file
        if (req.file) {
          await fs.unlink(req.file.path).catch(() => {});
        }
        return res.status(400).json({
          success: false,
          message: 'Brand with this name already exists'
        });
      }
    }

    // Update brand name if provided
    if (name) {
      brand.name = name.trim();
    }

    // Update image if new image is provided
    if (req.file) {
      try {
        // Upload new image to Cloudinary
        const imageResult = await uploadImage(req.file, 'anura-opticians/brands');

        // Delete old image from Cloudinary
        if (brand.image.public_id) {
          await deleteImage(brand.image.public_id);
        }

        // Update brand image
        brand.image = {
          public_id: imageResult.public_id,
          secure_url: imageResult.secure_url,
          url: imageResult.url
        };

        // Clean up local file
        await fs.unlink(req.file.path).catch(() => {});
      } catch (uploadError) {
        // Clean up local file
        await fs.unlink(req.file.path).catch(() => {});
        throw uploadError;
      }
    }

    await brand.save();

    // Populate user data
    await brand.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    console.error('Update brand error:', error);
    
    // Clean up uploaded file
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message: 'Error updating brand',
      error: error.message
    });
  }
};

// Delete brand
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if brand has associated items
    const Item = require('../models/Item');
    const itemCount = await Item.countDocuments({ brand: brand._id });

    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. ${itemCount} items are associated with this brand.`
      });
    }

    // Delete image from Cloudinary
    if (brand.image.public_id) {
      await deleteImage(brand.image.public_id);
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting brand',
      error: error.message
    });
  }
};

module.exports = {
  getAllBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand
}; 