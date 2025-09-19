const ORDER_ASC_BY_PRICE = "PRICE_ASC";
const ORDER_DESC_BY_PRICE = "PRICE_DESC";
const ORDER_DESC_BY_SOLD = "SOLD_DESC";
let currentProductsArray = [];
let filteredProductsArray = [];
let minPrice = undefined;
let maxPrice = undefined;

/*Funcion para el filtro de productos*/
function sortProducts(criteria, array){
    let result = [];
    if (criteria === ORDER_ASC_BY_PRICE){
        result = array.sort((a, b) => a.cost - b.cost);
    } else if (criteria === ORDER_DESC_BY_PRICE){
        result = array.sort((a, b) => b.cost - a.cost);
    } else if (criteria === ORDER_DESC_BY_SOLD){
        result = array.sort((a, b) => b.soldCount - a.soldCount);
    }
    return result;
}

function setCatID(id) {
    localStorage.setItem("catID", id);
     window.location = "products.html";
}

function setProdId(id) {
    localStorage.setItem("prodId", id);
     window.location = "product-info.html";
}
/*Funcion para agregar los productos en forma de div*/
function showProductsList(array){
    let htmlContentToAppend = "";
    for (let product of array) {
    //  Filtro de rango de precios
    if ((minPrice === undefined || product.cost >= minPrice) &&
        (maxPrice === undefined || product.cost <= maxPrice)) {

            htmlContentToAppend += `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4" onclick="setProdId(${product.id})">
                    <div class="card h-100 shadow-sm cursor-active">
                        <img src="${product.image}" alt="${product.description}" class="card-img-top">
                    <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <small class="text-muted">${product.soldCount} vendidos</small>
                        </div>
                        <p class="mb-1">${product.description}</p>
                        <p class="text-muted">${product.currency} ${product.cost}</p>
                    </div>
                </div>
            </div>
            `;
        }
    }
    document.getElementById("product-list-container").innerHTML = htmlContentToAppend;
}

function sortAndShowProducts(sortCriteria) {
  currentProductsArray = sortProducts(sortCriteria, currentProductsArray);
  showProductsList(currentProductsArray);
}

//  Filtrar por precio
function applyPriceFilter() {
  minPrice = document.getElementById("minPrice").value;
  maxPrice = document.getElementById("maxPrice").value;

  // Si no hay valor, dejo undefined
  minPrice = minPrice !== "" ? parseInt(minPrice) : undefined;
  maxPrice = maxPrice !== "" ? parseInt(maxPrice) : undefined;

  showProductsList(currentProductsArray);
}

//  Limpiar filtros de precio
function clearPriceFilter() {
  document.getElementById("minPrice").value = "";
  document.getElementById("maxPrice").value = "";
  minPrice = undefined;
  maxPrice = undefined;
  showProductsList(currentProductsArray);
}

document.getElementById("searchInput").addEventListener("input", function() {
  let search = this.value.toLowerCase();
  filteredProductsArray = currentProductsArray.filter(product =>
    product.name.toLowerCase().includes(search) ||
    product.description.toLowerCase().includes(search)
  );
  showProductsList(filteredProductsArray);
});

/*Escuchador de eventos para cada producto*/
document.addEventListener("DOMContentLoaded", function(e){
    let catID = localStorage.getItem("catID");
    let url = PRODUCTS_URL + catID + EXT_TYPE; //modificado para llevar a cada categoria a su producto
    
    getJSONData(url).then(function(resultObj){
        if (resultObj.status === "ok"){
            let data = resultObj.data;
            document.getElementById("catName").innerHTML = data.catName;
            document.getElementById("catDescription").innerHTML = data.description; 
            currentProductsArray = data.products;
            showProductsList(currentProductsArray);
        }
    });

    document.getElementById("sortAsc").addEventListener("click", function () {
    sortAndShowProducts(ORDER_ASC_BY_PRICE);
  });

  document.getElementById("sortDesc").addEventListener("click", function () {
    sortAndShowProducts(ORDER_DESC_BY_PRICE);
  });

  document.getElementById("sortByCount").addEventListener("click", function () {
    sortAndShowProducts(ORDER_DESC_BY_SOLD);
  });

  //  Filtro corregido: IDs consistentes
  document.getElementById("clearRangeFilter").addEventListener("click", function () {
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    minPrice = undefined;
    maxPrice = undefined;
    showProductsList(currentProductsArray);
  });

  document.getElementById("rangeFilterCount").addEventListener("click", function () {
    minPrice = document.getElementById("minPrice").value;
    maxPrice = document.getElementById("maxPrice").value;

    minPrice = minPrice !== "" ? parseInt(minPrice) : undefined;
    maxPrice = maxPrice !== "" ? parseInt(maxPrice) : undefined;

    showProductsList(currentProductsArray);
  });
});