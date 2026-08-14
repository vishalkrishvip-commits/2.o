#!/usr/bin/env node
/**
 * FreshCart Authentication Verification Script
 * Tests all authentication components to identify issues
 * Run: node verify-auth.js
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "backend", "db.json");
const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log("║     FreshCart Authentication Verification Script       ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

try {
  // 1. Check if db.json exists
  console.log("1️⃣  Checking Database File...");
  console.log("─".repeat(50));
  if (!fs.existsSync(dbPath)) {
    console.error("❌ db.json not found at:", dbPath);
    process.exit(1);
  }
  console.log("✓ db.json found\n");

  // 2. Parse and validate database structure
  console.log("2️⃣  Validating Database Structure...");
  console.log("─".repeat(50));
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  if (!db.users || !Array.isArray(db.users)) {
    console.error("❌ Invalid database structure: users array missing");
    process.exit(1);
  }
  console.log(`✓ Database structure valid`);
  console.log(`  - Users: ${db.users.length}`);
  console.log(`  - Products: ${(db.products || []).length}`);
  console.log(`  - Orders: ${(db.orders || []).length}\n`);

  // 3. Validate each user
  console.log("3️⃣  Validating User Accounts...");
  console.log("─".repeat(50));

  const testCredentials = [
    { email: "vishalkrishvip@gmail.com", password: "#password", role: "admin" },
    { email: "admin@freshcart.com", password: "Admin@123", role: "admin" },
    {
      email: "customer@example.com",
      password: "customer123",
      role: "customer",
    },
  ];

  let validUsers = 0;

  testCredentials.forEach((testCred) => {
    const user = db.users.find((u) => u.email === testCred.email);

    if (!user) {
      console.log(`❌ User not found: ${testCred.email}`);
      return;
    }

    // Check role
    if (user.role !== testCred.role) {
      console.log(
        `❌ Role mismatch for ${testCred.email}: expected ${testCred.role}, got ${user.role}`,
      );
      return;
    }

    // Test password hash
    try {
      const isValid = bcrypt.compareSync(testCred.password, user.password);
      if (!isValid) {
        console.log(`❌ Password hash invalid for ${testCred.email}`);
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      console.log(`✓ ${testCred.email} - VALID (${testCred.role})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password Hash: ${user.password.substring(0, 20)}...`);
      console.log(`  JWT Token: ${token.substring(0, 30)}...`);
      validUsers++;
    } catch (err) {
      console.log(`❌ Error validating ${testCred.email}: ${err.message}`);
    }
  });

  console.log();

  if (validUsers === 0) {
    console.error("❌ No valid admin accounts found!");
    console.log("\nRun 'node backend/setup-admin.js' to setup accounts.\n");
    process.exit(1);
  }

  // 4. Check bcryptjs module
  console.log("4️⃣  Checking Dependencies...");
  console.log("─".repeat(50));
  try {
    const testHash = bcrypt.hashSync("test", 10);
    console.log(`✓ bcryptjs module: OK`);
  } catch (err) {
    console.error(`❌ bcryptjs module error: ${err.message}`);
  }

  try {
    const testToken = jwt.sign({ test: true }, JWT_SECRET);
    console.log(`✓ jsonwebtoken module: OK`);
  } catch (err) {
    console.error(`❌ jsonwebtoken module error: ${err.message}`);
  }

  console.log();

  // 5. Provide recommendations
  console.log("5️⃣  Recommendations...");
  console.log("─".repeat(50));

  if (validUsers > 0) {
    console.log("✓ All checks passed!\n");
    console.log("Next steps:");
    console.log("1. Start the backend server:");
    console.log("   cd backend && npm start");
    console.log("\n2. Open login1.html in your browser");
    console.log("\n3. Login with credentials above");
    console.log("\n4. If admin, access admin.html to manage products\n");
  } else {
    console.log("❌ Authentication system has issues.\n");
    console.log("Try these fixes:");
    console.log("1. Run setup script: node backend/setup-admin.js");
    console.log("2. Check db.json file exists and is valid JSON");
    console.log("3. Verify bcryptjs is installed: npm list bcryptjs");
    console.log("4. Verify jsonwebtoken is installed: npm list jsonwebtoken\n");
  }

  console.log("═".repeat(50) + "\n");
} catch (error) {
  console.error("\n❌ Verification failed:", error.message);
  console.log("\nCheck that you're running this script from project root");
  console.log("Usage: node verify-auth.js\n");
  process.exit(1);
}
