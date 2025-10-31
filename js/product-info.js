// 🚀 Obtengo el productID del localStorage
let prodId = localStorage.getItem("prodId");

// Validar que prodId exista
if (!prodId) {
  console.error("No se encontró prodId en localStorage");
  // no hacemos alert forzado para no molestar si lo pruebas desde editor
  // alert("Producto no encontrado");
  // window.location.href = "index.html";
}

// Helpers para armar carrusel
function buildIndicators(imagesLen) {
  let html = "";
  for (let i = 0; i < imagesLen; i++) {
    html += `
      <button type="button"
        data-bs-target="#productGallery"
        data-bs-slide-to="${i}"
        class="${i === 0 ? "active" : ""}"
        ${i === 0 ? 'aria-current="true"' : ""}
        aria-label="Imagen ${i + 1}"></button>`;
  }
  return html;
}

function buildSlides(images) {
  return images.map((src, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="${src}" class="d-block mx-auto img-fluid" alt="Imagen ${i + 1}" style="max-height: 500px; object-fit: contain;">
    </div>
  `).join("");
}

function renderComments(comments) {
  const commentsContainer = document.getElementById("productComments");
  if (!commentsContainer) return;
  commentsContainer.innerHTML = ""; // Limpiar antes de agregar nuevos

  comments.forEach(comment => {
    const commentElement = document.createElement("div");
    commentElement.className = "comment mb-3 p-3 border rounded";

    // Estrellas de calificación
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += i <= comment.score ? '<i class="fas fa-star text-warning"></i>' : '<i class="far fa-star text-warning"></i>';
    }

    commentElement.innerHTML = `
      <p><strong>${comment.user}</strong> - ${comment.dateTime} </p>
      <p><span class="text-warning">${stars}</span></p>
      <p>${comment.description}</p>
    `;

    commentsContainer.appendChild(commentElement);
  });
}

function showRelatedProducts(products) {
  const container = document.getElementById("relatedProductsContainer");
  if (!container) return;
  container.innerHTML = ""; // Limpiar antes

  products.forEach(prod => {
    const prodElement = document.createElement("div");
    prodElement.className = "col-md-4 mb-3";

    // Aseguramos campos mínimos
    const pid = prod.id ?? prod.productId ?? prod._id ?? prod;
    const name = prod.name ?? prod.title ?? "Producto";
    const image = prod.image ?? prod.images?.[0] ?? prod.img ?? "img/placeholder.png";

    prodElement.innerHTML = `
      <div class="card" style="cursor: pointer;">
        <img src="${image}" class="card-img-top" alt="${name}">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
        </div>
      </div>
    `;

    prodElement.addEventListener("click", () => {
      // Guardar como prodId y recargar para ver ese producto
      localStorage.setItem("prodId", pid);
      // Navegar a la misma página recargando datos
      location.reload();
    });

    container.appendChild(prodElement);
  });
}

// Función para cargar datos del producto (usa fetch directo o getJSONData si existe)
function loadProductData() {
  if (!prodId) {
    console.error("prodId no está definido");
    return;
  }

  const tryWithGetJSON = (typeof getJSONData === "function" && typeof PRODUCT_INFO_URL !== "undefined" && typeof EXT_TYPE !== "undefined");

  if (tryWithGetJSON) {
    // Reutilizamos getJSONData si está definido (init.js)
    const url = PRODUCT_INFO_URL + prodId + EXT_TYPE;
    getJSONData(url)
      .then(res => {
        if (res.status === "ok") {
          populateProduct(res.data);
        } else {
          console.warn("getJSONData devolvió status != ok, intentando fetch directo");
          fetchDirectProduct();
        }
      })
      .catch(err => {
        console.warn("getJSONData falló, intentando fetch directo", err);
        fetchDirectProduct();
      });
  } else {
    fetchDirectProduct();
  }
}

function fetchDirectProduct() {
  fetch(`https://japceibal.github.io/emercado-api/products/${prodId}.json`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(product => populateProduct(product))
    .catch(err => {
      console.error("Error cargando producto:", err);
      const fallbackImgEl = document.getElementById("productImage");
      if (fallbackImgEl) {
        fallbackImgEl.src = "img/placeholder.png";
        fallbackImgEl.alt = "Sin imagen";
        fallbackImgEl.style.display = "block";
      }
    });
}

function populateProduct(product) {
  // Texto
  const nameEl = document.getElementById("productName");
  const descEl = document.getElementById("productDescription");
  const costEl = document.getElementById("productCost");
  const soldEl = document.getElementById("productSold");

  if (nameEl) nameEl.innerText = product.name ?? product.title ?? "Producto";
  if (descEl) descEl.innerText = product.description ?? "";
  if (costEl) {
    // Mostrar usando cost o unitCost
    const price = product.cost ?? product.unitCost ?? 0;
    const currency = product.currency ?? "USD";
    costEl.innerText = `${currency} ${price}`;
  }
  if (soldEl) soldEl.innerText = `${product.soldCount ?? 0} vendidos`;

  // Galería / fallback
  const images = Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []);
  const hasImages = images.length > 0;

  const indicatorsEl = document.getElementById("productGalleryIndicators");
  const innerEl = document.getElementById("productGalleryInner");
  const fallbackImgEl = document.getElementById("productImage");

  if (hasImages && indicatorsEl && innerEl) {
    indicatorsEl.innerHTML = buildIndicators(images.length);
    innerEl.innerHTML = buildSlides(images);
    if (fallbackImgEl) fallbackImgEl.style.display = "none";
  } else if (fallbackImgEl) {
    fallbackImgEl.src = images[0] || "img/placeholder.png";
    fallbackImgEl.alt = "Imagen del producto";
    fallbackImgEl.style.display = "block";
  }

  // Related products
  const relatedProducts = product.relatedProducts ?? product.related ?? [];
  if (Array.isArray(relatedProducts) && relatedProducts.length > 0) {
    showRelatedProducts(relatedProducts);
  } else {
    const relatedContainer = document.getElementById("relatedProductsContainer");
    if (relatedContainer) relatedContainer.innerHTML = "<p>No hay productos relacionados.</p>";
  }

  // Guardar normalized productData para usar al comprar
  const priceNum = Number(product.cost ?? product.unitCost ?? 0) || 0;
  window.productData = {
    id: product.id ?? product.productId ?? prodId,
    name: product.name ?? product.title ?? "Producto",
    cost: priceNum,
    currency: product.currency ?? "USD",
    images: images,
    image: images[0] || product.image || "img/placeholder.png"
  };
}

// Función para cargar comentarios del producto
function loadProductComments() {
  if (!prodId) {
    console.error("prodId no está definido");
    return;
  }

  fetch(`https://japceibal.github.io/emercado-api/products_comments/${prodId}.json`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(comments => {
      // Si el endpoint devuelve {comments: [...]}, soportamos ambas formas
      if (Array.isArray(comments)) {
        renderComments(comments);
      } else if (Array.isArray(comments.comments)) {
        renderComments(comments.comments);
      } else {
        console.warn("Formato de comentarios inesperado", comments);
      }
    })
    .catch(err => {
      console.error("Error cargando comentarios:", err);
    });
}

// Cuando carga la página, pedimos datos y comentarios
document.addEventListener("DOMContentLoaded", function () {
  loadProductData();
  loadProductComments();
});

// Formulario de comentarios
const commentFormEl = document.getElementById("commentForm");
if (commentFormEl) {
  commentFormEl.addEventListener("submit", function (e) {
    e.preventDefault();

    const commentTextEl = document.getElementById("userComment");
    const commentText = commentTextEl ? commentTextEl.value.trim() : "";
    const rating = document.querySelector('input[name="rating"]:checked');

    if (!rating) {
      alert("Por favor selecciona una calificación");
      return;
    }

    const user = sessionStorage.getItem("user") || "Usuario anónimo";
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newComment = {
      score: parseInt(rating.value, 10),
      description: commentText,
      user: user,
      dateTime: now
    };

    // Render al principio
    const commentElement = document.createElement("div");
    commentElement.className = "comment mb-3 p-3 border rounded";

    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += i <= newComment.score ? '<i class="fas fa-star text-warning"></i>' : '<i class="far fa-star text-warning"></i>';
    }

    commentElement.innerHTML = `
      <p><strong>${newComment.user}</strong> - ${newComment.dateTime}</p>
      <p><span class="text-warning">${stars}</span></p>
      <p>${newComment.description}</p>
    `;

    const commentsContainer = document.getElementById("productComments");
    if (commentsContainer) commentsContainer.prepend(commentElement);

    // Limpiar
    if (commentTextEl) commentTextEl.value = "";
    document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
  });
}

// ===== Bloque "Comprar" =====

// Storage helpers para carrito
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
    console.error("Error guardando cartItems:", e);
  }
}

// Añadir producto al carrito (usa unitCost)
function addToCart(product, qty = 1) {
  if (!product || !product.id) return;
  const cart = getCart();
  const prodIdStr = String(product.id);
  const idx = cart.findIndex(p => String(p.id) === prodIdStr);

  const unitCost = Number(product.cost) || 0;
  const currency = product.currency || "USD";
  const image = product.image || (Array.isArray(product.images) ? product.images[0] : "") || "img/placeholder.png";

  if (idx >= 0) {
    cart[idx].count = Number(cart[idx].count || 0) + Number(qty || 1);
  } else {
    cart.push({
      id: product.id,
      name: product.name || "Producto",
      unitCost: unitCost,
      currency: currency,
      image: image,
      count: Number(qty || 1)
    });
  }

  setCart(cart);
}

// Asegurar productData (si no existe, intenta fetch)
async function ensureProductData() {
  if (window.productData && window.productData.id) return window.productData;
  if (!prodId) throw new Error("prodId no disponible");

  // Intentar getJSONData si existe
  if (typeof getJSONData === "function" && typeof PRODUCT_INFO_URL !== "undefined" && typeof EXT_TYPE !== "undefined") {
    try {
      const res = await getJSONData(PRODUCT_INFO_URL + prodId + EXT_TYPE);
      if (res && res.status === "ok" && res.data) {
        const d = res.data;
        window.productData = {
          id: d.id,
          name: d.name || d.title || "Producto",
          cost: Number(d.cost ?? d.unitCost) || 0,
          currency: d.currency || "USD",
          images: Array.isArray(d.images) ? d.images : [],
          image: (Array.isArray(d.images) && d.images[0]) ? d.images[0] : (d.image || "")
        };
        return window.productData;
      }
    } catch (e) {
      console.warn("getJSONData falló, fallback a fetch", e);
    }
  }

  // Fallback fetch directo
  const resp = await fetch(`https://japceibal.github.io/emercado-api/products/${prodId}.json`);
  if (!resp.ok) throw new Error("No se pudo obtener producto por fetch");
  const data = await resp.json();
  window.productData = {
    id: data.id,
    name: data.name || data.title || "Producto",
    cost: Number(data.cost ?? data.unitCost) || 0,
    currency: data.currency || "USD",
    images: Array.isArray(data.images) ? data.images : [],
    image: (Array.isArray(data.images) && data.images[0]) ? data.images[0] : (data.image || "")
  };
  return window.productData;
}

// Evento del botón Comprar (usa #btnComprar de tu HTML)
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnComprar");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      const pd = await ensureProductData();

      // lee cantidad si existe input #productCount
      let qty = 1;
      const qtyInput = document.getElementById("productCount");
      if (qtyInput) {
        const v = parseInt(qtyInput.value, 10);
        qty = (Number.isFinite(v) && v > 0) ? v : 1;
      }

      addToCart(pd, qty);
      // redirigir al carrito
      window.location.href = "cart.html";
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert("No se pudo agregar el producto al carrito. Revisá la consola.");
    }
  });
});

