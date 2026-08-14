# FreshCart - Grocery Delivery Application

> A full-stack grocery delivery platform with **JWT-based authentication, role-based authorization, and complete product & order management system**.

---

## 🚀 Quick Start (< 5 minutes)

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Start Backend Server

```bash
npm start
# Output: Backend server running at http://localhost:3000
```

### 3. Open Application

Open `login1.html` in your browser

### 4. Login with Demo Credentials

- **Admin:** `vishalkrishvip@gmail.com` / `#password`
- **Customer:** `customer@example.com` / `customer123`

---

## 📋 Features

### 🔐 Authentication & Security

- ✅ User registration with email/password
- ✅ Secure login with JWT tokens (7-day expiry)
- ✅ Password hashing with bcryptjs
- ✅ Token-based authentication
- ✅ Automatic session management
- ✅ Role-based access control

### 👥 Role-Based Access

- ✅ **Admin Dashboard:** Full product and order management
- ✅ **Customer Portal:** Browse products and manage orders
- ✅ **Route Protection:** Pages require proper authentication/roles

### 🛒 Product Management (Admin)

- ✅ Add new products
- ✅ Update product details
- ✅ Delete products
- ✅ Upload product images
- ✅ Manage inventory status

### 📦 Order Management

- ✅ Customers: Place orders
- ✅ Customers: View their orders
- ✅ Admin: View all orders
- ✅ Admin: Update order status

### 💾 Data Management

- ✅ JSON-based database (db.json)
- ✅ User management
- ✅ Product catalog
- ✅ Order tracking

---

## 📁 Project Structure

```
PROJECT 1/
├── backend/                    # Node.js/Express Backend
│   ├── server.js              # Main server with auth endpoints
│   ├── db.json                # JSON database
│   ├── package.json           # Dependencies
│   ├── setup.js               # Initialize demo users
│   ├── .env.example           # Environment template
│   ├── install.bat            # Windows installer
│   └── uploads/               # Uploaded images
│
├── js/                         # Frontend JavaScript
│   ├── auth.js                # Authentication utility (NEW)
│   ├── main.js                # Main page logic
│   ├── admin.js               # Admin dashboard logic
│   ├── cart.js                # Shopping cart
│   ├── checkout.js            # Checkout process
│   ├── detail.js              # Product details
│   └── ...
│
├── css/                        # Stylesheets
│   └── style.css
│
├── images/                     # Static images
│
├── login1.html                # Login/Register page (UPDATED)
├── home.html                  # Customer home page
├── admin.html                 # Admin dashboard (UPDATED)
├── cart.html                  # Shopping cart
├── checkout.html              # Checkout page
│
├── QUICK_START.md            # Quick setup guide (NEW)
├── AUTHENTICATION.md          # Full auth documentation (NEW)
├── CHANGES_SUMMARY.md        # Implementation summary (NEW)
├── VERIFICATION_CHECKLIST.md # Testing checklist (NEW)
└── README.md                 # This file
```

---

## 🔧 Technology Stack

### Frontend

- HTML5, CSS3, JavaScript (Vanilla)
- JWT token management
- LocalStorage for session persistence

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT generation/verification
- **multer** - File upload handling
- **CORS** - Cross-origin support

### Database

- JSON file (`db.json`) - Document-style storage

---

## 🔐 Authentication Flow

### Registration

```
User → Register Form → Backend validates → Hash password → Save user → Generate JWT → Store token → Redirect
```

### Login

```
User → Login Form → Backend validates credentials → Generate JWT → Store token → Redirect based on role
```

### Protected Routes

```
User Request → Check token → Verify signature → Check role → Process or deny
```

---

## 📊 Database Schema

### Users

```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed_password_bcryptjs",
  "role": "admin|customer",
  "createdAt": "2024-08-14T00:00:00Z"
}
```

### Products

```json
{
  "id": 1,
  "name": "Product Name",
  "category": "vegetables",
  "price": 100,
  "unit": "1 kg",
  "image": "/uploads/image.jpg",
  "inStock": true,
  "rating": 4.5,
  "reviews": 10
}
```

### Orders

```json
{
  "orderId": "FC-123456",
  "userId": 2,
  "items": [...],
  "totalPrice": 500,
  "status": "pending|confirmed|delivered",
  "createdAt": "2024-08-14T00:00:00Z"
}
```

---

## 🔗 API Endpoints

### Authentication

```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get current user (protected)
```

### Products (Public read, Admin write)

```
GET    /api/products           # List all products
GET    /api/products/:id       # Get single product
POST   /api/products           # Create product (admin only)
PUT    /api/products/:id       # Update product (admin only)
DELETE /api/products/:id       # Delete product (admin only)
```

### Orders (Protected)

```
GET    /api/orders             # Get all orders (admin only)
GET    /api/orders/:id         # Get order (customer sees own)
POST   /api/orders             # Create order (authenticated)
PUT    /api/orders/:id/status  # Update status (admin only)
```

### Users (Admin only)

```
GET    /api/users              # List all users (admin only)
PUT    /api/users/:id/role     # Change user role (admin only)
```

---

## 🛠️ Setup Instructions

### Windows

1. **Open Command Prompt or PowerShell**
2. **Navigate to project:**

   ```bash
   cd "c:\Users\visha\OneDrive\Desktop\PROJECT 1"
   ```

3. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

4. **Start server:**

   ```bash
   npm start
   ```

5. **Open browser:**
   - Navigate to `login1.html`
   - Or use: `file:///c:/Users/visha/OneDrive/Desktop/PROJECT%201/login1.html`

### Mac/Linux

1. **Open Terminal**
2. **Navigate to project:**

   ```bash
   cd "PROJECT 1"
   ```

3. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

4. **Start server:**

   ```bash
   npm start
   ```

5. **Open browser:**
   - Open `login1.html` or use local server

---

## 💡 Usage Examples

### Check User Authentication

```javascript
<script src="js/auth.js"></script>;

if (AUTH.isAuthenticated()) {
  console.log("User is logged in");
  const user = AUTH.getUser();
  console.log(user.name, user.email, user.role);
}
```

### Protect a Page

```javascript
// Require login
AUTH.protectRoute();

// Require admin role
AUTH.protectRoute("admin");
```

### Make API Calls

```javascript
// Automatically includes JWT token
const response = await AUTH.fetch("/api/products", { method: "GET" });
const data = await response.json();
```

### Logout User

```javascript
AUTH.logout(); // Clears tokens and redirects to login
```

---

## 📚 Documentation

| Document                                                 | Purpose                     |
| -------------------------------------------------------- | --------------------------- |
| [QUICK_START.md](./QUICK_START.md)                       | 5-minute setup guide        |
| [AUTHENTICATION.md](./AUTHENTICATION.md)                 | Complete auth documentation |
| [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)               | Implementation details      |
| [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) | Testing guide               |

---

## 🧪 Testing

### Test Admin Features

1. Login as `admin@example.com` / `admin123`
2. Navigate to admin dashboard
3. Try adding/editing/deleting products
4. View all orders

### Test Customer Features

1. Login as `customer@example.com` / `customer123`
2. Browse products
3. Add to cart
4. Place order
5. View order history

### Test Registration

1. Click "Register" on login page
2. Fill in details
3. Create account
4. Should auto-login and redirect

---

## ⚠️ Troubleshooting

### Server won't start

- Make sure port 3000 is available
- Check Node.js is installed: `node --version`
- Delete node_modules and reinstall: `npm install`

### Login not working

- Verify backend server is running
- Check credentials: `admin@example.com` / `admin123`
- Run setup script: `node setup.js`
- Check browser console for errors

### CORS errors

- Backend should be running at `http://localhost:3000`
- Check api URL in auth.js
- Verify CORS is enabled in server.js

### Routes not protected

- Include `auth.js` in your pages
- Call `AUTH.protectRoute('admin')` at page load
- Check browser console for errors

---

## 🔒 Security Notes

⚠️ **For Development Only**

- Default JWT secret should be changed in production
- Use HTTPS instead of HTTP
- Consider moving to a real database
- Store sensitive config in .env file
- Never commit .env file to version control

---

## 🚀 Production Deployment

### Before Deploying:

1. Change JWT_SECRET in `.env`
2. Use HTTPS/SSL certificates
3. Set NODE_ENV=production
4. Use a real database (MongoDB, PostgreSQL)
5. Enable rate limiting
6. Set up logging and monitoring
7. Use environment-based configuration

### Hosting Options:

- Heroku
- AWS (EC2, Lambda)
- DigitalOcean
- Azure
- Vercel (Frontend) + Express Server

---

## 📞 Support & Documentation

- Check [QUICK_START.md](./QUICK_START.md) for setup help
- See [AUTHENTICATION.md](./AUTHENTICATION.md) for API details
- Review [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) for implementation
- Use [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) for testing

---

## 📝 Git Commands for Updates

Push your changes:

```bash
git add .
git commit -m "Add authentication and authorization"
git push -u origin main
```

---

## 🎯 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] User profile management
- [ ] Payment integration
- [ ] Real-time notifications
- [ ] Admin analytics dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Referral system

---

## 📄 License

This project is open source and available for educational and commercial use.

---

## 👨‍💻 Author

FreshCart - Full Stack Grocery Delivery Platform

- Built with Node.js/Express + Vanilla JS
- Implements JWT-based authentication
- Role-based authorization system

---

## ✅ Checklist Before Going Live

- [ ] All authentication features tested
- [ ] Admin dashboard working
- [ ] Customer portal working
- [ ] Orders can be placed and tracked
- [ ] Images uploading correctly
- [ ] Database persisting data
- [ ] No console errors
- [ ] Responsive design checked
- [ ] Security measures implemented
- [ ] Documentation complete

---

**Last Updated:** August 14, 2024  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing and Deployment
