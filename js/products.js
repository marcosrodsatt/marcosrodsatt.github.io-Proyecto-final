const ORDER_ASC_BY_NAME = "AZ";
const ORDER_DESC_BY_NAME = "ZA";
const ORDER_BY_PROD_COUNT = "Cant.";
let currentProductsArray = [];
let currentSortCriteria = undefined;
let minCount = undefined;
let maxCount = undefined;

/*Funcion para el filtro de productos*/
function sortProducts(criteria, array){
    let result = [];
    if (criteria === ORDER_ASC_BY_NAME){
        result = array.sort(function(a, b) {
            if ( a.name < b.name ){ return -1; }
            if ( a.name > b.name ){ return 1; }
            return 0;
        });
    } else if (criteria === ORDER_DESC_BY_NAME){
        result = array.sort(function(a, b) {
            if ( a.name > b.name ){ return -1; }
            if ( a.name < b.name ){ return 1; }
            return 0;
        });
    } else if (criteria === ORDER_BY_PROD_COUNT){
        result = array.sort(function(a, b) {
            let aCount = parseInt(a.soldCount);
            let bCount = parseInt(b.soldCount);

            if ( aCount < bCount ){ return -1; }
            if ( aCount > bCount ){ return 1; }
            return 0;
        });
    }
    return result;
}

function setCatID(id) {
    localStorage.setItem("catID", id);
     window.location = "products.html";
}

function setProdId(id) {
    localStorage.setItem("prodID", id);
     window.location = "product-info.html";
}
/*Funcion para agregar los productos en forma de div*/
function showProductList(){
    let htmlContentToAppend = "";
    for(let i = 0; i < currentProductsArray.length; i++){
        let product = currentProductsArray[i];

        if (((minCount == undefined) || (parseInt(product.soldCount) >= minCount)) &&
            ((maxCount == undefined) || (parseInt(product.soldCount) <= maxCount))){

            htmlContentToAppend += `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4" onclick="setCatID(${product.id})">
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
    document.getElementById("cat-list-container").innerHTML = htmlContentToAppend;
}

function sortAndShowProducts(sortCriteria, productsArray){
    currentSortCriteria = sortCriteria;

    if(productsArray != undefined){
        currentProductsArray = productsArray;
    }

    currentProductsArray = sortProducts(currentSortCriteria, currentProductsArray);

    showProductList();
}

/*Escuchador de eventos para cada producto*/
document.addEventListener("DOMContentLoaded", function(e){
    let catID = localStorage.getItem("catID");
    let url = PRODUCTS_URL + catID + EXT_TYPE;
    
    getJSONData(url).then(function(resultObj){
        if (resultObj.status === "ok"){
            let data = resultObj.data;
            document.getElementById("catName").innerHTML = data.catName;
            document.getElementById("catDescription").innerHTML = data.catDescription; 
            currentProductsArray = resultObj.data.products;
            sortAndShowProducts(ORDER_BY_PROD_COUNT, currentProductsArray);
        }
    });

    document.getElementById("sortAsc").addEventListener("click", function(){
        sortAndShowProducts(ORDER_ASC_BY_NAME);
    });

    document.getElementById("sortDesc").addEventListener("click", function(){
        sortAndShowProducts(ORDER_DESC_BY_NAME);
    });

    document.getElementById("sortByCount").addEventListener("click", function(){
        sortAndShowProducts(ORDER_BY_PROD_COUNT);
    });

    document.getElementById("clearRangeFilter").addEventListener("click", function(){
        document.getElementById("rangeFilterCountMin").value = "";
        document.getElementById("rangeFilterCountMax").value = "";

        minCount = undefined;
        maxCount = undefined;

        showProductList();
    });

    document.getElementById("rangeFilterCount").addEventListener("click", function(){
        minCount = document.getElementById("rangeFilterCountMin").value;
        maxCount = document.getElementById("rangeFilterCountMax").value;

        if ((minCount != undefined) && (minCount != "") && (parseInt(minCount)) >= 0){
            minCount = parseInt(minCount);
        }
        else{
            minCount = undefined;
        }

        if ((maxCount != undefined) && (maxCount != "") && (parseInt(maxCount)) >= 0){
            maxCount = parseInt(maxCount);
        }
        else{
            maxCount = undefined;
        }

        showProductList();
    });
});