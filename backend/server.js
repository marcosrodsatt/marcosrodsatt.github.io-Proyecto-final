const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const initSqlJs = require("sql.js");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "clave-secreta-pequena";
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "ecommerce.sqlite");
const SQL_SCRIPT = path.join(__dirname, "ecommerce.sql");

let SQL = null;
let db = null;

const app = express();
app.use(cors());
app.use(express.json());

function sendJsonFile(relPath, res) {
  const filePath = path.join(DATA_DIR, relPath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "No encontré ese recurso" });
  }
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return res.json(JSON.parse(raw));
  } catch (err) {
    return res.status(500).json({ message: "Archivo JSON con problemas" });
  }
}

async function initDatabase() {
  SQL = await initSqlJs();
  await fs.promises.mkdir(DATA_DIR, { recursive: true });

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON;");

  const schema = fs.readFileSync(SQL_SCRIPT, "utf8");
  db.run(schema);
  seedFromFiles();
  persistDb();
}

function seedFromFiles() {
  try {
    const catsPath = path.join(DATA_DIR, "cats", "cat.json");
    if (!fs.existsSync(catsPath)) return;
    const cats = JSON.parse(fs.readFileSync(catsPath, "utf8"));

    const insertCat = db.prepare("INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)");
    cats.forEach((c) => insertCat.run([c.id, c.name, c.description || ""]));
    insertCat.free();

    const nameToId = new Map(cats.map((c) => [c.name, c.id]));
    const prodDir = path.join(DATA_DIR, "products");
    if (!fs.existsSync(prodDir)) return;

    const insertProd = db.prepare(
      "INSERT OR IGNORE INTO products (id, name, category_id, currency, price) VALUES (?, ?, ?, ?, ?)"
    );

    fs.readdirSync(prodDir)
      .filter((f) => f.endsWith(".json"))
      .forEach((file) => {
        const data = JSON.parse(fs.readFileSync(path.join(prodDir, file), "utf8"));
        const catId = nameToId.get(data.category) || null;
        insertProd.run([data.id, data.name || "Producto", catId, data.currency || "USD", data.cost || data.price || 0]);
      });

    insertProd.free();
  } catch (err) {
    console.warn("No pude poblar la base con los JSON locales", err);
  }
}

function persistDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return res.status(401).json({ message: "Falta el token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son obligatorios" });
  }

  const stmt = db.prepare("SELECT id, email, password, name FROM users WHERE email = $email LIMIT 1");
  stmt.bind({ $email: email });
  const hasRow = stmt.step();
  if (!hasRow) {
    stmt.free();
    return res.status(401).json({ message: "Usuario o contraseña inválidos" });
  }
  const user = stmt.getAsObject();
  stmt.free();

  if (user.password !== password) {
    return res.status(401).json({ message: "Usuario o contraseña inválidos" });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name || "Usuario" },
  });
});

app.use(authMiddleware);

app.get("/api/cats/cat.json", (req, res) => sendJsonFile(path.join("cats", "cat.json"), res));
app.get("/api/cats", (req, res) => sendJsonFile(path.join("cats", "cat.json"), res));
app.get("/api/sell/publish.json", (req, res) => sendJsonFile(path.join("sell", "publish.json"), res));

app.get("/api/cats_products/:id.json", (req, res) =>
  sendJsonFile(path.join("cats_products", `${req.params.id}.json`), res)
);

app.get("/api/products/:id.json", (req, res) =>
  sendJsonFile(path.join("products", `${req.params.id}.json`), res)
);

app.get("/api/products_comments/:id.json", (req, res) =>
  sendJsonFile(path.join("products_comments", `${req.params.id}.json`), res)
);

app.get("/api/user_cart/:id.json", (req, res) =>
  sendJsonFile(path.join("user_cart", `${req.params.id}.json`), res)
);

app.get("/api/cart/buy.json", (req, res) => res.json({ status: "ok", message: "Compra simulada" }));

app.post("/api/cart", (req, res) => {
  const { items, shipping, address } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No hay items para guardar" });
  }

  const cartStmt = db.prepare("INSERT INTO carts (user_id, shipping, address) VALUES (?, ?, ?)");
  cartStmt.run([req.user.userId, shipping || null, address ? JSON.stringify(address) : null]);
  cartStmt.free();

  const result = db.exec("SELECT last_insert_rowid() as id");
  const cartId = result?.[0]?.values?.[0]?.[0];

  const insertItem = db.prepare(
    "INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, currency, name, image) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  items.forEach((it) => {
    insertItem.run([
      cartId,
      it.id || null,
      it.count || it.quantity || 1,
      it.unitCost || it.price || 0,
      it.currency || "USD",
      it.name || "Producto",
      it.image || "",
    ]);
  });

  insertItem.free();
  persistDb();

  return res.json({ message: "Carrito guardado", cartId });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo iniciar el backend", err);
    process.exit(1);
  });
