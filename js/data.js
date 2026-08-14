/**
 * Grocery Delivery Platform - Shared Data & Cart Management
 *
 * This file contains the mock product database and functions to manage
 * the cart state using browser LocalStorage. It is shared across all pages.
 */

let PRODUCTS = [];
const API_BASE = "http://localhost:3000";

// Load products from backend
async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    if (!response.ok) throw new Error("Failed to fetch");
    PRODUCTS = await response.json();
  } catch (e) {
    console.error("Error loading products from backend:", e);
    PRODUCTS = [];
  }
}

// 2. Cart LocalStorage Operations
function getCart() {
  try {
    const cart = localStorage.getItem("gdp_cart");
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error("Error loading cart:", e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("gdp_cart", JSON.stringify(cart));
    updateNavbarCartBadge();
    // Dispatch custom event to notify other scripts of cart change
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch (e) {
    console.error("Error saving cart:", e);
  }
}

function addToCart(productId, qty = 1) {
  // Prevent adding out-of-stock items
  const product = PRODUCTS.find((p) => p.id === productId);
  if (product && product.inStock === false) {
    alert("Sorry, this product is currently out of stock.");
    return;
  }

  let cart = getCart();
  const existingIndex = cart.findIndex((item) => item.id === productId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({ id: productId, quantity: qty });
  }
  saveCart(cart);
}

function updateCartQty(productId, qty) {
  let cart = getCart();
  const index = cart.findIndex((item) => item.id === productId);

  if (index > -1) {
    if (qty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = qty;
    }
    saveCart(cart);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotals() {
  const cart = getCart();
  let subtotal = 0;

  cart.forEach((cartItem) => {
    const product = PRODUCTS.find((p) => p.id === cartItem.id);
    if (product) {
      subtotal += product.price * cartItem.quantity;
    }
  });

  const deliveryFee = subtotal > 300 || subtotal === 0 ? 0 : 30; // Free delivery over ₹300
  const tax = Math.round(subtotal * 0.05); // 5% GST

  // Check for applied promo codes (stored in session or local storage)
  const promoCode = localStorage.getItem("gdp_promo_code");
  let discount = 0;
  if (promoCode === "SAVE50" && subtotal > 200) {
    discount = 50;
  } else if (promoCode === "WELCOME10") {
    discount = Math.round(subtotal * 0.1);
  }

  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  return {
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
  };
}

// 3. Sync UI Navbar
function updateNavbarCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const count = getCartCount();
    badge.innerText = count;
    if (count > 0) {
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
}

// Render dynamic SVGs for products
function renderProductSVG(productId, size = 100) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return "";
  if (product.image) {
    const src = product.image.startsWith("/")
      ? API_BASE + product.image
      : product.image;
    return `<img src="${src}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:12px;">`;
  }

  return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" style="background-color: ${product.color || "#f4f4f4"}; border-radius: 12px; padding: 10px;">
            ${product.svgPath}
        </svg>
    `;
}

// Document ready update
document.addEventListener("DOMContentLoaded", () => {
  updateNavbarCartBadge();

  // Automatically update badge when cart changes (e.g. storage events or custom events)
  window.addEventListener("storage", updateNavbarCartBadge);
  window.addEventListener("cartUpdated", updateNavbarCartBadge);
});
