# Anura Opticians Inventory Management System - Backend

A robust and scalable Node.js backend API for managing optical inventory, built with Express.js, MongoDB, and comprehensive security features.

## 🚀 Features

### Core Functionality
- 🔐 **JWT-based Authentication** with secure token management
- 👥 **Role-based Access Control** (Admin & Sales)
- 📦 **Product Management** with brand associations
- 🏷️ **Brand Management** with image upload support
- 📊 **Dashboard Analytics** for business insights
- 🔄 **Password Reset** functionality with email support

### Security & Performance
- 🛡️ **Comprehensive Security** (Helmet, CORS, Rate limiting)
- 📝 **Request Logging** with Winston
- 🗜️ **Response Compression** for optimal performance
- ✅ **Input Validation** on all endpoints
- 🚫 **Graceful Error Handling** with detailed logging
- 🌐 **CORS Support** for multiple origins

### Infrastructure
- 🐳 **Docker Support** for containerized deployment
- ⚡ **PM2 Process Management** for production
- 📂 **File Upload** with Cloudinary integration
- 📧 **Email Service** integration with Resend
- 📁 **Structured Logging** with file rotation

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone and Install
```bash
git clone https://github.com/kisarasandes1122/anura-opticians-ims-backend
cd anura-opticians-ims-backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URLs for CORS
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/anura-opticians-ims

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex-128-chars-recommended
JWT_EXPIRE=24h

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Database Setup
Ensure MongoDB is running, then optionally seed default users:
```bash
# Seed default admin and sales users
node src/utils/seedUsers.js
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Using PM2 for production
npm run pm2:start
```

The server will be available at `http://localhost:5000`

## 🏗️ Architecture Overview

### Project Structure
```
src/
├── app.js                 # Express application setup
├── server.js              # Server entry point with graceful shutdown
├── config/
│   ├── database.js        # MongoDB connection
│   ├── envConfig.js       # Environment validation
│   ├── logger.js          # Winston logging configuration
│   └── cloudinary.js      # Cloudinary setup
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── brandController.js # Brand management
│   ├── productController.js # Product management
│   └── dashboardController.js # Analytics
├── middleware/
│   ├── auth.js            # JWT authentication & authorization
│   ├── security.js        # Security configurations
│   └── upload.js          # File upload handling
├── models/
│   ├── User.js            # User schema with roles
│   ├── Brand.js           # Brand schema with images
│   └── Product.js         # Product schema
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── brands.js          # Brand management routes
│   ├── products.js        # Product management routes
│   └── dashboard.js       # Analytics routes
└── utils/
    ├── validation.js      # Custom validation helpers
    ├── emailService.js    # Email functionality
    └── seedUsers.js       # Database seeding
```

### Database Models

#### User Model
- **Fields**: email, password, role, name, isActive, lastLogin
- **Roles**: Admin, Sale
- **Features**: Password hashing, reset tokens, JSON serialization

#### Brand Model
- **Fields**: name, image (Cloudinary), createdBy
- **Features**: Unique names, image management, audit trail

#### Product Model
- **Fields**: brand (reference), modelNumber, price, currency, createdBy
- **Features**: Brand associations, price validation, compound indexing

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@anura-opticians.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "System Administrator",
      "email": "admin@anura-opticians.com",
      "role": "Admin",
      "lastLogin": "2024-01-01T12:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "current_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

#### Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "new_password",
  "confirmPassword": "new_password"
}
```

### Brand Management Endpoints

#### Get All Brands
```http
GET /api/brands
Authorization: Bearer <jwt_token>
```

#### Get Single Brand
```http
GET /api/brands/:id
Authorization: Bearer <jwt_token>
```

#### Create Brand (Admin Only)
```http
POST /api/brands
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

name: Brand Name
image: [file]
```

#### Update Brand (Admin Only)
```http
PUT /api/brands/:id
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

name: Updated Brand Name
image: [file] (optional)
```

#### Delete Brand (Admin Only)
```http
DELETE /api/brands/:id
Authorization: Bearer <jwt_token>
```

### Product Management Endpoints

#### Get All Products (with search & filter)
```http
GET /api/products?search=keyword&brand=brandId&page=1&limit=10
Authorization: Bearer <jwt_token>
```

#### Get Products by Brand
```http
GET /api/products/brand/:brandId
Authorization: Bearer <jwt_token>
```

#### Get Single Product
```http
GET /api/products/:id
Authorization: Bearer <jwt_token>
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "brand": "brand_id",
  "modelNumber": "Model123",
  "price": 1500.00,
  "currency": "LKR"
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "brand": "brand_id",
  "modelNumber": "UpdatedModel123",
  "price": 1600.00
}
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <jwt_token>
```

### Dashboard Analytics
```http
GET /api/dashboard/stats
Authorization: Bearer <jwt_token>
```

### System Health
```http
GET /api/health
```

## 🔒 Authentication & Authorization

### User Roles
- **Admin**: Full system access and management capabilities
- **Sale**: Sales-specific operations and limited system access

### Middleware Stack
- **`auth`**: Validates JWT tokens and loads user data
- **`adminAuth`**: Requires Admin role
- **`saleAuth`**: Requires Sale role
- **`adminOrSaleAuth`**: Requires Admin or Sale role

### Usage Example
```javascript
// Protect route with authentication
router.get('/protected', auth, (req, res) => {
  // req.user contains authenticated user data
});

// Admin-only route
router.post('/admin-only', auth, adminAuth, (req, res) => {
  // Only admin users can access
});
```

## 🚀 Deployment Options

### Docker Deployment
```bash
# Build image
docker build -t anura-opticians-backend .

# Run container
docker run -d -p 5000:5000 --env-file .env anura-opticians-backend
```

### PM2 Production Deployment
```bash
# Start with PM2
npm run pm2:start

# Monitor processes
pm2 monit

# View logs
pm2 logs anura-opticians-ims-backend

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

## 📊 Logging & Monitoring

### Log Files Location
- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **PM2 logs**: `logs/pm2-*.log`

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 🔧 Development Scripts

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# PM2 commands
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop PM2 processes
npm run pm2:restart  # Restart PM2 processes
npm run pm2:delete   # Delete PM2 processes
```


## 🛡️ Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Configurable origin restrictions
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js security headers
- **Error Handling**: Prevents information leakage
- **Graceful Shutdown**: Proper cleanup on termination

## 🔄 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // For validation errors
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## 🤝 Contributing

1. **Code Style**: Follow existing patterns and conventions
2. **Error Handling**: Include comprehensive error handling
3. **Validation**: Add input validation for all endpoints
4. **Documentation**: Update API documentation for changes
5. **Testing**: Test authentication scenarios thoroughly
6. **Logging**: Add appropriate logging for debugging

## 📝 License

ISC License - See LICENSE file for details

## 🆘 Support

For support and questions:
- Check the logs in the `logs/` directory
- Verify environment variables are correctly set
- Ensure MongoDB is running and accessible
- Check network connectivity and CORS settings

---
**Built with ❤️ for Anura Opticians**