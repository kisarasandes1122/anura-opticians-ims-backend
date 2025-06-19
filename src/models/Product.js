const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  modelNumber: {
    type: String,
    required: [true, 'Model number is required'],
    trim: true,
    minlength: [2, 'Model number must be at least 2 characters long'],
    maxlength: [50, 'Model number cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Price must be greater than 0'
    }
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for brand and model number (should be unique together)
productSchema.index({ brand: 1, modelNumber: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);