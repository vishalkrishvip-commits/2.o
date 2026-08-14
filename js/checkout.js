/**
 * Grocery Delivery Platform - Checkout Page Logic
 * 
 * Generates dynamic delivery dates, toggles sub-forms based on payment selection,
 * handles required field validation parameters, and routes order details to LocalStorage.
 */

let selectedDayString = "";
let selectedTimeWindow = "Morning: 7:00 AM - 11:00 AM";
let selectedPaymentMethod = "cod";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verify Cart has items
    await loadProducts();
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your shopping cart is empty. Redirecting to home page.");
        window.location.href = "index.html";
        return;
    }

    // 2. Initialize Views
    renderDaysSlots();
    renderBasketInvoice();
    selectPaymentMethod("cod"); // default
});

// Render dynamic delivery days starting today
function renderDaysSlots() {
    const daysContainer = document.getElementById("days-slots-container");
    if (!daysContainer) return;

    const daysList = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        let dayLabel = "Today";
        if (i === 1) dayLabel = "Tomorrow";
        else if (i === 2) dayLabel = weekdays[date.getDay()];

        const formattedDate = `${dayLabel}, ${months[date.getMonth()]} ${date.getDate()}`;
        daysList.push({
            id: i,
            label: dayLabel,
            dateStr: formattedDate,
            active: i === 0 // default active is today
        });
    }

    // Set default day value
    selectedDayString = daysList[0].dateStr;

    daysContainer.innerHTML = daysList.map(day => `
        <div class="slot-card ${day.active ? 'active' : ''}" 
             id="day-slot-${day.id}" 
             onclick="selectDeliveryDay(${day.id}, '${day.dateStr}')">
            <div class="slot-day">${day.label}</div>
            <div class="slot-date">${day.dateStr}</div>
        </div>
    `).join("");
}

// Handler for delivery date card clicks
window.selectDeliveryDay = function(dayId, dateStr) {
    selectedDayString = dateStr;
    
    // Toggle active class
    for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`day-slot-${i}`);
        if (card) {
            if (i === dayId) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }
        }
    }
};

// Handler for time slot chips clicks
window.selectTimeSlot = function(element, timeStr) {
    selectedTimeWindow = timeStr;
    
    // Clear other active chips
    const parent = element.parentNode;
    const chips = parent.getElementsByClassName("time-chip");
    for (let chip of chips) {
        chip.classList.remove("active");
    }
    element.classList.add("active");
};

// Populate Invoice Side panel
function renderBasketInvoice() {
    const cart = getCart();
    const itemsListContainer = document.getElementById("summary-items-list");
    if (!itemsListContainer) return;

    // List short lines
    itemsListContainer.innerHTML = cart.map(cartItem => {
        const product = PRODUCTS.find(p => p.id === cartItem.id);
        if (!product) return "";
        return `
            <div class="summary-item-line">
                <span>${product.name} <b>x ${cartItem.quantity}</b></span>
                <span>₹${product.price * cartItem.quantity}</span>
            </div>
        `;
    }).join("");

    const totals = getCartTotals();
    
    document.getElementById("checkout-subtotal").innerText = `₹${totals.subtotal}`;
    
    if (totals.deliveryFee === 0) {
        document.getElementById("checkout-delivery").innerHTML = `<span style="color: var(--primary-dark); font-weight: 600;">FREE</span>`;
    } else {
        document.getElementById("checkout-delivery").innerText = `₹${totals.deliveryFee}`;
    }

    document.getElementById("checkout-tax").innerText = `₹${totals.tax}`;

    const discountRow = document.getElementById("checkout-discount-row");
    if (totals.discount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("checkout-discount").innerText = `-₹${totals.discount}`;
    } else {
        discountRow.style.display = "none";
    }

    document.getElementById("checkout-grandtotal").innerText = `₹${totals.total}`;
}

// Payment method tile selectors
window.selectPaymentMethod = function(method) {
    selectedPaymentMethod = method;

    // Toggle active highlights on radio cards
    const tiles = document.querySelectorAll(".payment-tile");
    tiles.forEach(tile => {
        const radio = tile.querySelector("input[type='radio']");
        if (radio.value === method) {
            tile.classList.add("active");
            radio.checked = true;
        } else {
            tile.classList.remove("active");
        }
    });

    // Toggle subforms visibility
    const upiForm = document.getElementById("upi-subform");
    const cardForm = document.getElementById("card-subform");
    
    upiForm.classList.remove("active");
    cardForm.classList.remove("active");
    
    // Clear required fields constraints
    document.getElementById("upi-id").required = false;
    document.getElementById("card-number").required = false;
    document.getElementById("card-expiry").required = false;
    document.getElementById("card-cvv").required = false;

    const checkoutBtn = document.querySelector(".checkout-btn");
    const totals = getCartTotals();

    if (method === "cod") {
        checkoutBtn.innerText = `Place Order (Cash on Delivery)`;
    } else if (method === "upi") {
        upiForm.classList.add("active");
        document.getElementById("upi-id").required = true;
        checkoutBtn.innerText = `Pay ₹${totals.total} via UPI`;
    } else if (method === "card") {
        cardForm.classList.add("active");
        document.getElementById("card-number").required = true;
        document.getElementById("card-expiry").required = true;
        document.getElementById("card-cvv").required = true;
        checkoutBtn.innerText = `Pay ₹${totals.total} via Card`;
    }
};

// Place Order Form submit handler
window.handlePlaceOrder = async function(event) {
    event.preventDefault();

    // Verify fields
    const fullname = document.getElementById("fullname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const city = document.getElementById("city").value.trim();

    const orderId = "FC-" + Math.floor(100000 + Math.random() * 900000);
    const totals = getCartTotals();

    const orderDetails = {
        orderId: orderId,
        customerName: fullname,
        phoneNumber: phone,
        deliveryAddress: `${address}, ${city} - ${pincode}`,
        deliverySlot: `${selectedDayString} (${selectedTimeWindow})`,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        totalAmount: totals.total,
        orderDate: new Date().toLocaleString(),
        status: "Placed"
    };

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderDetails)
        });

        if (response.ok) {
            // Store just the active order ID in localstorage for easy retrieval
            localStorage.setItem("gdp_active_order_id", orderId);
            
            // Clean states
            clearCart();
            localStorage.removeItem("gdp_promo_code");

            // Redirect to Order tracking timeline
            window.location.href = `order-tracking.html?id=${orderId}`;
        } else {
            alert('Failed to place order. Please try again.');
        }
    } catch (e) {
        console.error('Error placing order:', e);
        alert('Could not connect to the backend server to place the order.');
    }
};
