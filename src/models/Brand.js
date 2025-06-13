const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Brand name must be at least 2 characters long'],
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  image: {
    public_id: {
      type: String,
      required: [true, 'Image public_id is required']
    },
    secure_url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    url: {
      type: String,
      required: [true, 'Image URL is required']
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
brandSchema.index({ name: 1 });

module.exports = mongoose.model('Brand', brandSchema); 