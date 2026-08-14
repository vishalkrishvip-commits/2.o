const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, "db.json");

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
    return db;
  } catch (err) {
    return { products: [], orders: [] };
  }
};

// Helper function to write DB
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), "utf8");
};

// GET all products
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

// POST new product (Add Stock) - supports image upload via multipart/form-data
app.post("/api/products", upload.single("image"), (req, res) => {
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
    db.products.length > 0 ? Math.max(...db.products.map((p) => p.id)) + 1 : 1;

  db.products.push(newProduct);
  writeDB(db);

  res.status(201).json(newProduct);
});

// PUT update product (Update Price, Stock status, image etc) - accepts multipart/form-data too
app.put("/api/products/:id", upload.single("image"), (req, res) => {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === parseInt(req.params.id));

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
});

// DELETE product (Remove Stock)
app.delete("/api/products/:id", (req, res) => {
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

// GET all orders
app.get("/api/orders", (req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

// GET single order
app.get("/api/orders/:id", (req, res) => {
  const db = readDB();
  const order = (db.orders || []).find((o) => o.orderId === req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
});

// POST new order
app.post("/api/orders", (req, res) => {
  const db = readDB();
  const newOrder = req.body;

  // Ensure orderId is unique (though frontend generates it, it's good practice)
  if (!newOrder.orderId) {
    newOrder.orderId = "FC-" + Math.floor(100000 + Math.random() * 900000);
  }

  if (!db.orders) db.orders = [];
  db.orders.push(newOrder);
  writeDB(db);

  res.status(201).json(newOrder);
});

// PUT update order status
app.put("/api/orders/:id/status", (req, res) => {
  const db = readDB();
  if (!db.orders) db.orders = [];

  const index = db.orders.findIndex((o) => o.orderId === req.params.id);

  if (index !== -1) {
    db.orders[index].status = req.body.status;
    writeDB(db);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
