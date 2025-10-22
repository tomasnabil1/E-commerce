    const cartKey = "cart";

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
      document.getElementById("cart-count").textContent = count;
    }

    function renderCart() {
      const cart = getCart();
      const container = document.getElementById("cart-container");
      container.innerHTML = "";

      if (cart.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty 🛒</p>';
        document.getElementById("total").textContent = "";
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

    document.addEventListener("DOMContentLoaded", () => {
      updateCartCount();

      document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const price = parseFloat(btn.dataset.price);

          let cart = getCart();
          const existing = cart.find(i => i.id === id);
          if (existing) existing.quantity++;
          else cart.push({ id, name, price, quantity: 1 });

          saveCart(cart);
          btn.textContent = "Added ✔";
          btn.disabled = true;
          setTimeout(() => {
            btn.textContent = "Add to Cart";
            btn.disabled = false;
          }, 1000);
        });
      });

      const cartSection = document.getElementById("cart-section");
      document.getElementById("toggle-cart").addEventListener("click", () => {
        renderCart();
        cartSection.classList.remove("hidden");
      });

      document.getElementById("close-cart").addEventListener("click", () => {
        cartSection.classList.add("hidden");
      });
    });
