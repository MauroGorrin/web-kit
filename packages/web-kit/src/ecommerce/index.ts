// Allowlist del módulo ecommerce — no un barrel.
export type {
  CreateProductoInput,
  Pedido,
  PedidoItem,
  PedidoStatus,
  Producto,
  UpdateProductoInput,
} from "./types.ts";
export {
  createProducto,
  deleteProducto,
  getProductoById,
  listProductosBySede,
  updateProducto,
} from "./repository.ts";
export { CartProvider, useCart, type CartContextValue, type CartItem } from "./CartProvider.tsx";
export { ProductGrid, type ProductGridProps } from "./ProductGrid.tsx";
export { CartSummary } from "./CartSummary.tsx";
