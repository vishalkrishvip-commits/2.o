/**
 * Grocery Delivery Platform - Product Detail Logic
 *
 * Extracts product ID from URL query parameters, renders product detail,
 * manages quantity selectors, populates nutritional tables, and renders similar products.
 */

let currentProduct = null;
let currentQtyInCart = 0;

document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();

  // 1. Get Product ID from URL parameters
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));

  if (!productId || isNaN(productId)) {
    showErrorState("Invalid Product ID.");
    return;
  }

  // 2. Find product
  currentProduct = PRODUCTS.find((p) => p.id === productId);

  if (!currentProduct) {
    showErrorState("Product not found in our catalog.");
    return;
  }

  // 3. Initial Render
  updateQtyState();
  renderProductDetail();
  renderRelatedProducts();

  // 4. Setup search bar redirect
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim();
      if (query) {
        window.location.href = `index.html?q=${encodeURIComponent(query)}`;
      }
    }
  });

  // 5. Update qty count if localstorage changes elsewhere
  window.addEventListener("cartUpdated", () => {
    updateQtyState();
    renderProductDetail();
  });
});

// Sync local quantity state with getCart() helper
function updateQtyState() {
  const cart = getCart();
  const cartItem = cart.find((item) => item.id === currentProduct.id);
  currentQtyInCart = cartItem ? cartItem.quantity : 0;
}

// Error state display
function showErrorState(message) {
  const container = document.getElementById("product-detail-card");
  if (!container) return;
  container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
            <h2 style="color: var(--danger); margin-bottom: 15px;">Oops!</h2>
            <p>${message}</p>
            <a href="index.html" class="hero-btn" style="margin-top: 20px; display: inline-block;">Return to Shop</a>
        </div>
    `;
}

// Main card render
function renderProductDetail() {
  const container = document.getElementById("product-detail-card");
  if (!container || !currentProduct) return;

  // Check discount calculations
  const discountPercentage = Math.round(
    ((currentProduct.originalPrice - currentProduct.price) /
      currentProduct.originalPrice) *
      100,
  );

  // Build nutritional facts table if available
  let nutritionRows = "";
  if (currentProduct.nutritionalFacts) {
    nutritionRows = Object.entries(currentProduct.nutritionalFacts)
      .map(
        ([key, val]) => `
            <tr>
                <td><strong>${key}</strong></td>
                <td>${val}</td>
            </tr>
        `,
      )
      .join("");
  }

  container.innerHTML = `
        <!-- Image display -->
        <div class="detail-img-container" style="background-color: ${currentProduct.color || "#f4f4f4"}">
            ${renderProductSVG(currentProduct.id, 240)}
        </div>

        <!-- Text details and actions -->
        <div class="detail-info">
            <div class="detail-badge-row">
                <span class="detail-category">${currentProduct.category}</span>
                ${currentProduct.organic ? `<span class="organic-badge" style="position: static; padding: 4px 10px;">Organic</span>` : ""}
                <span class="organic-badge" style="position: static; background-color: var(--accent); color: var(--text-main); padding: 4px 10px;">-${discountPercentage}% OFF</span>
            </div>

            <h1 class="detail-title">${currentProduct.name}</h1>

            <div class="detail-meta-row">
                <div class="product-rating" style="margin-bottom: 0;">
                    <svg class="star-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    <span style="font-size: 1rem; font-weight: 600;">${currentProduct.rating}</span>
                    <span class="rating-count" style="font-size: 0.9rem;">(${currentProduct.reviews} verified reviews)</span>
                </div>
            </div>

            <div class="detail-price-box">
                <span class="detail-price">₹${currentProduct.price}</span>
                <span class="product-original-price" style="font-size: 1.1rem; margin-right: 10px;">₹${currentProduct.originalPrice}</span>
                <span class="product-unit" style="font-size: 0.95rem;">Pack size: <b>${currentProduct.unit}</b></span>
            </div>

            <p class="detail-desc">${currentProduct.description}</p>

            <div class="detail-action-row">
                ${
                  currentProduct.inStock === false
                    ? `
                    <button class="detail-out-stock" disabled style="background:#d32f2f;color:#fff;padding:10px 16px;border-radius:6px;border:none;">Out of Stock</button>
                `
                    : currentQtyInCart > 0
                      ? `
                    <div class="qty-counter">
                        <button class="qty-btn" onclick="updateDetailQty(${currentQtyInCart - 1})">-</button>
                        <span class="qty-number">${currentQtyInCart}</span>
                        <button class="qty-btn" onclick="updateDetailQty(${currentQtyInCart + 1})">+</button>
                    </div>
                `
                      : `
                    <button class="detail-add-btn" onclick="addDetailToCart()">Add to Basket</button>
                `
                }
            </div>

            <!-- Nutritional details card grid -->
            ${
              nutritionRows
                ? `
                <div class="nutrition-panel">
                    <h3 class="nutrition-title">Nutritional Value (per serving)</h3>
                    <table class="nutrition-table">
                        <tbody>
                            ${nutritionRows}
                        </tbody>
                    </table>
                </div>
            `
                : ""
            }
        </div>
    `;
}

// Render similar items
function renderRelatedProducts() {
  const grid = document.getElementById("related-products-grid");
  if (!grid || !currentProduct) return;

  // Filter products of same category, excluding the current one, select max 4 items
  const related = PRODUCTS.filter(
    (p) => p.category === currentProduct.category && p.id !== currentProduct.id,
  ).slice(0, 4);
  const cart = getCart();

  if (related.length === 0) {
    grid.parentNode.style.display = "none"; // Hide section if no related items
    return;
  }

  grid.innerHTML = related
    .map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      const quantity = cartItem ? cartItem.quantity : 0;

      return `
            <div class="product-card" id="product-${product.id}">
                ${product.organic ? `<div class="organic-badge">Organic</div>` : ""}
                
                <div class="product-img-wrapper" onclick="viewRelatedDetail(${product.id})">
                    ${renderProductSVG(product.id, 100)}
                </div>

                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name" onclick="viewRelatedDetail(${product.id})">${product.name}</h3>
                    
                    <div class="product-rating">
                        <svg class="star-icon" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        <span>${product.rating}</span>
                    </div>

                    <div class="product-footer">
                        <div class="price-container">
                            <span class="product-price">₹${product.price}</span>
                            <span class="product-unit">${product.unit}</span>
                        </div>
                        
                        <div class="action-btn-container">
                            ${
                              product.inStock === false
                                ? `
                                <button class="out-stock-badge" disabled style="background:#d32f2f;color:#fff;padding:6px 10px;border-radius:6px;border:none;">Out of Stock</button>
                            `
                                : quantity > 0
                                  ? `
                                <div class="qty-counter">
                                    <button class="qty-btn" onclick="changeRelatedQty(${product.id}, ${quantity - 1})">-</button>
                                    <span class="qty-number">${quantity}</span>
                                    <button class="qty-btn" onclick="changeRelatedQty(${product.id}, ${quantity + 1})">+</button>
                                </div>
                            `
                                  : `
                                <button class="add-btn" onclick="addRelatedToCart(${product.id})">Add</button>
                            `
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// Redirect related clicks
window.viewRelatedDetail = function (productId) {
  window.location.href = `product-detail.html?id=${productId}`;
};

// Quantity controls for main product details
window.addDetailToCart = function () {
  addToCart(currentProduct.id, 1);
  showToast(`Added ${currentProduct.name} to cart!`);
  updateQtyState();
  renderProductDetail();
};

window.updateDetailQty = function (nextQty) {
  updateCartQty(currentProduct.id, nextQty);
  if (nextQty === 0) {
    showToast(`Removed ${currentProduct.name} from cart`);
  } else {
    showToast(`Updated quantity of ${currentProduct.name}`);
  }
  updateQtyState();
  renderProductDetail();
};

// Quantity controls for related list cards
window.addRelatedToCart = function (productId) {
  addToCart(productId, 1);
  const product = PRODUCTS.find((p) => p.id === productId);
  showToast(`Added ${product.name} to cart!`);
  renderRelatedProducts();
};

window.changeRelatedQty = function (productId, nextQty) {
  updateCartQty(productId, nextQty);
  renderRelatedProducts();
};

// Toast notification helper
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
        <svg class="toast-success-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 2500);
}
