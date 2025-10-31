
document.addEventListener("DOMContentLoaded", () => {
  cartItems = getCart();
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    const migrated = migrateFromLegacySingle && migrateFromLegacySingle();
    if (migrated) cartItems = migrated;
  }
  renderCartTable();
  initConfirm();
});
// Configuración: tasa UYU -> USD (ajustala si tu profe pide otra)
const UYU_TO_USD = 40; // por ejemplo 40 UYU = 1 USD

// Convierte cualquier valor a USD (si ya es USD, devuelve igual)
function toUSD(amount, currency) {
  if (!currency) return Number(amount) || 0;
  if (currency.toUpperCase() === "UYU") return Number(amount) / UYU_TO_USD;
  // Si ya es USD o moneda desconocida, asumimos USD directo
  return Number(amount) || 0;
}

// Formatea dinero mostrando la moneda correcta
function formatMoney(currency, amount) {
  const v = Math.round(Number(amount) * 100) / 100;
  return `${currency} ${v.toFixed(2)}`;
}

// Estado principal
let cartItems = [];

// --- Helpers de storage ---
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cartItems") || "[]");
  } catch (e) {
    return [];
  }
}
function setCart(arr) {
  try {
    localStorage.setItem("cartItems", JSON.stringify(arr));
    if (typeof updateCartBadge === "function") updateCartBadge();
  } catch (e) {
    console.error("Error al guardar cartItems en localStorage:", e);
  }
}

// --- Migración desde el prototipo de 1 producto (cartProduct) ---
function migrateFromLegacySingle() {
  const singleRaw = localStorage.getItem("cartProduct");
  if (!singleRaw) return null;

  try {
    const single = JSON.parse(singleRaw);
    if (!single) return null;

    const normalized = [{
      id: single.id || "legacy-1",
      name: single.name || "Producto",
      unitCost: Number(single.cost) || 0,
      currency: single.currency || "USD",
      image: single.image || "",
      count: Number(single.count) || 1
    }];

    setCart(normalized);
    return normalized;
  } catch (e) {
    console.warn("No se pudo migrar cartProduct:", e);
    return null;
  }
}

// --- Render de tabla del carrito ---
function renderCartTable() {
  const tbody = document.getElementById("cartItems");
  const empty = document.getElementById("emptyCart");
  if (!tbody) {
    console.error("No se encontró el elemento #cartItems en el DOM.");
    return;
  }
  tbody.innerHTML = "";

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    if (empty) empty.classList.remove("d-none");
    const subEl = document.getElementById("subtotalText");
    const totEl = document.getElementById("totalText");
    if (subEl) subEl.textContent = "USD 0.00";
    if (totEl) totEl.textContent = "USD 0.00";
    return;
  } else {
    if (empty) empty.classList.add("d-none");
  }

  cartItems.forEach((item, idx) => {
    // item: { id, name, unitCost, currency, image, count }
    const unit = Number(item.unitCost) || 0;
    const cnt = Number(item.count) || 0;
    const subtotalOriginal = unit * cnt; // en moneda original
    const subtotalUSD = toUSD(subtotalOriginal, item.currency);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${item.image || ''}" alt="${(item.name || '').replace(/"/g, '')}"
               style="width:60px;height:60px;object-fit:cover;border-radius:6px">
          <div>
            <div class="fw-semibold">${item.name || 'Producto'}</div>
            <small class="text-muted">${item.currency || 'USD'} ${item.unitCost}</small>
          </div>
        </div>
      </td>
      <td>${item.currency || 'USD'} ${unit}</td>
      <td style="max-width:120px;">
        <input type="number" min="1" value="${cnt}" class="form-control qty-input" data-index="${idx}">
      </td>
      <td class="fw-semibold item-subtotal" data-index="${idx}">
        ${formatMoney(item.currency || 'USD', subtotalOriginal)} 
        <small class="text-muted">(${formatMoney('USD', subtotalUSD)})</small>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-danger remove-btn" data-index="${idx}" aria-label="Eliminar producto">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  bindCartEvents();
  updateTotals();
}

// --- Eventos: cantidad / eliminar ---
function bindCartEvents() {
  document.querySelectorAll(".qty-input").forEach(inp => {
    inp.addEventListener("input", (e) => {
      const i = Number(e.target.dataset.index);
      const raw = e.target.value;
      let val = Number(raw);
      if (!Number.isFinite(val) || val < 1) val = 1;
      e.target.value = val;

      if (!cartItems[i]) return;
      cartItems[i].count = val;

      const subOriginal = (Number(cartItems[i].unitCost) || 0) * val;
      const subUSD = toUSD(subOriginal, cartItems[i].currency);

      const subCell = document.querySelector(`.item-subtotal[data-index="${i}"]`);
      if (subCell) subCell.textContent = `${formatMoney(cartItems[i].currency || 'USD', subOriginal)} (${formatMoney('USD', subUSD)})`;

      setCart(cartItems);
      updateTotals();
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const i = Number(e.currentTarget.dataset.index);
      if (!Number.isFinite(i)) return;
      cartItems.splice(i, 1);
      setCart(cartItems);
      renderCartTable();
    });
  });
}

// --- Totales ---
function updateTotals() {
  // Total en USD sumando cada subtotal convertido
  const totalUSD = cartItems.reduce((acc, it) => {
    const original = (Number(it.unitCost) || 0) * (Number(it.count) || 0);
    return acc + toUSD(original, it.currency);
  }, 0);

  // Opcional: también podríamos mostrar subtotal en moneda base (si todos son la misma moneda)
  const subEl = document.getElementById("subtotalText");
  const totEl = document.getElementById("totalText");
  if (subEl) subEl.textContent = formatMoney("USD", totalUSD); // mostramos subtotal convertido a USD
  if (totEl) totEl.textContent = formatMoney("USD", totalUSD);
}

// --- Confirmar compra (vacía carrito) ---
function initConfirm() {
  const btn = document.getElementById("confirmBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    alert("✅ ¡Has comprado con éxito!");
    cartItems = [];
    setCart(cartItems);
    renderCartTable();
  });
}






