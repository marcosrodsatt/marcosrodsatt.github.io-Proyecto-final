
document.addEventListener("DOMContentLoaded", () => {
  cartItems = getCart();
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    const migrated = migrateFromLegacySingle && migrateFromLegacySingle();
    if (migrated) cartItems = migrated;
  }
  renderCartTable();
  initShipping();
  initAddress();
  initPayment();
  initPurchase();
  // Llamamos a updateTotals para inicializar los valores de subtotal, envío y total
  updateTotals();
});

// Configuración: tasa UYU -> USD
const UYU_TO_USD = 40;

// Convierte cualquier valor a USD
function toUSD(amount, currency) {
  if (!currency) return Number(amount) || 0;
  if (currency.toUpperCase() === "UYU") return Number(amount) / UYU_TO_USD;

  return Number(amount) || 0;
}

// Formatea dinero mostrando la moneda correcta
function formatMoney(currency, amount) {
  const v = Math.round(Number(amount) * 100) / 100;
  return `${currency} ${v.toFixed(2)}`;
}

let cartItems = [];

// Variables para manejar la selección del usuario
let selectedShippingType = null;
let selectedPaymentMethod = null;

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

// Render de tabla del carrito 
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
    // Actualizar también los nuevos elementos de subtotal y total
    const newSubEl = document.getElementById("newSubtotalText");
    const newTotEl = document.getElementById("newTotalText");
    const shipCostEl = document.getElementById("shippingCostText");
    if (newSubEl) newSubEl.textContent = "USD 0.00";
    if (shipCostEl) shipCostEl.textContent = "USD 0.00";
    if (newTotEl) newTotEl.textContent = "USD 0.00";

    const subEl = document.getElementById("subtotalText");
    const totEl = document.getElementById("totalText");
    if (subEl) subEl.textContent = "USD 0.00";
    if (totEl) totEl.textContent = "USD 0.00";
    return;
  } else {
    if (empty) empty.classList.add("d-none");
  }

  cartItems.forEach((item, idx) => {
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
  updateTotals(); // Actualizamos los totales después de renderizar
}

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
      updateTotals(); // Actualizamos totales al cambiar cantidad
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

// Totales (Actualizado con envío)
function updateTotals() {
  // Total en USD sumando cada subtotal convertido
  const subtotalUSD = cartItems.reduce((acc, it) => {
    const original = (Number(it.unitCost) || 0) * (Number(it.count) || 0);
    return acc + toUSD(original, it.currency);
  }, 0);

  let shippingCost = 0;
  if (selectedShippingType === 'premium') {
    shippingCost = subtotalUSD * 0.15;
  } else if (selectedShippingType === 'express') {
    shippingCost = subtotalUSD * 0.07;
  } else if (selectedShippingType === 'standard') {
    shippingCost = subtotalUSD * 0.05;
  }

  const totalUSD = subtotalUSD + shippingCost;

  // Actualizar elementos del nuevo resumen
  const newSubEl = document.getElementById("newSubtotalText");
  const shipCostEl = document.getElementById("shippingCostText");
  const newTotEl = document.getElementById("newTotalText");
  if (newSubEl) newSubEl.textContent = formatMoney("USD", subtotalUSD);
  if (shipCostEl) shipCostEl.textContent = formatMoney("USD", shippingCost);
  if (newTotEl) newTotEl.textContent = formatMoney("USD", totalUSD);

  // Actualizar elementos del resumen original (opcional)
  const subEl = document.getElementById("subtotalText");
  const totEl = document.getElementById("totalText");
  if (subEl) subEl.textContent = formatMoney("USD", subtotalUSD);
  if (totEl) totEl.textContent = formatMoney("USD", totalUSD);
}

// Inicialización de eventos

function initShipping() {
  const radios = document.querySelectorAll('input[name="shippingType"]');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedShippingType = e.target.value;
      updateTotals(); // Actualizamos totales al cambiar el tipo de envío
    });
  });
}

function initAddress() {
  // No se requiere funcionalidad adicional aquí, solo validación en el botón
}

function initPayment() {
  const radios = document.querySelectorAll('input[name="paymentMethod"]');
  const container = document.getElementById('paymentFieldsContainer');
  const ccFields = document.getElementById('creditCardFields');
  const btFields = document.getElementById('bankTransferFields');

  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPaymentMethod = e.target.value;
      container.classList.remove('d-none');

      if (selectedPaymentMethod === 'creditCard') {
        ccFields.classList.remove('d-none');
        btFields.classList.add('d-none');
      } else if (selectedPaymentMethod === 'bankTransfer') {
        btFields.classList.remove('d-none');
        ccFields.classList.add('d-none');
      }
    });
  });
}

function initPurchase() {
  const btn = document.getElementById('purchaseBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // 1. Validar cantidad de productos
    const hasInvalidQty = cartItems.some(item => !item.count || item.count <= 0);
    if (hasInvalidQty) {
      alert("La cantidad de al menos un producto es inválida (0 o menor).");
      return;
    }

    // 2. Validar tipo de envío
    if (!selectedShippingType) {
      alert("Por favor, seleccione un tipo de envío.");
      return;
    }

    // 3. Validar dirección de envío
    const depto = document.getElementById('depto').value.trim();
    const localidad = document.getElementById('localidad').value.trim();
    const calle = document.getElementById('calle').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const esquina = document.getElementById('esquina').value.trim();

    if (!depto || !localidad || !calle || !numero || !esquina) {
      alert("Por favor, complete todos los campos obligatorios de la dirección (Departamento, Localidad, Calle, Número, Esquina).");
      return;
    }

    // 4. Validar forma de pago
    if (!selectedPaymentMethod) {
      alert("Por favor, seleccione una forma de pago.");
      return;
    }

    // 5. Validar campos específicos de la forma de pago
    if (selectedPaymentMethod === 'creditCard') {
      const cardNumber = document.getElementById('cardNumber').value.trim();
      const cardCVV = document.getElementById('cardCVV').value.trim();
      const cardExpiry = document.getElementById('cardExpiry').value.trim();

      if (!cardNumber || !cardCVV || !cardExpiry) {
        alert("Por favor, complete todos los campos de la tarjeta de crédito.");
        return;
      }
    } else if (selectedPaymentMethod === 'bankTransfer') {
      const transferDetails = document.getElementById('transferDetails').value.trim();

      if (!transferDetails) {
        alert("Por favor, ingrese el código de operación para la transferencia bancaria.");
        return;
      }
    }

    // Si todas las validaciones pasan
    alert("✅ ¡Has comprado con éxito!");
    cartItems = [];
    setCart(cartItems);
    renderCartTable();
    // Opcional: Resetear los campos de formulario
    document.getElementById('depto').value = '';
    document.getElementById('localidad').value = '';
    document.getElementById('calle').value = '';
    document.getElementById('numero').value = '';
    document.getElementById('esquina').value = '';
    document.querySelectorAll('input[name="shippingType"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[name="paymentMethod"]').forEach(r => r.checked = false);
    document.getElementById('paymentFieldsContainer').classList.add('d-none');
    document.getElementById('creditCardFields').classList.add('d-none');
    document.getElementById('bankTransferFields').classList.add('d-none');
    selectedShippingType = null;
    selectedPaymentMethod = null;
  });
}

// Confirmar compra (vacía carrito)
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






