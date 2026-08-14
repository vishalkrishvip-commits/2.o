/**
 * Grocery Delivery Platform - Home Page Logic
 * 
 * Manages category filters, search input, sort options, 
 * product card rendering, and interactive cart controls (+/- buttons).
 */

let activeCategory = "all";
let searchQuery = "";
let sortBy = "popular";

// Define categories with labels and matching SVGs
const CATEGORIES = [
    { id: "all", name: "All Items", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>` },
    { id: "vegetables", name: "Vegetables", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C9.5 2 7.5 3.5 6.5 5.5c-1.5 0-3 1.2-3.5 2.7C2.4 9.6 3 11.4 4.3 12.4c-.8.8-1.3 2-1.3 3.3 0 2.4 1.8 4.3 4 4.3h10c2.2 0 4-1.9 4-4.3 0-1.3-.5-2.5-1.3-3.3 1.3-1 1.9-2.8 1.3-4.2-.5-1.5-2-2.7-3.5-2.7C16.5 3.5 14.5 2 12 2z"/></svg>` },
    { id: "fruits", name: "Fruits", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 5V2c2 0 3 .5 3 .5"/></svg>` },
    { id: "dairy", name: "Dairy", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M8 8l1-5h6l1 5H8z"/></svg>` },
    { id: "bakery", name: "Bakery", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10c0-3 3-5 8-5s8 2 8 5v8c0 1.5-1.5 3-3 3H7c-1.5 0-3-1.5-3-3v-8z"/><path d="M8 14h8M8 17h8"/></svg>` },
    { id: "groceries", name: "Groceries", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h12l2 4v14c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6l2-4z"/><path d="M3 6h18M12 12v6M9 15h6"/></svg>` }
];

// Load and setup elements
document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts(); // Fetch from backend API first

    // Check if there is a search or category parameter in the URL
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("q");
    if (urlQuery) {
        searchQuery = urlQuery.toLowerCase().trim();
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
            searchInput.value = urlQuery;
        }
    }
    
    const urlCategory = params.get("cat");
    if (urlCategory && CATEGORIES.some(cat => cat.id === urlCategory)) {
        activeCategory = urlCategory;
    }

    renderCategoryChips();
    filterAndRenderProducts();

    // Event Listener: Search Bar Input
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterAndRenderProducts();
    });

    // Event Listener: Sort Dropdown Selection
    const sortSelect = document.getElementById("sort-select");
    sortSelect.addEventListener("change", (e) => {
        sortBy = e.target.value;
        filterAndRenderProducts();
    });

    // Event Listener: Listening to Cart modifications from storage triggers
    window.addEventListener("cartUpdated", () => {
        filterAndRenderProducts(); // Re-render to update the quantity inputs
    });
});

// Render the top horizontal category selectors
function renderCategoryChips() {
    const container = document.getElementById("categories-container");
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
        <div class="category-card ${cat.id === activeCategory ? 'active' : ''}" 
             onclick="selectCategory('${cat.id}')" id="cat-chip-${cat.id}">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
        </div>
    `).join("");
}

// Handler when clicking a category chip
function selectCategory(categoryId) {
    activeCategory = categoryId;
    
    // Update chip styling
    CATEGORIES.forEach(cat => {
        const chip = document.getElementById(`cat-chip-${cat.id}`);
        if (chip) {
            if (cat.id === categoryId) {
                chip.classList.add("active");
            } else {
                chip.classList.remove("active");
            }
        }
    });

    filterAndRenderProducts();
}

// Expose filterByCategory to global scope for footer links
window.filterByCategory = function(catId) {
    selectCategory(catId);
    scrollToProducts();
};

function scrollToProducts() {
    document.getElementById("products-section").scrollIntoView({ behavior: "smooth" });
}

// Core filtering, sorting and listing function
function filterAndRenderProducts() {
    const grid = document.getElementById("products-grid");
    const countText = document.getElementById("results-count");
    if (!grid) return;

    // Load current cart to synchronize quantities
    const cart = getCart();

    // 1. Filter by category & search query
    let filtered = PRODUCTS.filter(p => {
        const matchesCategory = activeCategory === "all" || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                              p.category.toLowerCase().includes(searchQuery) ||
                              p.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    // 2. Apply sorting
    if (sortBy === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else {
        // default sorting by popularity
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    // Update product counts
    countText.innerText = `Showing ${filtered.length} products`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <h3>No products found</h3>
                <p>Try adjustments in search or switch category.</p>
            </div>
        `;
        return;
    }

    // 3. Generate HTML template list
    grid.innerHTML = filtered.map(product => {
        // Find if this item is already in the cart
        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;

        const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

        return `
            <div class="product-card" id="product-${product.id}">
                ${product.organic ? `<div class="organic-badge">Organic</div>` : ''}
                
                <div class="product-img-wrapper" onclick="viewProductDetail(${product.id})">
                    ${renderProductSVG(product.id, 120)}
                </div>

                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name" onclick="viewProductDetail(${product.id})">${product.name}</h3>
                    
                    <div class="product-rating">
                        <svg class="star-icon" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        <span>${product.rating}</span>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>

                    <div class="product-footer">
                        <div class="price-container">
                            <span class="product-price">₹${product.price}</span>
                            <span class="product-original-price">₹${product.originalPrice}</span>
                            <span class="product-unit">${product.unit}</span>
                        </div>
                        
                        <div class="action-btn-container" id="action-container-${product.id}">
                            ${quantity > 0 ? `
                                <div class="qty-counter">
                                    <button class="qty-btn" onclick="changeQty(${product.id}, ${quantity - 1})">-</button>
                                    <span class="qty-number">${quantity}</span>
                                    <button class="qty-btn" onclick="changeQty(${product.id}, ${quantity + 1})">+</button>
                                </div>
                            ` : `
                                <button class="add-btn" onclick="addItemToCart(${product.id})">Add</button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Redirect click to detail page
window.viewProductDetail = function(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
};

// Handle clicks on Add buttons
window.addItemToCart = function(productId) {
    addToCart(productId, 1);
    const product = PRODUCTS.find(p => p.id === productId);
    showToast(`Added ${product.name} to cart!`);
    filterAndRenderProducts();
};

// Adjust quantities from the grid listing
window.changeQty = function(productId, nextQty) {
    updateCartQty(productId, nextQty);
    const product = PRODUCTS.find(p => p.id === productId);
    if (nextQty === 0) {
        showToast(`Removed ${product.name} from cart`);
    } else {
        showToast(`Updated quantity of ${product.name}`);
    }
    filterAndRenderProducts();
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

    // Auto remove after 2.5s
    setTimeout(() => {
        toast.classList.add("removing");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 2500);
}
