# Acta documental

Dejé un diagrama MER sencillo para el eCommerce y un mini resumen del backend que armé.

```mermaid
erDiagram
  USERS ||--o{ CARTS : crea
  CARTS ||--o{ CART_ITEMS : incluye
  CATEGORIES ||--o{ PRODUCTS : agrupa
  PRODUCTS ||--o{ CART_ITEMS : agrega

  USERS {
    integer id PK
    string email
    string password
    string name
  }
  CATEGORIES {
    integer id PK
    string name
    string description
  }
  PRODUCTS {
    integer id PK
    string name
    string currency
    float price
    integer category_id FK
  }
  CARTS {
    integer id PK
    integer user_id FK
    string created_at
    string shipping
  }
  CART_ITEMS {
    integer id PK
    integer cart_id FK
    integer product_id FK
    integer quantity
    float unit_price
    string currency
    string name
    string image
  }
```

- El SQL que crea estas tablas está en `backend/ecommerce.sql`.
- El backend está en `backend/` con Express, usa JWT para la sesión y lee los JSON en `backend/data/`.
- Credenciales de prueba para el login: `usuario@correo.com` / `123456`.
