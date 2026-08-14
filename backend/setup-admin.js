#!/usr/bin/env node
/**
 * FreshCart Admin Setup Script
 * Initializes database with proper admin accounts and demo data
 * Run: node backend/setup-admin.js
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "db.json");

// Helper function to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err.message);
    process.exit(1);
  }
};

// Helper function to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), "utf8");
    console.log("✓ Database updated successfully");
  } catch (err) {
    console.error("Error writing database:", err.message);
    process.exit(1);
  }
};

// Admin user setup
const adminUsers = [
  {
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    email: "admin@freshcart.com",
    password: "Admin@123",
    name: "Admin",
    role: "admin",
  },
];

// Customer user setup
const customerUsers = [
  {
    email: "customer@example.com",
    password: "customer123",
    name: "Customer User",
    role: "customer",
  },
];

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log("║          FreshCart Admin Setup Script                  ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

try {
  const db = readDB();
  if (!db.users) db.users = [];

  console.log("📋 Current Users in Database:");
  console.log("─".repeat(50));
  db.users.forEach((user, idx) => {
    console.log(
      `  ${idx + 1}. ${user.name} (${user.email}) - Role: ${user.role}`,
    );
  });
  console.log();

  // Setup admin accounts
  console.log("⚙️  Setting up Admin Accounts...");
  console.log("─".repeat(50));
  adminUsers.forEach((adminData) => {
    const exists = db.users.find((u) => u.email === adminData.email);
    if (!exists) {
      const newAdmin = {
        id:
          db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
        name: adminData.name,
        email: adminData.email,
        password: bcrypt.hashSync(adminData.password, 10),
        role: adminData.role,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newAdmin);
      console.log(`✓ Created admin: ${adminData.email}`);
    } else {
      console.log(`ℹ Admin already exists: ${adminData.email}`);
    }
  });
  console.log();

  // Setup customer accounts
  console.log("⚙️  Setting up Customer Accounts...");
  console.log("─".repeat(50));
  customerUsers.forEach((customerData) => {
    const exists = db.users.find((u) => u.email === customerData.email);
    if (!exists) {
      const newCustomer = {
        id:
          db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
        name: customerData.name,
        email: customerData.email,
        password: bcrypt.hashSync(customerData.password, 10),
        role: customerData.role,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newCustomer);
      console.log(`✓ Created customer: ${customerData.email}`);
    } else {
      console.log(`ℹ Customer already exists: ${customerData.email}`);
    }
  });
  console.log();

  // Write updated database
  writeDB(db);

  // Display setup summary
  console.log("✅ Setup Complete!\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║              📝 Admin Login Credentials                 ║");
  console.log("╠════════════════════════════════════════════════════════╣");
  adminUsers.forEach((admin) => {
    console.log(`║  Email: ${admin.email.padEnd(44)} ║`);
    console.log(`║  Password: ${admin.password.padEnd(40)} ║`);
  });
  console.log("╠════════════════════════════════════════════════════════╣");
  console.log("║            👤 Customer Login Credentials               ║");
  console.log("╠════════════════════════════════════════════════════════╣");
  customerUsers.forEach((customer) => {
    console.log(`║  Email: ${customer.email.padEnd(44)} ║`);
    console.log(`║  Password: ${customer.password.padEnd(40)} ║`);
  });
  console.log("╚════════════════════════════════════════════════════════╝\n");

  console.log("Next steps:");
  console.log("1. Start the server: npm start");
  console.log("2. Open login1.html in your browser");
  console.log("3. Login with admin credentials above");
  console.log("4. Access admin.html to manage products\n");
} catch (error) {
  console.error("❌ Setup failed:", error.message);
  process.exit(1);
}
