// 🚀 Obtengo el productID del localStorage
let prodId = localStorage.getItem("prodId");

<<<<<<< HEAD
=======
// Validar que prodId exista
if (!prodId) {
  console.error("No se encontró prodId en localStorage");
  alert("Producto no encontrado");
  // Redirigir o mostrar error
  // window.location.href = "index.html"; // Descomentar si necesitas redirigir
}

>>>>>>> 5304cf3 (Actualizado Product-info)
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

<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", function () {
  fetch(`https://japceibal.github.io/emercado-api/products/${prodId}.json`)
    .then(response => response.json())
=======
function renderComments(comments) {
  const commentsContainer = document.getElementById("productComments");
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
  container.innerHTML = ""; // Limpiar antes

  products.forEach(prod => {
    const prodElement = document.createElement("div");
    prodElement.className = "col-md-4 mb-3";

    prodElement.innerHTML = `
      <div class="card" style="cursor: pointer;" onclick="selectRelatedProduct(${prod.id})">
        <img src="${prod.image}" class="card-img-top" alt="${prod.name}">
        <div class="card-body">
          <h5 class="card-title">${prod.name}</h5>
        </div>
      </div>
    `;

    container.appendChild(prodElement);
  });
}

function selectRelatedProduct(id) {
  localStorage.setItem("prodId", id);
  location.reload(); // O redirigir a product-info.html
}

// Función para cargar datos del producto
function loadProductData() {
  // Validar prodId antes de hacer fetch
  if (!prodId) {
    console.error("prodId no está definido");
    return;
  }
  
  fetch(`https://japceibal.github.io/emercado-api/products/${prodId}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
>>>>>>> 5304cf3 (Actualizado Product-info)
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
<<<<<<< HEAD
=======

      // Mostrar productos relacionados
      const relatedProducts = product.relatedProducts || [];

      if (Array.isArray(relatedProducts) && relatedProducts.length > 0) {
        showRelatedProducts(relatedProducts);
      } else {
        document.getElementById("relatedProductsContainer").innerHTML = "<p>No hay productos relacionados.</p>";
      }
>>>>>>> 5304cf3 (Actualizado Product-info)
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
<<<<<<< HEAD
});

=======
}

// Función para cargar comentarios del producto
function loadProductComments() {
  // Validar prodId antes de hacer fetch
  if (!prodId) {
    console.error("prodId no está definido");
    return;
  }
  
  fetch(`https://japceibal.github.io/emercado-api/products_comments/${prodId}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(comments => {
      renderComments(comments);
    })
    .catch(err => {
      console.error("Error cargando comentarios:", err);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // Cargar ambos conjuntos de datos
  loadProductData();
  loadProductComments();
});

// Formulario de comentarios
document.getElementById("commentForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Evitar recargar la página

  const commentText = document.getElementById("userComment").value;
  const rating = document.querySelector('input[name="rating"]:checked');
  
  // Validar que se haya seleccionado una calificación
  if (!rating) {
    alert("Por favor selecciona una calificación");
    return;
  }
  
  const user = "Tú"; // Puedes cambiarlo por un campo de nombre si quieres
  const now = new Date().toISOString().slice(0, 19).replace("T", " "); // Fecha y hora actual

  // Crear objeto comentario
  const newComment = {
    score: parseInt(rating.value),
    description: commentText,
    user: user,
    dateTime: now
  };

  // Renderizar el nuevo comentario
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

  // Agregar al contenedor
  document.getElementById("productComments").prepend(commentElement);

  // Limpiar el formulario
  document.getElementById("userComment").value = "";
  document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
});
>>>>>>> 5304cf3 (Actualizado Product-info)
