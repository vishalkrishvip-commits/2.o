# FreshCart Authentication System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

**Windows (PowerShell):**

```powershell
cd "c:\Users\visha\OneDrive\Desktop\PROJECT 1\backend"
.\install.bat
```

**Windows (CMD):**

```cmd
cd c:\Users\visha\OneDrive\Desktop\PROJECT 1\backend
npm install
```

**Mac/Linux:**

```bash
cd "PROJECT 1/backend"
npm install
```

### Step 2: Initialize Demo Users

**Option A: Run Setup Script (Automatic)**

```bash
# Windows
node setup.js

# Or run via batch file
.\install.bat
```

**Option B: Manual Demo Users (No Setup Needed)**
The backend will work with these demo credentials immediately after starting:

- **Admin**: `admin@example.com` / `admin123`
- **Customer**: `customer@example.com` / `customer123`

### Step 3: Start Backend Server

```bash
npm start
```

You should see:

```
Backend server running at http://localhost:3000
```

### Step 4: Open in Browser

1. Open `login1.html` in your browser
2. Use demo credentials to login
3. On successful login, you'll be redirected to:
   - **Admin users** → `admin.html` (Admin Dashboard)
   - **Customer users** → `home.html` (Home Page)

---

## 📋 Demo Credentials

| Role     | Email                  | Password      |
| -------- | ---------------------- | ------------- |
| Admin    | `admin@example.com`    | `admin123`    |
| Customer | `customer@example.com` | `customer123` |

---

## 🔐 Features Implemented

✅ **User Registration** - Create new accounts with email/password
✅ **User Login** - Secure login with JWT tokens
✅ **Role-Based Access** - Admin vs Customer permissions
✅ **Protected Routes** - Pages restricted by authentication
✅ **Password Hashing** - Secure password storage with bcryptjs
✅ **Token Management** - 7-day JWT tokens with auto-expiry
✅ **Admin Dashboard** - Full product/order management
✅ **Order Management** - Users can place/view their orders
✅ **User Management** - Admins can manage user roles

---

## 📂 Files Overview

### Backend Files

- **`server.js`** - Express server with authentication endpoints
- **`db.json`** - JSON database with users, products, orders
- **`package.json`** - Dependencies (express, cors, bcryptjs, jsonwebtoken)
- **`.env.example`** - Environment variable template
- **`setup.js`** - Script to initialize demo users

### Frontend Files

- **`login1.html`** - Login/Register page with JWT integration
- **`js/auth.js`** - Authentication utility module (NEW)
- **`home.html`** - Protected customer page
- **`admin.html`** - Protected admin dashboard
- **`AUTHENTICATION.md`** - Full documentation

---

## 🔗 API Endpoints

### Public Endpoints

```
POST /api/auth/register      - Register new user
POST /api/auth/login         - Login user
GET  /api/products           - Get all products
GET  /api/products/:id       - Get single product
```

### Protected Endpoints (Require Token)

```
GET  /api/auth/me            - Get current user info
POST /api/orders             - Create order
GET  /api/orders/:id         - Get user's order
```

### Admin Only Endpoints

```
POST   /api/products         - Create product
PUT    /api/products/:id     - Update product
DELETE /api/products/:id     - Delete product
GET    /api/orders           - Get all orders
PUT    /api/orders/:id/status - Update order status
GET    /api/users            - Get all users
PUT    /api/users/:id/role   - Change user role
```

---

## 🛠️ How Authentication Works

### 1. **Registration/Login Flow**

```
User enters email/password
        ↓
Frontend sends POST request to /api/auth/register or /api/auth/login
        ↓
Backend validates credentials and hashes password
        ↓
Server generates JWT token
        ↓
Frontend stores token in localStorage
        ↓
Redirect to appropriate page (admin or home)
```

### 2. **Protected Requests**

```
Frontend includes token in Authorization header:
Authorization: Bearer <token>
        ↓
Backend verifies token signature
        ↓
If valid: Process request and return data
If invalid: Return 401/403 error and redirect to login
```

### 3. **Token Storage**

Tokens are stored in browser's `localStorage`:

```javascript
localStorage.getItem("authToken"); // JWT token
localStorage.getItem("user"); // User object as JSON
```

---

## 💡 Common Tasks

### Check if User is Logged In

```javascript
// Include auth.js in your page
<script src="js/auth.js"></script>;

// Check authentication
if (AUTH.isAuthenticated()) {
  console.log("User is logged in");
}
```

### Get Current User Info

```javascript
const user = AUTH.getUser();
console.log(user.name, user.email, user.role);
```

### Make Authenticated API Call

```javascript
// Instead of fetch(), use AUTH.fetch()
const response = await AUTH.fetch("/api/products", {
  method: "GET",
});
const data = await response.json();
```

### Protect a Page (Admin Only)

```html
<script src="js/auth.js"></script>
<script>
  // Require admin role
  AUTH.protectRoute("admin");
</script>
```

### Logout User

```javascript
AUTH.logout(); // Clears tokens and redirects to login
```

---

## ⚠️ Troubleshooting

### Issue: "Backend server not responding"

**Solution:**

1. Make sure you're in the backend folder
2. Run `npm start`
3. Check if port 3000 is available

### Issue: "No token provided" error

**Solution:**

1. Make sure you're logged in
2. Clear localStorage and login again
3. Check if auth.js is included in your page

### Issue: "Admin access required"

**Solution:**

1. Login with admin account (admin@example.com / admin123)
2. Check user role: `AUTH.getUser().role`
3. Admin users should have role: "admin"

### Issue: CORS errors

**Solution:**

1. Ensure backend server is running
2. Check that API_BASE_URL in auth.js matches your backend

### Issue: Passwords not working

**Solution:**

1. Run `node setup.js` to reset demo users
2. Use correct credentials:
   - Admin: admin@example.com / admin123
   - Customer: customer@example.com / customer123

---

## 📞 Support

For detailed documentation, see [AUTHENTICATION.md](./AUTHENTICATION.md)

---

**Last Updated:** August 14, 2024
**Version:** 1.0.0
