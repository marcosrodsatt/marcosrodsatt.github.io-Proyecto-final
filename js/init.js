const API_BASE = "http://localhost:3000/api";
const CATEGORIES_URL = `${API_BASE}/cats/cat.json`;
const PUBLISH_PRODUCT_URL = `${API_BASE}/sell/publish.json`;
const PRODUCTS_URL = `${API_BASE}/cats_products/`; //eliminado el 101.json
const PRODUCT_INFO_URL = `${API_BASE}/products/`;
const PRODUCT_INFO_COMMENTS_URL = `${API_BASE}/products_comments/`;
const CART_INFO_URL = `${API_BASE}/user_cart/`;
const CART_BUY_URL = `${API_BASE}/cart/buy.json`;
const EXT_TYPE = ".json";

let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function(url){
    let result = {};
    showSpinner();

    const token = sessionStorage.getItem("token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    return fetch(url, { headers })
    .then(response => {
      if (response.ok) {
        return response.json();
      }else{
        throw Error(response.statusText);
      }
    })
    .then(function(response) {
          result.status = 'ok';
          result.data = response;
          hideSpinner();
          return result;
    })
    .catch(function(error) {
        result.status = 'error';
        result.data = error;
        hideSpinner();
        return result;
    });
}

document.addEventListener("DOMContentLoaded", function(){

// Si no hay sesión iniciada -> volver al login
  if (!sessionStorage.getItem("user") || !sessionStorage.getItem("token")) {
    alert ("Debes iniciar sesión")
    window.location.href = "login.html";
  }

  const username = sessionStorage.getItem('user');
  const navList = document.querySelector('.navbar-nav');
  
  /* Condicionante para agreagar el item al navbar*/
  if (username && navList) {
    const userHtml = `
      <li class="nav-item">
        <a class="nav-link" href="my-profile.html">
          ${username}
        </a>
      </li>`;
    
    const emptyLi = navList?.querySelector?.('li:last-child');
    if (emptyLi) {
      navList.removeChild(emptyLi);
    }
    
    navList.innerHTML += userHtml;
    }
  })

function updateCartBadge() {
      const badge = document.getElementById("cartBadge");
      if (!badge) return;
      const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const total = cart.reduce((acc, it) => acc + (Number(it.count) || 0), 0);
      badge.textContent = total;
    }
    document.addEventListener("DOMContentLoaded", updateCartBadge);
    window.addEventListener("storage", (e) => {
      if (e.key === "cartItems") updateCartBadge();
    });   
// === MODO OSCURO / CLARO ===
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");

  // Cargar preferencia guardada
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  }

  // Escuchar el click del botón
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      // Guardar la preferencia
      const theme = body.classList.contains("dark-mode") ? "dark" : "light";
      localStorage.setItem("theme", theme);
    });
  }
});
