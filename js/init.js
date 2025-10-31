const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/"; //eliminado el 101.json
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
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
    return fetch(url)
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

// Si no hay sesión iniciada → volver al login
  if (!sessionStorage.getItem("user")) {
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
    
    const emptyLi = navList.querySelector('li:last-child');
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