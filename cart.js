const cartKey = "cart";
const API = "https://e-commerce-q15j.onrender.com";

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

async function checkout(cart, total) {
  const btn = document.getElementById("checkout-btn");
  btn.textContent = "Placing order...";
  btn.disabled = true;

  const items = cart.map(item => ({
    productId: item.id,
    name:      item.name,
    price:     item.price,
    quantity:  item.quantity
  }));

  try {
    const res = await fetch(`${API}/api/orders`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ items, total })
    });

    if (!res.ok) throw new Error("Server error");

    saveCart([]);
    renderCart();
    alert("Order placed successfully! ✅");
  } catch (err) {
    btn.textContent = "Checkout";
    btn.disabled = false;
    alert("Failed to place order. Make sure the server is running.");
  }
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
