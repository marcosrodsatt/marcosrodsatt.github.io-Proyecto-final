CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER,
  currency TEXT DEFAULT 'USD',
  price REAL DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  shipping TEXT,
  address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id INTEGER NOT NULL,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  unit_price REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  name TEXT,
  image TEXT,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO users (id, email, password, name)
VALUES (1, 'usuario@correo.com', '123456', 'Usuario de prueba');
