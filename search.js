const SEARCH_API = "https://e-commerce-q15j.onrender.com/api/products";
function initSearch() {
  const input       = document.getElementById("search-input");
  const mobileInput = document.getElementById("search-input-mobile");

  // desktop input: full dropdown + filter
  if (input) {
    const wrapper = input.parentElement;
    wrapper.style.position = "relative";

    const dropdown = document.createElement("div");
    dropdown.id = "search-dropdown";
    dropdown.className = [
      "absolute", "top-full", "left-0", "right-0", "mt-2",
      "bg-white", "rounded-2xl", "shadow-2xl", "z-50",
      "max-h-72", "overflow-y-auto", "hidden"
    ].join(" ");
    wrapper.appendChild(dropdown);

    let timer;

    input.addEventListener("input", () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (mobileInput) mobileInput.value = q;

      if (!q) {
        dropdown.classList.add("hidden");
        showAllCards();
        return;
      }

      filterCards(q);
      timer = setTimeout(() => searchBackend(q, dropdown), 300);
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  // mobile input: filter only (no dropdown)
  if (mobileInput) {
    mobileInput.addEventListener("input", () => {
      const q = mobileInput.value.trim();
      if (input) input.value = q;
      if (!q) { showAllCards(); return; }
      filterCards(q);
    });
  }
}

// ── Client-side filter ────────────────────────────────────────────────────────

function filterCards(q) {
  const lower = q.toLowerCase();
  const grid  = document.getElementById("products-grid");
  if (!grid) return;

  let found = 0;
  grid.querySelectorAll(".product-card").forEach(card => {
    const name  = (card.querySelector("h2")?.textContent  || "").toLowerCase();
    const brand = (card.querySelector("h3")?.textContent  || "").toLowerCase();
    const match = name.includes(lower) || brand.includes(lower);
    card.style.display = match ? "" : "none";
    if (match) found++;
  });

  // show "no results" banner inside the grid
  let banner = document.getElementById("no-results-banner");
  if (found === 0) {
    if (!banner) {
      banner = document.createElement("p");
      banner.id = "no-results-banner";
      banner.className = "col-span-full text-center text-gray-400 py-10 text-lg";
      grid.appendChild(banner);
    }
    banner.textContent = `No products found for "${q}"`;
  } else {
    banner?.remove();
  }
}

function showAllCards() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.querySelectorAll(".product-card").forEach(card => (card.style.display = ""));
  document.getElementById("no-results-banner")?.remove();
}

// ── Backend search dropdown ───────────────────────────────────────────────────

async function searchBackend(q, dropdown) {
  try {
    const res      = await fetch(`${SEARCH_API}?search=${encodeURIComponent(q)}`);
    const products = await res.json();
    renderDropdown(products, q, dropdown);
  } catch {
    // server offline → hide dropdown, client-side filter already running
    dropdown.classList.add("hidden");
  }
}

function renderDropdown(products, q, dropdown) {
  if (products.length === 0) {
    dropdown.innerHTML = `
      <p class="p-4 text-sm text-gray-400 text-center">
        No results in database for "<strong>${q}</strong>"
      </p>`;
    dropdown.classList.remove("hidden");
    return;
  }

  dropdown.innerHTML = products.map(p => `
    <div class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition">
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-black truncate">${highlight(p.name, q)}</p>
        <p class="text-xs text-gray-400 mt-0.5">${p.brand} &middot; <span class="text-red-600 font-medium">$${p.price}</span></p>
      </div>
    </div>
  `).join("");

  dropdown.classList.remove("hidden");
}

// bold the matched part in the product name
function highlight(text, q) {
  const regex = new RegExp(`(${q})`, "gi");
  return text.replace(regex, "<mark class='bg-yellow-200 rounded px-0.5'>$1</mark>");
}

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", initSearch);
