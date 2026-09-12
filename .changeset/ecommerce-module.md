---
"@mgorrin/web-kit": minor
---

Añade el módulo `ecommerce`: CRUD de `Producto`, `CartProvider`/`useCart`, `ProductGrid` (oculta la
sección completa sin productos; deshabilita "Agregar al carrito" con `inventoryCount: 0`), y
`CartSummary` — el checkout llama a `POST /api/checkout` (mismo Route Handler de `payments`, sin un
segundo camino de pago). Añade la ruta `/tienda` en `apps/template`.
