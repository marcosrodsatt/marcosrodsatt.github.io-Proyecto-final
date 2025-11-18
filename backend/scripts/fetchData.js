const fs = require("fs");
const path = require("path");

const BASE_URL = "https://japceibal.github.io/emercado-api";
const DATA_DIR = path.join(__dirname, "..", "data");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function saveJson(relPath, data) {
  const fullPath = path.join(DATA_DIR, relPath);
  await ensureDir(path.dirname(fullPath));
  await fs.promises.writeFile(fullPath, JSON.stringify(data, null, 2), "utf8");
}

async function downloadJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se pudo descargar ${url}: ${res.status}`);
  }
  return res.json();
}

async function main() {
  const productIds = new Set();

  const cats = await downloadJson(`${BASE_URL}/cats/cat.json`);
  await saveJson("cats/cat.json", cats);

  const publish = await downloadJson(`${BASE_URL}/sell/publish.json`);
  await saveJson("sell/publish.json", publish);

  for (const cat of cats) {
    const catData = await downloadJson(`${BASE_URL}/cats_products/${cat.id}.json`);
    await saveJson(`cats_products/${cat.id}.json`, catData);

    if (Array.isArray(catData.products)) {
      catData.products.forEach((p) => productIds.add(p.id));
    }
  }

  for (const pid of productIds) {
    const product = await downloadJson(`${BASE_URL}/products/${pid}.json`);
    await saveJson(`products/${pid}.json`, product);

    const comments = await downloadJson(`${BASE_URL}/products_comments/${pid}.json`);
    await saveJson(`products_comments/${pid}.json`, comments);
  }

  const cart = await downloadJson(`${BASE_URL}/user_cart/25801.json`);
  await saveJson("user_cart/25801.json", cart);

  console.log("Datos descargados en /backend/data");
}

main().catch((err) => {
  console.error("Error descargando datos", err);
  process.exit(1);
});
