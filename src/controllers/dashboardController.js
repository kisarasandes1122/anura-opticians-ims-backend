const Brand = require('../models/Brand');
const Product = require('../models/Product');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get counts from database
    const [brandCount, productCount] = await Promise.all([
      Brand.countDocuments(),
      Product.countDocuments()
    ]);

    // Get recent products (last 5)
    const recentProducts = await Product.find()
      .populate('brand', 'name image')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      brandCount,
      productCount,
      recentProducts: recentProducts.map(product => ({
        id: product._id,
        brand: product.brand.name,
        model: product.modelNumber,
        price: `Rs. ${product.price.toLocaleString()}`,
        image: product.brand.image?.secure_url || '/api/placeholder/60/60',
        createdAt: product.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
}; 