# FreshCart Integration Testing Guide

**Complete Test Suite for Authentication & Authorization**

---

## 🧪 TEST ENVIRONMENT SETUP

### Prerequisites

- Node.js v14+ installed
- npm installed in backend folder
- Backend server running on port 3000
- Frontend files in project root

### Setup Steps

```bash
# 1. Navigate to project
cd "c:\Users\visha\OneDrive\Desktop\PROJECT 1"

# 2. Install dependencies (if not done)
cd backend
npm install
cd ..

# 3. Start backend server
cd backend
node server.js
# Wait for: "Backend server running at http://localhost:3000"

# 4. Open browser
# Navigate to: file:///c:/Users/visha/OneDrive/Desktop/PROJECT%201/login1.html
```

---

## ✅ TEST 1: Admin Registration & Login

### Test 1A: Register New Admin User

```
URL: login1.html
Steps:
1. Click "Register" tab
2. Full Name: Test Admin
3. Email: testadmin@freshcart.com
4. Password: TestAdmin123
5. Confirm: TestAdmin123
6. Click "Create Account"

Expected Result:
✓ Success message displayed
✓ Redirected to admin.html
✓ Dashboard loads with product table
✓ Can see "Add New Product" button
```

### Test 1B: Login as Admin

```
URL: login1.html
Steps:
1. Click "Login" tab
2. Email: admin@example.com
3. Password: admin123
4. Click "Login"

Expected Result:
✓ Success message displayed
✓ Redirected to admin.html
✓ Page title shows "Admin Dashboard"
✓ Product management UI visible
✓ Logout button visible
```

### Test 1C: Verify JWT Token Stored

```
Browser Console (F12):
1. Type: localStorage.getItem('authToken')
2. Should return: eyJ... (valid JWT token)

3. Type: localStorage.getItem('user')
4. Should return: {"id":1,"name":"Admin User","email":"admin@example.com","role":"admin"}

Expected Result:
✓ Token is 3-part JWT (header.payload.signature)
✓ User object has role: "admin"
✓ User email matches login email
```

---

## ✅ TEST 2: Admin Product Management

### Test 2A: Add New Product

```
URL: admin.html (logged in as admin)
Steps:
1. Click "+ Add New Product"
2. Product Name: Test Tomato
3. Category: vegetables
4. Price: 45
5. Unit: 1 kg
6. Select image file (optional)
7. Click "Save Product"

Expected Result:
✓ Product added to table immediately
✓ New product appears in product list
✓ Can see product ID, name, category, price
✓ Status shows "In Stock"
```

### Test 2B: Update Product Price

```
URL: admin.html (logged in as admin)
Steps:
1. Find Test Tomato product
2. Change price from 45 to 50
3. Click "Update Price"
4. Confirm alert

Expected Result:
✓ Price updated successfully
✓ Table refreshes
✓ New price (50) displayed
```

### Test 2C: Toggle Stock Status

```
URL: admin.html (logged in as admin)
Steps:
1. Find Test Tomato product
2. Click "Toggle Stock"

Expected Result:
✓ Status changes to "Out of Stock"
✓ Click again to change back to "In Stock"
```

### Test 2D: Delete Product

```
URL: admin.html (logged in as admin)
Steps:
1. Find Test Tomato product
2. Click "Delete"
3. Confirm dialog

Expected Result:
✓ Product removed from list
✓ Table refreshes
✓ Product no longer appears
```

---

## ✅ TEST 3: Customer Registration & Login

### Test 3A: Register New Customer

```
URL: login1.html
Steps:
1. Click "Register" tab
2. Full Name: Test Customer
3. Email: testcustomer@freshcart.com
4. Password: TestCustomer123
5. Confirm: TestCustomer123
6. Click "Create Account"

Expected Result:
✓ Success message displayed
✓ Redirected to home.html
✓ Customer shop page loads
✓ Can see product list (not admin dashboard)
```

### Test 3B: Login as Customer

```
URL: login1.html
Steps:
1. Click "Login" tab
2. Email: customer@example.com
3. Password: customer123
4. Click "Login"

Expected Result:
✓ Success message displayed
✓ Redirected to home.html
✓ Page shows customer interface
✓ Cannot access admin.html
```

---

## ✅ TEST 4: Authorization & Route Protection

### Test 4A: Admin-Only Route Protection

```
URL: Type in browser: file:///c:/Users/visha/OneDrive/Desktop/PROJECT%201/admin.html
Without Login:

Expected Result:
✓ Redirected to login1.html
✓ Alert shown (or console log)
✓ Cannot access admin dashboard without login
```

### Test 4B: Role-Based Access Control

```
Steps:
1. Login as customer (customer@example.com / customer123)
2. Try accessing: file:///c:/Users/visha/OneDrive/Desktop/PROJECT%201/admin.html

Expected Result:
✓ Alert: "You do not have permission to access this page. Required role: admin"
✓ Redirected to home.html
✓ Customer cannot access admin features
```

### Test 4C: Admin Can Access Admin

```
Steps:
1. Logout (if logged in as customer)
2. Login as admin (admin@example.com / admin123)
3. Access: file:///c:/Users/visha/OneDrive/Desktop/PROJECT%201/admin.html

Expected Result:
✓ Admin dashboard loads successfully
✓ Can see all products
✓ Can manage products
✓ No access restriction errors
```

---

## ✅ TEST 5: API Authorization

### Test 5A: API Call Without Token (Should Fail)

```
Browser Console:
fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({name: 'Test', price: 100})
})

Expected Result:
✗ Status: 401 Unauthorized
✗ Response: "No token provided"
```

### Test 5B: API Call With Invalid Token (Should Fail)

```
Browser Console:
fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid.token.here'
  },
  body: JSON.stringify({name: 'Test', price: 100})
})

Expected Result:
✗ Status: 403 Forbidden
✗ Response: "Invalid or expired token"
```

### Test 5C: API Call With Valid Token (Should Work)

```
Browser Console (After admin login):
const token = localStorage.getItem('authToken');
fetch('http://localhost:3000/api/products')
  .then(r => r.json())
  .then(data => console.log(data))

Expected Result:
✓ Status: 200 OK
✓ Returns array of products
✓ Products visible in console
```

---

## ✅ TEST 6: Session Management

### Test 6A: Token Expiration Handling

```
Steps:
1. Login as admin
2. Wait 1 minute (or manually invalidate token)
3. Try to add/update/delete product

Expected Result:
✓ 401 response received
✓ Auto logout triggered
✓ Redirected to login1.html
✓ Token cleared from localStorage
```

### Test 6B: Manual Logout

```
URL: admin.html (logged in)
Steps:
1. Click "Logout" button
2. Confirm redirect

Expected Result:
✓ Redirected to login1.html
✓ localStorage cleared (check in console)
✓ Cannot access admin.html without re-login
```

---

## ✅ TEST 7: Error Handling

### Test 7A: Invalid Login Credentials

```
URL: login1.html
Steps:
1. Email: admin@example.com
2. Password: wrongpassword
3. Click "Login"

Expected Result:
✓ Error message displayed
✓ NOT redirected
✓ Can try again
✓ Console shows error details
```

### Test 7B: Invalid Email Format

```
URL: login1.html > Register
Steps:
1. Name: Test
2. Email: invalidemail (missing @)
3. Password: test123
4. Click "Create Account"

Expected Result:
✓ HTML5 validation prevents submission
✓ Browser shows "Please include an @ in the email"
```

### Test 7C: Password Mismatch in Register

```
URL: login1.html > Register
Steps:
1. Name: Test
2. Email: test@test.com
3. Password: test123
4. Confirm: test456 (different)
5. Click "Create Account"

Expected Result:
✓ Error: "Passwords do not match"
✓ Account not created
```

---

## 📊 TEST RESULTS CHECKLIST

| Test                   | Status | Notes        |
| ---------------------- | ------ | ------------ |
| Admin Registration     | ⬜     | To be tested |
| Admin Login            | ⬜     | To be tested |
| JWT Token Storage      | ⬜     | To be tested |
| Add Product            | ⬜     | To be tested |
| Update Price           | ⬜     | To be tested |
| Toggle Stock           | ⬜     | To be tested |
| Delete Product         | ⬜     | To be tested |
| Customer Registration  | ⬜     | To be tested |
| Customer Login         | ⬜     | To be tested |
| Admin Route Protection | ⬜     | To be tested |
| Role-Based Access      | ⬜     | To be tested |
| API Authorization      | ⬜     | To be tested |
| Session Management     | ⬜     | To be tested |
| Error Handling         | ⬜     | To be tested |

---

## 🐛 TROUBLESHOOTING

### Problem: "Failed to fetch" error on login

**Solution:**

```bash
1. Check server is running: netstat -ano | findstr :3000
2. Start server: cd backend && node server.js
3. Refresh browser
```

### Problem: "You do not have permission to access this page"

**Solution:**

```bash
1. Check user role in localStorage: localStorage.getItem('user')
2. Ensure logging in with admin account (not customer)
3. Clear localStorage: localStorage.clear()
4. Login again
```

### Problem: Products not loading on admin.html

**Solution:**

```bash
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify Authorization header in requests
5. Check localStorage has valid token
```

### Problem: Can't logout

**Solution:**

```javascript
// Manual logout from console:
localStorage.clear();
window.location.href = "login1.html";
```

---

## 📝 NOTES

- All tests should be performed in a modern browser (Chrome, Firefox, Edge)
- Clear browser cache if seeing old behavior
- Check browser console (F12) for detailed error messages
- Backend server must be running on port 3000
- Test both admin and customer roles to verify authorization
- Database persists between sessions (saved in db.json)

---

**Test Date:** ******\_\_\_******  
**Tested By:** ******\_\_\_******  
**Status:** ******\_\_\_******  
**Notes:** ******\_\_\_******
