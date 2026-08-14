# Authentication System - Verification Checklist

Use this checklist to verify that the authentication system is working correctly.

---

## 🔧 Setup Verification

### Installation

- [ ] Navigate to backend folder: `cd PROJECT 1/backend`
- [ ] Installed dependencies: `npm install`
  - [ ] `express` installed
  - [ ] `cors` installed
  - [ ] `bcryptjs` installed
  - [ ] `jsonwebtoken` installed
  - [ ] `multer` installed

### Backend Server

- [ ] Started server: `npm start`
- [ ] Output shows: "Backend server running at http://localhost:3000"
- [ ] Server is listening on port 3000
- [ ] No error messages in console

### Demo Users

- [ ] Ran setup script: `node setup.js` (optional but recommended)
- [ ] OR manually verified demo credentials in db.json

---

## 🔐 Authentication Testing

### Registration

- [ ] Open `login1.html` in browser
- [ ] Click "Register" tab
- [ ] Fill in: Name, Email, Password, Confirm Password
- [ ] Click "Create Account"
- [ ] Success message appears
- [ ] Redirected to `home.html`
- [ ] New user appears in db.json

### Login with Admin

- [ ] Open `login1.html`
- [ ] Enter email: `admin@example.com`
- [ ] Enter password: `admin123`
- [ ] Click "Login"
- [ ] Success message appears
- [ ] Redirected to `admin.html`
- [ ] Admin dashboard loads

### Login with Customer

- [ ] Open `login1.html`
- [ ] Enter email: `customer@example.com`
- [ ] Enter password: `customer123`
- [ ] Click "Login"
- [ ] Success message appears
- [ ] Redirected to `home.html`

### Login Error Handling

- [ ] Try invalid email: Error message "Invalid email or password"
- [ ] Try wrong password: Error message "Invalid email or password"
- [ ] Try empty fields: Form validation prevents submission

---

## 🛡️ Authorization Testing

### Admin Route Protection

- [ ] Login as customer
- [ ] Try accessing `admin.html` directly
- [ ] Should be redirected to `home.html` with error
- [ ] Login as admin
- [ ] Can access `admin.html` without redirect

### Customer Route Protection

- [ ] Not logged in: Try accessing `home.html`
- [ ] Should redirect to `login1.html`
- [ ] After login: `home.html` loads successfully

### Token Storage

- [ ] After login, open browser DevTools (F12)
- [ ] Go to Application → Local Storage
- [ ] Should see `authToken` with JWT value
- [ ] Should see `user` with JSON object

---

## 🔑 Token Verification

### JWT Token Format

- [ ] Go to [JWT.io](https://jwt.io)
- [ ] Paste the token from localStorage
- [ ] Token should decode successfully
- [ ] Payload contains: `id`, `email`, `name`, `role`, `iat`, `exp`
- [ ] Token expiration is ~7 days from creation

### Token Expiry

- [ ] Wait for token to expire (or manually delete from localStorage)
- [ ] Try to refresh the page
- [ ] Should redirect to login or show error
- [ ] Can login again to get new token

---

## 🌐 API Endpoint Testing

### Public Endpoints

- [ ] GET `/api/products` - Returns product list
- [ ] GET `/api/products/1` - Returns single product
- [ ] No token needed

### Authentication Endpoints

- [ ] POST `/api/auth/register` - Creates new user
- [ ] POST `/api/auth/login` - Returns token
- [ ] GET `/api/auth/me` - Returns current user (requires token)

### Protected Admin Endpoints

- [ ] POST `/api/products` - Admin can create (with token)
- [ ] Verify: Non-admin gets "Admin access required" error
- [ ] PUT `/api/products/1` - Admin can update
- [ ] DELETE `/api/products/1` - Admin can delete
- [ ] GET `/api/users` - Admin can see all users
- [ ] PUT `/api/users/1/role` - Admin can change role

### Protected Customer Endpoints

- [ ] POST `/api/orders` - Customer can place order (with token)
- [ ] GET `/api/orders/FC-XXXXX` - Customer can view own order
- [ ] Verify: Cannot view other users' orders

---

## 📋 Frontend Integration

### Auth Utility Module (js/auth.js)

- [ ] File exists and has correct path
- [ ] Check token retrieval: `AUTH.getToken()`
- [ ] Check user data: `AUTH.getUser()`
- [ ] Check authentication: `AUTH.isAuthenticated()`
- [ ] Check role: `AUTH.isAdmin()` and `AUTH.isCustomer()`

### Route Protection

- [ ] admin.html includes `AUTH.protectRoute('admin')`
- [ ] Page redirects non-admins appropriately
- [ ] admin.html redirects non-authenticated users to login

### Logout Functionality

- [ ] admin.html logout button calls `AUTH.logout()`
- [ ] Clears localStorage
- [ ] Redirects to `login1.html`
- [ ] Returns to login page successfully

### API Calls with Auth

- [ ] `AUTH.fetch()` automatically adds token to requests
- [ ] Token included in `Authorization: Bearer <token>` header
- [ ] 401 errors trigger automatic logout
- [ ] API calls work without CORS errors

---

## 🎨 UI/UX Verification

### Login Page

- [ ] Responsive design on mobile/tablet/desktop
- [ ] Login form visible and functional
- [ ] Register form visible and functional
- [ ] Tab switching works smoothly
- [ ] Error messages display correctly
- [ ] Loading spinner appears during submission
- [ ] Demo credentials are visible

### Admin Dashboard

- [ ] Header displays correctly
- [ ] Navigation buttons functional
- [ ] "Back to Shop" button works
- [ ] "Add New Product" button opens form
- [ ] "Logout" button works
- [ ] Product table displays
- [ ] Update/Delete actions work

### Home Page

- [ ] Page loads after login
- [ ] Navigation elements visible
- [ ] User data might be displayed (if implemented)
- [ ] Products load from API

---

## 🔒 Security Checks

### Password Security

- [ ] Passwords are never logged in console
- [ ] Passwords are hashed in database (not plain text)
- [ ] Password field is type="password" (masked input)
- [ ] Passwords validated on both frontend and backend
- [ ] Minimum 6 character requirement enforced

### Token Security

- [ ] Token stored in localStorage (not cookies by default)
- [ ] Token includes expiration time
- [ ] Token signature verified on backend
- [ ] Invalid tokens are rejected
- [ ] Expired tokens trigger logout
- [ ] No sensitive data in token payload

### Data Validation

- [ ] Email format validated
- [ ] Empty fields prevented
- [ ] Duplicate emails rejected on registration
- [ ] Role validation on authorization

### CORS & Cross-Site

- [ ] CORS enabled for localhost
- [ ] No cross-site scripting vulnerabilities
- [ ] Secure headers implemented

---

## 📊 Database Verification

### Database Structure

- [ ] db.json exists in backend folder
- [ ] Contains `users` array
- [ ] Contains `products` array
- [ ] Contains `orders` array
- [ ] Sample users in db.json

### User Records

- [ ] Admin user has `role: "admin"`
- [ ] Customer user has `role: "customer"`
- [ ] Passwords are hashed (not plain text)
- [ ] Email format is correct
- [ ] `createdAt` timestamps present

### Data Integrity

- [ ] Creating new users adds to db.json
- [ ] Database persists between server restarts
- [ ] No data corruption on errors
- [ ] IDs are unique and sequential

---

## 🚨 Error Handling

### Network Errors

- [ ] Server offline → Shows connection error
- [ ] Wrong API URL → Shows error
- [ ] CORS error → Fixed with backend config

### Authentication Errors

- [ ] Invalid credentials → Shows "Invalid email or password"
- [ ] Duplicate email → Shows "User already exists"
- [ ] Missing fields → Form validation prevents submission
- [ ] Invalid token → Redirects to login

### Validation Errors

- [ ] Email validation works
- [ ] Password confirmation validation works
- [ ] Empty field validation works

---

## 📱 Browser Console Check

### No Errors

- [ ] Open DevTools (F12)
- [ ] Check Console tab
- [ ] No red error messages
- [ ] No CORS warnings
- [ ] Auth setup messages visible

### Token Verification

- [ ] Console shows auth status
- [ ] Token verification on page load works
- [ ] No unhandled promise rejections

---

## ✅ Final Checklist

- [ ] All setup steps completed
- [ ] Backend running without errors
- [ ] Frontend pages loading correctly
- [ ] Authentication working (register/login)
- [ ] Authorization working (admin/customer roles)
- [ ] Tokens being created and stored
- [ ] Protected routes working correctly
- [ ] Logout functionality working
- [ ] API endpoints responding correctly
- [ ] No console errors
- [ ] Database being updated
- [ ] UI is responsive and clean

---

## 🎉 Success!

If all checkboxes are checked, your authentication and authorization system is working correctly!

### Next Steps:

1. Test with your actual use cases
2. Create more user accounts
3. Test order placement and management
4. Test admin functions (product management)
5. Deploy to production (with HTTPS)
6. Set secure JWT secret in .env

---

## 📞 Troubleshooting

If any check fails, refer to:

- `QUICK_START.md` - Setup help
- `AUTHENTICATION.md` - Detailed documentation
- `CHANGES_SUMMARY.md` - Implementation details

---

**Last Updated:** August 14, 2024
