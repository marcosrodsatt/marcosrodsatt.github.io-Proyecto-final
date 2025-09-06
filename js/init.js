// === 🔍 BUSCADOR DE PRODUCTOS ===
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.id = "searchInput";
  searchInput.className = "form-control mb-3";
  searchInput.placeholder = "Buscar productos...";

  // insertamos el buscador antes de la lista de productos
  const container = document.getElementById("cat-list-container");
  if (container && container.parentNode) {
    container.parentNode.insertBefore(searchInput, container);
  }

  // normalizar texto (quita acentos y pasa a minúsculas)
  const normalize = (str) =>
    (str || "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  // evento input → filtrar productos
  searchInput.addEventListener("input", function (e) {
    const query = normalize(e.target.value);
    const items = document.querySelectorAll("#cat-list-container .list-group-item");

    items.forEach((item) => {
      const title = item.querySelector("h4")?.textContent || "";
      const desc = item.querySelector("p")?.textContent || "";
      const haystack = normalize(`${title} ${desc}`);

      if (query === "" || haystack.includes(query)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
});
