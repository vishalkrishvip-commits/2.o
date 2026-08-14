/**
 * Grocery Delivery Platform - Order Status Tracking Logic
 * 
 * Extracts order details from LocalStorage, falls back to a simulated order
 * if visited directly, and runs a timed simulation of delivery status stepping
 * with a dynamic ETA countdown.
 */

let activeOrder = null;
let currentStep = 0; // Ranges from 0 (Placed) to 4 (Delivered)

// Mock list of delivery partners
const DRIVER_HEROES = [
    { name: "Rohan Kumar", vehicle: "TVS Jupiter (MH-02-EA-4592)", initials: "RK" },
    { name: "Suresh Pillai", vehicle: "Activa 6G (MH-04-BT-1830)", initials: "SP" },
    { name: "Amit Sharma", vehicle: "Splendor Plus (MH-01-DR-5129)", initials: "AS" },
    { name: "Gurpreet Singh", vehicle: "Hero Electric (MH-03-EH-9821)", initials: "GS" }
];

document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();
    // 1. Fetch order details from Backend
    
    // Check URL first, then local storage
    const params = new URLSearchParams(window.location.search);
    let orderId = params.get('id') || localStorage.getItem("gdp_active_order_id");
    
    if (orderId) {
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
            if (response.ok) {
                activeOrder = await response.json();
            }
        } catch (e) {
            console.error("Failed to fetch order from backend", e);
        }
    }

    // Fallback if backend fetch failed or orderId not found
    if (!activeOrder) {
        const storedOrder = localStorage.getItem("gdp_active_order"); // Old way backward compatibility
        if (storedOrder) {
            activeOrder = JSON.parse(storedOrder);
        } else {
            // Fallback simulated order for demonstration
            activeOrder = {
                orderId: "FC-894021",
                customerName: "Aman Sen",
                phoneNumber: "9876543210",
                deliveryAddress: "Hostel 3, College Campus, Sector 44 - 400706",
                deliverySlot: "Today, Jun 7 (Evening: 5:00 PM - 8:00 PM)",
                paymentMethod: "COD",
                totalAmount: 342,
                orderDate: new Date().toLocaleString(),
                status: "Placed"
            };
        }
    }

    // 2. Populate Order Info Cards in HTML
    populateOrderCard();

    // 3. Assign random delivery partner
    const randomDriver = DRIVER_HEROES[Math.floor(Math.random() * DRIVER_HEROES.length)];
    document.getElementById("driver-name").innerText = randomDriver.name;
    document.getElementById("driver-vehicle").innerText = `Delivery Hero · ${randomDriver.vehicle}`;
    document.getElementById("driver-avatar-initials").innerText = randomDriver.initials;

    // 4. Start timeline step progression simulator
    runTimelineSimulation();

    // 5. Update timeline layout responsive properties on window resize
    window.addEventListener("resize", updateStepperProgressUI);
});

// Populate metadata values on page load
function populateOrderCard() {
    if (!activeOrder) return;

    document.getElementById("tracking-order-id").innerText = `Order #${activeOrder.orderId}`;
    document.getElementById("tracking-order-time").innerText = `Placed on: ${activeOrder.orderDate}`;
    document.getElementById("tracking-address").innerText = activeOrder.deliveryAddress;
    document.getElementById("tracking-slot").innerText = activeOrder.deliverySlot;
    document.getElementById("tracking-payment").innerText = activeOrder.paymentMethod;
    document.getElementById("tracking-amount").innerText = `₹${activeOrder.totalAmount}`;
}

// Stepper simulator timing
function runTimelineSimulation() {
    updateStepperProgressUI();

    // Timeline simulation schedule milestones:
    // Step 0 (Placed): immediately active on load
    // Step 1 (Confirmed): after 4 seconds
    // Step 2 (Packed): after 10 seconds
    // Step 3 (Out for Delivery): after 18 seconds
    // Step 4 (Delivered): after 28 seconds

    const schedule = [
        { step: 0, delay: 0, eta: "25 mins" },
        { step: 1, delay: 4000, eta: "22 mins" },
        { step: 2, delay: 10000, eta: "15 mins" },
        { step: 3, delay: 18000, eta: "8 mins" },
        { step: 4, delay: 28000, eta: "Delivered!" }
    ];

    schedule.forEach(milestone => {
        setTimeout(async () => {
            currentStep = milestone.step;
            document.getElementById("tracking-eta").innerText = milestone.eta;
            updateStepperProgressUI();
            
            // Map step to status
            const statusMap = {0: "Placed", 1: "Confirmed", 2: "Packed", 3: "Out for Delivery", 4: "Delivered"};
            const newStatus = statusMap[currentStep];

            // Sync status to backend
            if (activeOrder && activeOrder.orderId) {
                try {
                    await fetch(`http://localhost:3000/api/orders/${activeOrder.orderId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                } catch(e) { console.log('Failed to sync status to backend', e); }
            }

            if (currentStep === 3) {
                // Out for delivery - show driver card and map pin moving
                document.getElementById("tracking-driver-card").style.opacity = "1";
                document.getElementById("tracking-map-wrapper").style.opacity = "1";
            }
            
            if (currentStep === 4) {
                // Delivered!
                alert(`Order #${activeOrder.orderId} has been successfully delivered! Thank you for choosing FreshCart.`);
            }
        }, milestone.delay);
    });
}

// Adjust nodes coloring and active pulse animations
function updateStepperProgressUI() {
    const isMobile = window.innerWidth <= 768;
    const progressLine = document.getElementById("stepper-progress");
    if (!progressLine) return;

    // 1. Calculate progression percentage
    // 4 gaps total (0-1, 1-2, 2-3, 3-4), each represents 25% progress
    const pct = currentStep * 25;

    if (isMobile) {
        progressLine.style.width = "4px";
        progressLine.style.height = `${pct}%`;
    } else {
        progressLine.style.height = "4px";
        progressLine.style.width = `${pct}%`;
    }

    // 2. Loop nodes and configure styles
    for (let i = 0; i < 5; i++) {
        const node = document.getElementById(`step-node-${i}`);
        if (!node) continue;

        node.classList.remove("completed", "active");

        if (i < currentStep) {
            node.classList.add("completed");
        } else if (i === currentStep) {
            node.classList.add("active");
        }
    }
}
