// Ver blueprint §8 (modelo de datos) — colecciones `productos`/`pedidos`,
// activas solo si el módulo `ecommerce` está encendido.
export interface Producto {
  id: string;
  name: string;
  priceCents: number;
  images: string[];
  sedeId: string;
  inventoryCount: number;
}

export type CreateProductoInput = Omit<Producto, "id">;
export type UpdateProductoInput = Partial<Omit<Producto, "id">>;

export type PedidoStatus = "pending" | "paid" | "cancelled";

export interface PedidoItem {
  productoId: string;
  quantity: number;
  priceCents: number;
}

export interface Pedido {
  id: string;
  clientUid: string;
  items: PedidoItem[];
  totalCents: number;
  shippingNote: string;
  status: PedidoStatus;
  stripePaymentIntentId: string | null;
  createdAt: Date;
}
