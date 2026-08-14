const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, "db.json");
const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

app.use(cors());
app.use(express.json());

// Serve uploaded images
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// Multer setup for handling image uploads
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  },
});
const upload = multer({ storage });

// Helper function to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    const db = JSON.parse(data);
    if (!db.products) db.products = [];
    if (!db.orders) db.orders = [];
    if (!db.users) db.users = [];
    return db;
  } catch (err) {
    return { products: [], orders: [], users: [] };
  }
};

// Helper function to write DB
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), "utf8");
};

// ============== AUTHENTICATION MIDDLEWARE ==============

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check admin role
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
};

// ============== AUTHENTICATION ROUTES ==============

// User Registration
app.post("/api/auth/register", (req, res) => {
  try {
    const db = readDB();
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required" });
    }

    // Check if user already exists
    const existingUser = db.users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user with customer role by default
    const newUser = {
      id: db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
      name,
      email,
      password: hashedPassword,
      role: "customer", // Default role
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// User Login
app.post("/api/auth/login", (req, res) => {
  try {
    const db = readDB();
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = db.users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get Current User
app.get("/api/auth/me", verifyToken, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============== PRODUCTS ROUTES (with authorization) ==============

app.get("/api/products", (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// GET single product
app.get("/api/products/:id", (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// POST new product (Add Stock) - Admin only - supports image upload via multipart/form-data
app.post(
  "/api/products",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  (req, res) => {
    const db = readDB();
    // req.body contains text fields when using multipart/form-data
    const newProduct = req.body || {};

    // If an image file was uploaded, attach its public path
    if (req.file) {
      newProduct.image = `/uploads/${req.file.filename}`;
    }

    // Normalize numeric fields if provided as strings
    if (newProduct.price) newProduct.price = parseInt(newProduct.price);

    // Provide defaults
    newProduct.inStock =
      newProduct.inStock === undefined
        ? true
        : newProduct.inStock === "false"
          ? false
          : Boolean(newProduct.inStock);
    newProduct.rating = newProduct.rating ? Number(newProduct.rating) : 5.0;
    newProduct.reviews = newProduct.reviews ? Number(newProduct.reviews) : 0;
    newProduct.color = newProduct.color || "#ffffff";
    newProduct.svgPath =
      newProduct.svgPath || '<circle cx="12" cy="12" r="8" fill="#ccc"/>';

    // Generate simple ID
    newProduct.id =
      db.products.length > 0
        ? Math.max(...db.products.map((p) => p.id)) + 1
        : 1;

    db.products.push(newProduct);
    writeDB(db);

    res.status(201).json(newProduct);
  },
);

// PUT update product (Update Price, Stock status, image etc) - Admin only - accepts multipart/form-data too
app.put(
  "/api/products/:id",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  (req, res) => {
    const db = readDB();
    const index = db.products.findIndex(
      (p) => p.id === parseInt(req.params.id),
    );

    if (index !== -1) {
      // If an image was uploaded, update the image path
      if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
      }

      // Normalize numeric updates
      if (req.body && req.body.price) req.body.price = parseInt(req.body.price);

      db.products[index] = { ...db.products[index], ...req.body };
      writeDB(db);
      res.json(db.products[index]);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  },
);

// DELETE product (Remove Stock) - Admin only
app.delete("/api/products/:id", verifyToken, verifyAdmin, (req, res) => {
  const db = readDB();
  const initialLength = db.products.length;

  db.products = db.products.filter((p) => p.id !== parseInt(req.params.id));

  if (db.products.length < initialLength) {
    writeDB(db);
    res.json({ message: "Product deleted" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// ============== ORDERS ROUTES (with authentication) ==============

// GET all orders - Admin only
app.get("/api/orders", verifyToken, verifyAdmin, (req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

// GET single order - User can view their own, Admin can view any
app.get("/api/orders/:id", verifyToken, (req, res) => {
  const db = readDB();
  const order = (db.orders || []).find((o) => o.orderId === req.params.id);
  if (order) {
    // Check authorization: Admin can view any order, customers can view their own
    if (req.user.role === "admin" || order.userId === req.user.id) {
      res.json(order);
    } else {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }
  } else {
    res.status(404).json({ message: "Order not found" });
  }
});

// POST new order - Authenticated users only
app.post("/api/orders", verifyToken, (req, res) => {
  const db = readDB();
  const newOrder = req.body;

  // Ensure orderId is unique and attach user ID
  if (!newOrder.orderId) {
    newOrder.orderId = "FC-" + Math.floor(100000 + Math.random() * 900000);
  }

  newOrder.userId = req.user.id; // Attach current user ID to order
  newOrder.createdAt = new Date().toISOString();

  if (!db.orders) db.orders = [];
  db.orders.push(newOrder);
  writeDB(db);

  res.status(201).json(newOrder);
});

// PUT update order status - Admin only
app.put("/api/orders/:id/status", verifyToken, verifyAdmin, (req, res) => {
  const db = readDB();
  if (!db.orders) db.orders = [];

  const index = db.orders.findIndex((o) => o.orderId === req.params.id);

  if (index !== -1) {
    db.orders[index].status = req.body.status;
    db.orders[index].updatedAt = new Date().toISOString();
    writeDB(db);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
});

// ============== USER MANAGEMENT ROUTES (Admin only) ==============

// Get all users - Admin only
app.get("/api/users", verifyToken, verifyAdmin, (req, res) => {
  try {
    const db = readDB();
    // Return users without passwords
    const users = db.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user role - Admin only
app.put("/api/users/:id/role", verifyToken, verifyAdmin, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find((u) => u.id === parseInt(req.params.id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = req.body.role; // e.g., "customer" or "admin"
    writeDB(db);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============== SERVER START ==============

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
