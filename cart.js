const cartKey = "cart";
const API = "https://e-commerce-qi5j.onrender.com";

function getCart() {
  return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-container");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty 🛒</p>';
    document.getElementById("total").textContent = "";
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) checkoutBtn.remove();
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-gray-50 p-3 rounded-lg";
    div.innerHTML = `
      <div>
        <h3 class="font-semibold">${item.name}</h3>
        <p class="text-gray-500">$${item.price} ×
          <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="qty border rounded w-14 text-center" />
        </p>
      </div>
      <button data-id="${item.id}" class="remove bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Remove</button>
    `;
    container.appendChild(div);
  });

  document.getElementById("total").textContent = "Total: $" + total.toFixed(2);

  // زرار Checkout
  let checkoutBtn = document.getElementById("checkout-btn");
  if (!checkoutBtn) {
    checkoutBtn = document.createElement("button");
    checkoutBtn.id = "checkout-btn";
    checkoutBtn.className = "w-full mt-4 bg-black text-white py-2 rounded-full hover:bg-gray-800 transition";
    checkoutBtn.textContent = "Checkout";
    document.getElementById("total").after(checkoutBtn);
  }
  checkoutBtn.onclick = () => checkout(cart, total);

  document.querySelectorAll(".qty").forEach(input => {
    input.addEventListener("change", e => {
      const id = e.target.dataset.id;
      const qty = parseInt(e.target.value) || 1;
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) item.quantity = qty;
      saveCart(cart);
      renderCart();
    });
  });

  document.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      const cart = getCart().filter(i => i.id !== id);
      saveCart(cart);
      renderCart();
    });
  });
}

function showCheckoutModal(cart, total) {
  // Remove existing modal if any
  const existing = document.getElementById("_cart-checkout-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "_cart-checkout-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4";
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Complete Your Order</h2>
        <button id="_modal-close" class="text-gray-400 hover:text-black text-2xl leading-none">&times;</button>
      </div>
      <p class="text-gray-500 text-sm mb-4">Total: <span class="font-semibold text-black">$${total.toFixed(2)}</span></p>
      <form id="_cart-order-form" novalidate class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Full Name</label>
          <input id="_field-name" type="text" placeholder="Your name"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          <p id="_err-name" class="hidden text-red-500 text-xs mt-1">Name is required</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Phone Number</label>
          <input id="_field-phone" type="tel" placeholder="e.g. 01012345678"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          <p id="_err-phone" class="hidden text-red-500 text-xs mt-1">Enter a valid phone number (min 7 digits)</p>
        </div>
        <button type="submit" id="_place-order-btn"
          class="w-full bg-black text-white py-2 rounded-full hover:bg-gray-800 transition font-semibold">
          Place Order
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("_modal-close").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

  document.getElementById("_cart-order-form").addEventListener("submit", async e => {
    e.preventDefault();

    const name  = document.getElementById("_field-name").value.trim();
    const phone = document.getElementById("_field-phone").value.trim();
    const errName  = document.getElementById("_err-name");
    const errPhone = document.getElementById("_err-phone");
    let valid = true;

    if (!name) { errName.classList.remove("hidden"); valid = false; }
    else errName.classList.add("hidden");

    if (!phone || phone.length < 7) { errPhone.classList.remove("hidden"); valid = false; }
    else errPhone.classList.add("hidden");

    if (!valid) return;

    const placeBtn = document.getElementById("_place-order-btn");
    placeBtn.textContent = "Placing order...";
    placeBtn.disabled = true;

    const items = cart.map(item => ({
      productId: item.id,
      name:      item.name,
      price:     item.price,
      quantity:  item.quantity
    }));

    const orderPayload = JSON.stringify({ customerName: name, customerPhone: phone, items, total });
    const postOrder = () => fetch(`${API}/api/orders`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    orderPayload
    });

    try {
      const res = await postOrder();
      if (!res.ok) throw new Error("Server error");

      modal.remove();
      saveCart([]);
      renderCart();
      alert(`Order placed! Thanks ${name}, we will contact you on ${phone} to confirm.`);
    } catch {
      try {
        placeBtn.textContent = "Retrying...";
        await new Promise(r => setTimeout(r, 4000));
        const res = await postOrder();
        if (!res.ok) throw new Error("Server error");

        modal.remove();
        saveCart([]);
        renderCart();
        alert(`Order placed! Thanks ${name}, we will contact you on ${phone} to confirm.`);
      } catch {
        placeBtn.textContent = "Place Order";
        placeBtn.disabled = false;
        alert("Failed to place order. Please try again.");
      }
    }
  });
}

async function checkout(cart, total) {
  showCheckoutModal(cart, total);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const id    = btn.dataset.id;
      const name  = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);

      if (!id || !name || isNaN(price)) return;

      let cart = getCart();
      const existing = cart.find(i => i.id === id);
      if (existing) existing.quantity++;
      else cart.push({ id, name, price, quantity: 1 });

      saveCart(cart);
      btn.textContent = "Added ✔";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = "🛒";
        btn.disabled = false;
      }, 1000);
    });
  });

  const cartSection = document.getElementById("cart-section");
  const toggleBtn   = document.getElementById("toggle-cart");
  const closeBtn    = document.getElementById("close-cart");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      renderCart();
      cartSection.classList.remove("hidden");
      cartSection.classList.add("flex");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      cartSection.classList.add("hidden");
      cartSection.classList.remove("flex");
    });
  }
});
