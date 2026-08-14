/**
 * Setup Script - Initialize Demo Users
 * Run this script to set up demo users with proper hashed passwords
 * Usage: node setup.js
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "db.json");

// Demo users to create
const DEMO_USERS = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Customer User",
    email: "customer@example.com",
    password: "customer123",
    role: "customer",
  },
];

async function setupDemoUsers() {
  try {
    console.log("📋 Starting FreshCart Authentication Setup...\n");

    // Read existing database
    let db = { products: [], orders: [], users: [] };
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf8");
      db = JSON.parse(data);
      if (!db.users) db.users = [];
    }

    // Check if users already exist
    const existingEmails = db.users.map((u) => u.email);
    const newUsers = [];

    for (const user of DEMO_USERS) {
      if (existingEmails.includes(user.email)) {
        console.log(`⏭️  User ${user.email} already exists. Skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(user.password, 10);

      // Create user object
      const newUser = {
        id:
          db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      newUsers.push(user);
      console.log(`✅ Created ${user.role} user: ${user.email}`);
    }

    // Save to database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4), "utf8");
    console.log("\n💾 Database updated successfully!\n");

    // Display credentials
    console.log("═════════════════════════════════════════");
    console.log("🔐 Authentication Setup Complete!");
    console.log("═════════════════════════════════════════\n");

    console.log("📧 Demo Credentials:\n");
    for (const user of newUsers) {
      console.log(`  Role: ${user.role.toUpperCase()}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log("");
    }

    console.log("═════════════════════════════════════════");
    console.log("🚀 Next Steps:");
    console.log("═════════════════════════════════════════");
    console.log("1. Install dependencies: npm install");
    console.log("2. Start the server: npm start");
    console.log("3. Open login1.html in browser");
    console.log("4. Use demo credentials to login\n");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run setup
setupDemoUsers();
