# Anura Opticians IMS Backend

Backend API for the Anura Opticians Inventory Management System with JWT-based authentication.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Admin & Sale)
- 🛡️ Password hashing with bcrypt
- ✅ Input validation
- 🚀 RESTful API endpoints
- 📊 MongoDB database integration

## User Roles

- **Admin**: Full system access and management capabilities
- **Sale**: Sales-specific operations and limited system access

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/anura-opticians-ims

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_EXPIRE=24h
```

### 3. Database Setup

Make sure MongoDB is running on your system, then seed the default users:

```bash
npm run seed
```

This will create two default users:
- **Admin**: admin@anura-opticians.com / Admin@123
- **Sale**: sales@anura-opticians.com / Sales@123

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Login
```
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
```
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Change Password
```
PUT /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "current_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

### Health Check
```
GET /api/health
```

## Authentication Middleware

The backend includes several authentication middleware functions:

- `auth`: Verify JWT token and authenticate user
- `adminAuth`: Require Admin role
- `saleAuth`: Require Sale role  
- `adminOrSaleAuth`: Require Admin or Sale role

### Usage Example:
```javascript
const { auth, adminAuth } = require('./middleware/auth');

// Protect route with authentication
router.get('/protected', auth, (req, res) => {
  // req.user contains authenticated user data
});

// Protect route with admin role requirement
router.get('/admin-only', auth, adminAuth, (req, res) => {
  // Only admin users can access this route
});
```

## Default Login Credentials

### Admin Account
- **Email**: admin@anura-opticians.com
- **Password**: Admin@123
- **Role**: Admin

### Sales Account
- **Email**: sales@anura-opticians.com
- **Password**: Sales@123
- **Role**: Sale

⚠️ **Important**: Change these default passwords in production!

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // For validation errors
}
```

## Security Features

- 🔒 Passwords are hashed using bcrypt with salt rounds of 12
- 🎟️ JWT tokens expire after 24 hours (configurable)
- ✅ Input validation on all endpoints
- 🛡️ CORS protection
- 🔐 Role-based access control

## Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed database with default users
npm run seed
```

## Project Structure

```
src/
├── controllers/        # Request handlers
│   └── authController.js
├── middleware/        # Custom middleware
│   └── auth.js
├── models/           # Database models
│   └── User.js
├── routes/           # API routes
│   └── auth.js
├── utils/            # Utility functions
│   ├── validation.js
│   └── seedUsers.js
├── config/           # Configuration files
│   ├── database.js
│   └── envConfig.js
├── app.js            # Express app setup
└── server.js         # Server entry point
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation for new endpoints
5. Test all authentication scenarios

## License

ISC