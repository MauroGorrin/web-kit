# ecommerce

Catálogo de productos + carrito, sobre `payments`. Flag: `modulesConfig.ecommerce`.

## Exports

| Export                                                                         | Tipo  | Notas                                                                                                                                                                    |
| ------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createProducto` / `updateProducto` / `deleteProducto` / `listProductosBySede` | valor | Único escritor de `productos`. SDK cliente — lecturas públicas (`firestore.rules`: `allow read: if true`), escrituras desde componentes `"use client"` del admin.        |
| `CartProvider` / `useCart`                                                     | valor | Contexto de carrito en memoria (no persiste entre sesiones).                                                                                                             |
| `ProductGrid`                                                                  | valor | Oculta la sección de catálogo completa sin productos; deshabilita "Agregar al carrito" con `inventoryCount: 0`.                                                          |
| `CartSummary`                                                                  | valor | El botón "Ir a pagar" llama a `POST /api/checkout` — **el mismo Route Handler de `payments`, nunca un segundo camino de pago.**                                          |
| `Producto` / `CreateProductoInput` / `UpdateProductoInput`                     | tipo  | `{ id, name, priceCents, images, sedeId, inventoryCount }`.                                                                                                              |
| `Pedido` / `PedidoItem` / `PedidoStatus`                                       | tipo  | Definidos aquí para referencia, pero **`ecommerce` nunca escribe `pedidos`** — el único escritor es `payments/repository.server.ts`, disparado por el webhook de Stripe. |
| `CartContextValue` / `CartItem` / `ProductGridProps`                           | tipo  | —                                                                                                                                                                        |

## Ruta

`apps/template/src/app/tienda/page.tsx` — lista los productos de la Sede por defecto
(`multi-location.listSedes()` + `isDefault`).

## Por qué no hay un segundo escritor de `pedidos`

`payments` (E2-T5) ya construyó el único camino de creación de un Pedido: el webhook de Stripe. Este
módulo solo necesita el checkout (`CartSummary` → `POST /api/checkout`); la confirmación del pago (y
la escritura real del Pedido) siempre pasa por ese mismo webhook, nunca por un código nuevo aquí.
