/**
 * Grocery Delivery Platform - Cart Logic
 * 
 * Lists items in cart, performs mathematical recalculations for totals,
 * handles voucher application codes, and binds control event triggers.
 */

document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();
    renderCart();

    // Event Listener: Search Bar Input redirect
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = e.target.value.trim();
            if (query) {
                window.location.href = `index.html?q=${encodeURIComponent(query)}`;
            }
        }
    });

    // Event Listener: Apply Promo Code
    const applyPromoBtn = document.getElementById("promo-apply-btn");
    applyPromoBtn.addEventListener("click", applyVoucherCode);

    // Event Listener: Clear Cart Button
    const clearCartBtn = document.getElementById("clear-cart-btn");
    clearCartBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all items in your basket?")) {
            clearCart();
            localStorage.removeItem("gdp_promo_code");
            showToast("Cart cleared completely");
            renderCart();
        }
    });

    // Event Listener: Checkout CTA Button
    const checkoutBtn = document.getElementById("checkout-cta-btn");
    checkoutBtn.addEventListener("click", () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items to proceed!");
            return;
        }
        window.location.href = "checkout.html";
    });

    // Preset current promo input value if applied earlier
    const storedCode = localStorage.getItem("gdp_promo_code");
    if (storedCode) {
        document.getElementById("promo-input").value = storedCode;
        validateAndShowVoucherStatus(storedCode, false);
    }
});

// Render/Re-render cart rows and panels
function renderCart() {
    const cart = getCart();
    const cartWrapper = document.getElementById("cart-layout-wrapper");
    const emptyView = document.getElementById("empty-cart-view");
    const clearCartBtn = document.getElementById("clear-cart-btn");

    if (cart.length === 0) {
        if (cartWrapper) cartWrapper.style.display = "none";
        if (emptyView) emptyView.style.display = "block";
        if (clearCartBtn) clearCartBtn.style.display = "none";
        return;
    }

    if (cartWrapper) cartWrapper.style.display = "grid";
    if (emptyView) emptyView.style.display = "none";
    if (clearCartBtn) clearCartBtn.style.display = "block";

    const itemsBody = document.getElementById("cart-items-body");
    if (!itemsBody) return;

    itemsBody.innerHTML = cart.map(cartItem => {
        const product = PRODUCTS.find(p => p.id === cartItem.id);
        if (!product) return "";

        const itemTotal = product.price * cartItem.quantity;

        return `
            <tr class="cart-item-row" id="cart-row-${product.id}">
                <td>
                    <div class="cart-product-cell">
                        ${renderProductSVG(product.id, 50)}
                        <div>
                            <div class="cart-product-title" style="cursor: pointer;" onclick="viewProductDetail(${product.id})">${product.name}</div>
                            <div class="cart-product-unit">${product.unit} · ₹${product.price}/${product.unit}</div>
                            <button class="cart-remove-btn" style="margin-top: 5px;" onclick="removeItem(${product.id})">
                                <svg viewBox="0 0 24 24">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                                Remove
                            </button>
                        </div>
                    </div>
                </td>
                <td align="center">
                    <div class="qty-counter">
                        <button class="qty-btn" onclick="updateQty(${product.id}, ${cartItem.quantity - 1})">-</button>
                        <span class="qty-number">${cartItem.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${product.id}, ${cartItem.quantity + 1})">+</button>
                    </div>
                </td>
                <td align="right" style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);">
                    ₹${itemTotal}
                </td>
            </tr>
        `;
    }).join("");

    updateSummaryPanel();
}

// Update figures in sidebar billing panel
function updateSummaryPanel() {
    const totals = getCartTotals();

    document.getElementById("summary-subtotal").innerText = `₹${totals.subtotal}`;
    
    if (totals.deliveryFee === 0) {
        document.getElementById("summary-delivery").innerHTML = `<span style="color: var(--primary-dark); font-weight: 600;">FREE</span>`;
    } else {
        document.getElementById("summary-delivery").innerText = `₹${totals.deliveryFee}`;
    }

    document.getElementById("summary-tax").innerText = `₹${totals.tax}`;

    const discountRow = document.getElementById("discount-row");
    if (totals.discount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("summary-discount").innerText = `-₹${totals.discount}`;
    } else {
        discountRow.style.display = "none";
    }

    document.getElementById("summary-grandtotal").innerText = `₹${totals.total}`;
}

// Adjust quantity controls
window.updateQty = function(productId, nextQty) {
    updateCartQty(productId, nextQty);
    
    // Check if promo code is still valid after total changes
    const storedCode = localStorage.getItem("gdp_promo_code");
    if (storedCode) {
        validateAndShowVoucherStatus(storedCode, false);
    }
    
    renderCart();
};

// Remove single cart item
window.removeItem = function(productId) {
    removeFromCart(productId);
    
    // Check if promo code is still valid after total changes
    const storedCode = localStorage.getItem("gdp_promo_code");
    if (storedCode) {
        validateAndShowVoucherStatus(storedCode, false);
    }
    
    showToast("Item removed from basket");
    renderCart();
};

window.viewProductDetail = function(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
};

// Promo code input handler
function applyVoucherCode() {
    const inputVal = document.getElementById("promo-input").value.toUpperCase().trim();
    if (!inputVal) {
        showVoucherMsg("Please enter a coupon code", "var(--danger)");
        return;
    }
    validateAndShowVoucherStatus(inputVal, true);
}

// Validation logic for vouchers
function validateAndShowVoucherStatus(code, showToasts = true) {
    const totals = getCartTotals();
    
    if (code === "WELCOME10") {
        localStorage.setItem("gdp_promo_code", code);
        showVoucherMsg("WELCOME10 applied: 10% Discount active!", "var(--primary-dark)");
        if (showToasts) showToast("Voucher code WELCOME10 applied!");
    } else if (code === "SAVE50") {
        if (totals.subtotal > 200) {
            localStorage.setItem("gdp_promo_code", code);
            showVoucherMsg("SAVE50 applied: Flat ₹50 Discount active!", "var(--primary-dark)");
            if (showToasts) showToast("Voucher code SAVE50 applied!");
        } else {
            localStorage.removeItem("gdp_promo_code");
            showVoucherMsg("SAVE50 requires subtotal above ₹200", "var(--danger)");
        }
    } else {
        localStorage.removeItem("gdp_promo_code");
        showVoucherMsg("Invalid Voucher Code", "var(--danger)");
    }
    
    updateSummaryPanel();
}

function showVoucherMsg(msg, color) {
    const statusMsg = document.getElementById("promo-status-msg");
    if (!statusMsg) return;
    statusMsg.innerText = msg;
    statusMsg.style.color = color;
    statusMsg.style.display = "block";
}

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
