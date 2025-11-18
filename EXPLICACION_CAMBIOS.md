# Explicación paso a paso (hablando fácil)

Hola! Dejo anotado todo lo que hice, dónde quedó cada cosa y cómo se usa. La idea es que cualquiera pueda seguirlo sin enredarse.

## Estructura nueva
- `backend/`: carpeta nueva con el servidor Node + datos locales.
  - `server.js`: servidor Express con rutas, login y middleware JWT.
  - `package.json` / `package-lock.json`: dependencias (`express`, `cors`, `jsonwebtoken`, `sql.js`).
  - `data/`: todos los JSON descargados (categorías, productos, comentarios, carrito, etc.) y la base `ecommerce.sqlite`.
  - `scripts/fetchData.js`: script para volver a bajar los JSON del repositorio público.
  - `ecommerce.sql`: script SQL para crear las tablas (users, categories, products, carts, cart_items).
- `ACTA_DOCUMENTAL.md`: acta con el diagrama MER en mermaid.
- `js/init.js`: ahora apunta al backend local y mete el token en los fetch.
- `js/login.js`: hace el POST `/api/login` y guarda `user` + `token`.
- `js/cart.js`: manda el carrito al backend con POST `/api/cart`.
- `.gitignore`: ignora `backend/node_modules`.

## Cómo correr el backend
1) Abrir terminal en `backend/`.
2) Instalar (solo la primera vez): `npm install`
3) Levantar: `npm start`
4) El servidor queda en `http://localhost:3000`

## Login de prueba
- Usuario: `usuario@correo.com`
- Contraseña: `123456`

## Rutas principales del backend (`backend/server.js`)
- `POST /api/login`: recibe `{ email, password }`. Si es válido, devuelve `{ token, user }`.
- Middleware de autorización: todo lo que sigue requiere header `Authorization: Bearer <token>`.
- `GET /api/cats/cat.json`
- `GET /api/cats_products/:id.json`
- `GET /api/products/:id.json`
- `GET /api/products_comments/:id.json`
- `GET /api/user_cart/:id.json`
- `GET /api/cart/buy.json` (simulado)
- `POST /api/cart`: guarda carrito en tabla `carts` y `cart_items`.

## Datos locales
Están en `backend/data/`. Ejemplos:
- Categorías: `backend/data/cats/cat.json`
- Productos: `backend/data/products/<id>.json`
- Comentarios: `backend/data/products_comments/<id>.json`
- Carrito de ejemplo: `backend/data/user_cart/25801.json`
- Base SQLite que se genera/persiste: `backend/data/ecommerce.sqlite`

Para regenerar los JSON: `cd backend && npm run fetch:data`

## Base de datos (SQL)
Archivo: `backend/ecommerce.sql`
- Tablas: `users`, `categories`, `products`, `carts`, `cart_items`.
- Usuario de prueba insertado en la tabla `users` (mismo del login de arriba).
- Si el `server.js` no ve la base, crea la DB en memoria, corre el SQL y la guarda en `backend/data/ecommerce.sqlite`. También carga categorías y productos leyendo los JSON para tener ids/nombres en la tabla.

## Cambios en frontend
- `js/init.js`:
  - URLs ahora usan `http://localhost:3000/api/...`.
  - `getJSONData` agrega el token en el header.
  - Si falta sesión o token, te manda a login.
- `js/login.js`:
  - Manda POST a `/api/login`.
  - Guarda `sessionStorage.user` y `sessionStorage.token`.
  - Redirige a `index.html` si todo va bien.
- `js/cart.js`:
  - Agrega `sendCartToBackend` que hace POST `/api/cart` con items, envío y dirección.
  - En `initPurchase`, después de validar, se llama a ese endpoint y si responde ok se limpia el carrito.

## Diagrama MER (en `ACTA_DOCUMENTAL.md`)
- Usuarios -> Carts -> Cart_items
- Categorías -> Productos -> Cart_items
- Incluye campos: email/password en users, price/currency en products, shipping/address en carts.

## Pasos para probar todo
1) `cd backend`
2) `npm install` (solo primera vez)
3) `npm start` (dejarlo corriendo)
4) Abrir `login.html` en el navegador (desde la carpeta raíz del proyecto).
5) Ingresar con `usuario@correo.com` / `123456`
6) Navegar al sitio; ya apunta al backend local para categorías, productos, etc.
7) En el carrito, probar compra: valida datos y hace POST `/api/cart`.

## Notas rápidas
- Token se guarda en `sessionStorage.token`.
- Si te quedas sin token, refrescar pedirá login de nuevo.
- No se usó hashing por simplicidad (clave en texto plano).
- El endpoint `/api/cart/buy.json` sólo devuelve un OK simulado, el guardado real está en `POST /cart`.

Listo, cualquier cosa me decís y lo ajusto. :)
