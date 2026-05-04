const FAV_KEY = "favs";

// ── Storage helpers ───────────────────────────────────────────────────────────

function getFavs() {
  return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
}

function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function isFav(id) {
  return getFavs().some(f => f.id === id);
}

function toggleFav(product) {
  const favs = getFavs();
  const idx  = favs.findIndex(f => f.id === product.id);
  if (idx >= 0) {
    favs.splice(idx, 1);
    saveFavs(favs);
    return false; // removed
  }
  favs.push(product);
  saveFavs(favs);
  return true; // added
}

// ── Heart button visual state ─────────────────────────────────────────────────

function updateHeartUI(btn, id) {
  const svg = btn.querySelector("svg");
  if (isFav(id)) {
    btn.style.background  = "#ef4444";
    btn.style.borderColor = "#ef4444";
    if (svg) { svg.setAttribute("fill", "white"); svg.setAttribute("stroke", "white"); }
  } else {
    btn.style.background  = "";
    btn.style.borderColor = "";
    if (svg) { svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor"); }
  }
}

// ── Init heart buttons on product listing pages ───────────────────────────────

function initFavButtons() {
  document.querySelectorAll(".product-card").forEach(card => {
    const heartBtn = card.querySelector(".fav-btn");
    const cartBtn  = card.querySelector(".add-to-cart");
    const img      = card.querySelector("img");
    if (!heartBtn || !cartBtn || !cartBtn.dataset.id) return;

    const product = {
      id:    cartBtn.dataset.id,
      name:  cartBtn.dataset.name  || "Product",
      price: parseFloat(cartBtn.dataset.price || "0"),
      brand: card.querySelector("h3")?.textContent?.trim() || "DIVA",
      image: img?.getAttribute("src") || ""
    };

    updateHeartUI(heartBtn, product.id);

    heartBtn.addEventListener("click", e => {
      e.stopPropagation();
      toggleFav(product);
      updateHeartUI(heartBtn, product.id);
    });
  });
}

// ── Render favorites on fav.html ──────────────────────────────────────────────

function renderFavPage() {
  const grid = document.getElementById("fav-grid");
  if (!grid) return;

  const favs = getFavs();

  // update badge count
  const badge = document.getElementById("fav-count");
  if (badge) badge.textContent = favs.length;

  if (favs.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <svg class="w-20 h-20 mb-5 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 21s-6-4.35-9-7.5C-1 9 2 3 7.5 5.5 9 6.3 10 7.8 12 10c2-2.2 3-3.7 4.5-4.5C22 3 25 9 21 13.5 18 16.65 12 21 12 21z"/>
        </svg>
        <p class="text-2xl font-bold text-gray-500 mb-2">No favourites yet</p>
        <p class="text-sm text-gray-400 mb-8">Click the ♡ on any product to save it here</p>
        <a href="Women.html"
          class="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition text-sm">
          Browse Products
        </a>
      </div>`;
    return;
  }

  grid.innerHTML = favs.map((p, i) => `
    <div class="fav-card bg-white rounded-xl shadow-sm overflow-hidden
                hover:shadow-md hover:-translate-y-1 transition duration-300 group"
         data-idx="${i}">

      <div class="w-full h-[250px] overflow-hidden relative">

        <!-- Remove from favs -->
        <button class="remove-fav absolute top-3 right-3 z-20 w-10 h-10
                       flex items-center justify-center rounded-full
                       bg-red-500 border border-red-500 text-white
                       hover:bg-red-600 transition duration-300">
          <svg class="w-5 h-5" fill="white" viewBox="0 0 24 24" stroke="white">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 21s-6-4.35-9-7.5C-1 9 2 3 7.5 5.5 9 6.3 10 7.8 12 10c2-2.2 3-3.7 4.5-4.5C22 3 25 9 21 13.5 18 16.65 12 21 12 21z"/>
          </svg>
        </button>

        <img src="${p.image}" alt="${p.name}"
          class="go-product w-full h-full object-cover cursor-pointer
                 group-hover:scale-110 transition duration-500"
          onerror="this.style.objectFit='contain'">
      </div>

      <div class="p-3">
        <h3 class="text-pink-800 text-sm font-medium">${p.brand}</h3>
        <h2 class="text-black text-base font-semibold leading-tight">
          ${p.name}
          <span class="text-red-600 ml-1">$${p.price}</span>
        </h2>
        <div class="flex items-center text-yellow-400 text-sm mt-1">
          ★★★★★ <span class="text-gray-400 text-xs ml-1">(1000+)</span>
        </div>
        <div class="flex justify-between items-center mt-3">
          <span class="text-gray-400 text-xs">4.1k+ sold</span>
          <button class="go-product border rounded-full px-3 py-1 text-xs font-medium
                         hover:bg-black hover:text-white transition duration-300">
            View Details →
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Attach listeners after rendering (avoids unsafe inline handlers)
  grid.querySelectorAll(".fav-card").forEach((card, i) => {
    const p = favs[i];

    card.querySelector(".remove-fav").addEventListener("click", () => {
      saveFavs(getFavs().filter(f => f.id !== p.id));
      renderFavPage();
    });

    card.querySelectorAll(".go-product").forEach(el => {
      el.addEventListener("click", () => {
        const qs = new URLSearchParams({
          id: p.id, name: p.name, price: p.price, brand: p.brand, image: p.image
        });
        window.location.href = "product.html?" + qs.toString();
      });
    });
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initFavButtons();
  renderFavPage();
});
