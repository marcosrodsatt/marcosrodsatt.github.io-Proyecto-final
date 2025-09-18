// 🚀 Obtengo el productID del localStorage
let prodId = localStorage.getItem("prodId");

// 🔄 Traigo la info del producto según el ID
document.addEventListener("DOMContentLoaded", function () {
  fetch(`https://japceibal.github.io/emercado-api/products/${prodId}.json`)
    .then(response => response.json())
    .then(product => {
      document.getElementById("productName").innerText = product.name;
      document.getElementById("productImage").src = product.images[0];
      document.getElementById("productDescription").innerText = product.description;
      document.getElementById("productCost").innerText = `${product.currency} ${product.cost}`;
      document.getElementById("productSold").innerText = `${product.soldCount} vendidos`;
    });
});
