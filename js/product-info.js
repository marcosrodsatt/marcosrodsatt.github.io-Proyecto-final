// 🚀 Obtengo el productID del localStorage
let prodId = localStorage.getItem("prodId");

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

document.addEventListener("DOMContentLoaded", function () {
  fetch(`https://japceibal.github.io/emercado-api/products/${prodId}.json`)
    .then(response => response.json())
    .then(product => {
      // Datos de texto
      document.getElementById("productName").innerText = product.name;
      document.getElementById("productDescription").innerText = product.description;
      document.getElementById("productCost").innerText = `${product.currency} ${product.cost}`;
      document.getElementById("productSold").innerText = `${product.soldCount} vendidos`;

      // Galería
      const images = Array.isArray(product.images) ? product.images : [];
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
    })
    .catch(err => {
      console.error("Error cargando producto:", err);
      const fallbackImgEl = document.getElementById("productImage");
      if (fallbackImgEl) {
        fallbackImgEl.src = "img/placeholder.png";
        fallbackImgEl.alt = "Sin imagen";
        fallbackImgEl.style.display = "block";
      }
    });
});

