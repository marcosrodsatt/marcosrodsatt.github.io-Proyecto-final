const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/101.json";
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
        <div class="nav-link">
          ${username}
        </div>
      </li>`;
    
    const emptyLi = navList.querySelector('li:last-child');
    if (emptyLi) {
      navList.removeChild(emptyLi);
    }
    
    navList.innerHTML += userHtml;
    }
    <div class="row mb-3">
        <div class="col">
          <input id="searchInput" type="search" class="form-control" placeholder="Buscar productos..." />
        </div>
      </div>
      <!-- /BUSCADOR -->

      <div class="row">
        <div class="col text-end">
          <div class="btn-group btn-group-toggle mb-4" data-bs-toggle="buttons">
            <input type="radio" class="btn-check" name="options" id="sortAsc">
            <label class="btn btn-light" for="sortAsc">A-Z</label>
            <input type="radio" class="btn-check" name="options" id="sortDesc">
            <label class="btn btn-light" for="sortDesc">Z-A</label>
            <input type="radio" class="btn-check" name="options" id="sortByCount" checked>
            <label class="btn btn-light" for="sortByCount"><i class="fas fa-sort-amount-down mr-1"></i></label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-6 offset-lg-6 col-md-12 mb-1 container">
          <div class="row container p-0 m-0">
            <div class="col">
              <p class="font-weight-normal text-end my-2">Cant.</p>
            </div>
            <div class="col">
              <input class="form-control" type="number" placeholder="min." id="rangeFilterCountMin">
            </div>
            <div class="col">
              <input class="form-control" type="number" placeholder="máx." id="rangeFilterCountMax">
            </div>
            <div class="col-3 p-0">
              <div class="btn-group" role="group">
                <button class="btn btn-light btn-block" id="rangeFilterCount">Filtrar</button>
                <button class="btn btn-link btn-sm" id="clearRangeFilter">Limpiar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row" id="cat-list-container"></div>
}); 
