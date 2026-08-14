# Authentication & Authorization System Documentation

## Overview

This project implements a complete **JWT-based authentication and role-based authorization** system using Node.js/Express backend and vanilla JavaScript frontend.

## Features Implemented

### 1. **User Authentication**

- ✅ User Registration with email and password
- ✅ User Login with email/password validation
- ✅ JWT token generation (7-day expiry)
- ✅ Password hashing with bcryptjs
- ✅ Session management via localStorage

### 2. **Role-Based Authorization**

- ✅ **Admin Role**: Full access to product management and order management
- ✅ **Customer Role**: Can browse products and manage their own orders
- ✅ Role-based route protection
- ✅ Permission checking middleware

### 3. **Protected Endpoints**

All sensitive operations require authentication:

- `POST /api/auth/register` - Public endpoint
- `POST /api/auth/login` - Public endpoint
- `GET /api/auth/me` - Requires authentication
- `POST /api/products` - Requires admin role
- `PUT /api/products/:id` - Requires admin role
- `DELETE /api/products/:id` - Requires admin role
- `POST /api/orders` - Requires authentication
- `GET /api/orders` - Requires admin role
- `PUT /api/orders/:id/status` - Requires admin role
- `GET /api/users` - Requires admin role
- `PUT /api/users/:id/role` - Requires admin role

## Setup Instructions

### Backend Setup

1. **Install Dependencies**

```bash
cd backend
npm install
```

2. **Environment Variables** (optional)
   Create a `.env` file:

```
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=3000
```

3. **Start Backend Server**

```bash
npm start
```

Server runs on `http://localhost:3000`

### Database Structure

The `db.json` file includes:

```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "password": "hashed_password",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "products": [],
  "orders": []
}
```

## Demo Credentials

Use these to test the authentication:

**Admin Account:**

- Email: `admin@example.com`
- Password: `admin123`

**Customer Account:**

- Email: `customer@example.com`
- Password: `customer123`

## Frontend Implementation

### 1. Using Authentication in Pages

Include the auth utility in your HTML:

```html
<script src="js/auth.js"></script>
```

### 2. Protect Routes

At the beginning of your page script:

```javascript
// Protect route - require authentication
AUTH.protectRoute();

// Protect route - require admin role
AUTH.protectRoute("admin");
```

### 3. Making Authenticated Requests

Instead of standard `fetch()`, use the AUTH module:

```javascript
// GET request
const response = await AUTH.fetch("/api/products");
const data = await response.json();

// POST request
const response = await AUTH.fetch("/api/orders", {
  method: "POST",
  body: JSON.stringify({
    /* order data */
  }),
});

// PUT request
const response = await AUTH.fetch("/api/products/1", {
  method: "PUT",
  body: JSON.stringify({
    /* update data */
  }),
});

// DELETE request
const response = await AUTH.fetch("/api/products/1", {
  method: "DELETE",
});
```

### 4. Check User Authorization

```javascript
// Check if user is logged in
if (AUTH.isAuthenticated()) {
  // User is logged in
}

// Check if user is admin
if (AUTH.isAdmin()) {
  // Show admin features
}

// Check if user is customer
if (AUTH.isCustomer()) {
  // Show customer features
}

// Get current user data
const user = AUTH.getUser();
console.log(user.name, user.email, user.role);

// Logout
AUTH.logout();
```

## API Endpoints

### Authentication

**POST /api/auth/register**

- Request: `{ name, email, password }`
- Response: `{ message, user, token }`

**POST /api/auth/login**

- Request: `{ email, password }`
- Response: `{ message, user, token }`

**GET /api/auth/me**

- Headers: `Authorization: Bearer <token>`
- Response: `{ user }`

### Products (Admin Only)

**GET /api/products**

- Public: Get all products

**GET /api/products/:id**

- Public: Get single product

**POST /api/products**

- Admin only: Create product
- Supports file upload (multipart/form-data)

**PUT /api/products/:id**

- Admin only: Update product
- Supports file upload (multipart/form-data)

**DELETE /api/products/:id**

- Admin only: Delete product

### Orders

**GET /api/orders**

- Admin only: Get all orders

**GET /api/orders/:id**

- Authenticated: Get order (customers see their own, admins see all)

**POST /api/orders**

- Authenticated: Create new order

**PUT /api/orders/:id/status**

- Admin only: Update order status

### User Management (Admin Only)

**GET /api/users**

- Admin only: Get all users (without passwords)

**PUT /api/users/:id/role**

- Admin only: Update user role
- Request: `{ role: "admin" | "customer" }`

## Security Best Practices Implemented

1. ✅ **Password Hashing**: Uses bcryptjs with 10-round salt
2. ✅ **JWT Tokens**: Signed tokens with 7-day expiration
3. ✅ **Token Storage**: Stored in localStorage (consider using httpOnly cookies for production)
4. ✅ **Role-Based Access**: Endpoint-level authorization checks
5. ✅ **CORS Enabled**: Cross-origin requests handled
6. ✅ **Input Validation**: Email, password, and data validation
7. ✅ **Error Handling**: Descriptive error messages

## Production Recommendations

1. **Environment Variables**:
   - Store JWT_SECRET in `.env` file
   - Use different secrets for different environments

2. **Token Storage**:
   - Use httpOnly cookies instead of localStorage
   - Implement token refresh mechanism

3. **Rate Limiting**:
   - Add rate limiting on auth endpoints
   - Prevent brute force attacks

4. **HTTPS**:
   - Always use HTTPS in production
   - Never send tokens over HTTP

5. **Database**:
   - Replace JSON file with real database (MongoDB, PostgreSQL)
   - Add database indexes for performance

6. **Validation**:
   - Add comprehensive input validation
   - Implement email verification
   - Add password strength requirements

7. **Logging & Monitoring**:
   - Log authentication attempts
   - Monitor suspicious activities
   - Set up error tracking

## Troubleshooting

**Issue: "No token provided" or "Session expired"**

- Solution: User is not authenticated. Redirect to login page.

**Issue: "Admin access required"**

- Solution: User doesn't have admin role. Check user permissions.

**Issue: Backend server not responding**

- Solution: Make sure backend server is running (`npm start` in backend folder)

**Issue: CORS errors**

- Solution: Check if `cors` package is installed and enabled in backend

## File Structure

```
PROJECT 1/
├── backend/
│   ├── server.js (Updated with auth)
│   ├── db.json (User schema added)
│   ├── package.json (bcryptjs, jsonwebtoken added)
│   └── uploads/
├── js/
│   ├── auth.js (NEW - Authentication utility)
│   ├── main.js
│   ├── admin.js
│   ├── cart.js
│   └── ...
├── login1.html (Updated with auth form)
├── home.html (Protected route)
├── admin.html (Protected route - admin only)
└── ...
```

## Next Steps

1. Add email verification for registration
2. Implement password reset functionality
3. Add two-factor authentication
4. Create admin dashboard for user management
5. Implement remember-me functionality
6. Add session timeout warnings
7. Create audit logs for admin actions

---

**Last Updated**: August 14, 2024
**Version**: 1.0.0
