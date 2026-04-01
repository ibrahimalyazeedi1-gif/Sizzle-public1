
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromStorage();
});

/* PRICE LIST */
const prices = {
    crispy_chicken: 1.3,
    buffalo_chicken: 1.5,
    nashville_chicken: 1.5,
    chicken_fries: 1.5,
    smash_beef: 1.3,
    double_smash: 1.7,
    mushroom_burger: 1.5,
    double_mushroom: 1.8,
    chips: 0.3,
    cheese_extra: 0.1,
    sauce: 0.1,
    soft_drink: 0.3,
    water: 0.1
};

/* CHANGE QUANTITY (HOME PAGE) */
function changeQty(button, change) {
    const item = button.closest(".item");
    const id = item.getAttribute("data-id");
    const countSpan = item.querySelector(".count");

    let current = Number(countSpan.textContent);
    current += change;

    if (current < 0) current = 0;

    countSpan.textContent = current;

    let cart = JSON.parse(localStorage.getItem("cart")) || {};

    if (current === 0) {
        delete cart[id];
    } else {
        cart[id] = {
            qty: current,
            price: prices[id]
        };
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}

/* LOAD COUNTS ON HOME */
function loadCartFromStorage() {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    document.querySelectorAll(".item").forEach(item => {
        const id = item.getAttribute("data-id");
        const countSpan = item.querySelector(".count");

        countSpan.textContent = cart[id] ? cart[id].qty : 0;
    });
}

/* CHANGE FROM CART PAGE */
function changeCartQty(id, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || {};

    if (!cart[id]) return;

    cart[id].qty += change;

    if (cart[id].qty <= 0) {
        delete cart[id];
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

/* LOAD CART PAGE */
function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    const container = document.getElementById("cart-items");

    if (!container) return;

    container.innerHTML = "";

    let subtotal = 0;

    const items = Object.entries(cart);

    if (items.length === 0) {
        container.innerHTML = "<p>No items added yet</p>";
        return;
    }

    items.forEach(([id, data]) => {
        if (!data || !data.qty || !data.price) return;

        const itemTotal = data.qty * data.price;
        subtotal += itemTotal;

        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";

        div.innerHTML = `
            <span>${id.replace(/_/g, " ")} x ${data.qty}</span>
            <div style="display:flex; align-items:center; gap:10px;">
                <button onclick="changeCartQty('${id}', -1)">-</button>
                <button onclick="changeCartQty('${id}', 1)">+</button>
                <span>${itemTotal.toFixed(2)} OMR</span>
            </div>
        `;

        container.appendChild(div);
    });

    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    container.innerHTML += `
        <div style="margin-top:10px; border-top:1px solid rgba(245,230,211,0.3); padding-top:10px;">
            <div style="display:flex; justify-content:space-between;">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)} OMR</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>Tax (5%)</span>
                <span>${tax.toFixed(2)} OMR</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
                <span>Total</span>
                <span>${total.toFixed(2)} OMR</span>
            </div>
        </div>
    `;
}

/* SEND ORDER TO NODE SERVER */
function placeOrder() {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    const name = document.querySelector("input").value;
    const address = document.querySelectorAll("input")[1].value;

    fetch("http://localhost:3000/order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            address,
            cart
        })
    })
    .then(() => {
        alert("Order sent!");
        localStorage.clear();
        location.reload();
    })
    .catch(() => {
        alert("Server not running");
    });
}

/* AUTO LOCATION */
function getLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        document.querySelectorAll("input")[1].value =
            `https://maps.google.com/?q=${lat},${lng}`;
    });
}

// 🔐 AUTH STATE LISTENER
firebase.auth().onAuthStateChanged(user => {
    const btn = document.getElementById("authBtn");

    if (user) {
        // ✅ LOGGED IN
        btn.innerHTML = "👤";
        btn.classList.add("profile-icon");
    } else {
        // ❌ NOT LOGGED IN
        btn.innerHTML = "Login";
        btn.classList.remove("profile-icon");
    }
});

// CLICK ACTION
function handleAuthClick() {
    const user = firebase.auth().currentUser;

    if (user) {
        // go to profile
        window.location.href = "profile.html";
    } else {
        // go to login
        window.location.href = "login.html";
    }
}
