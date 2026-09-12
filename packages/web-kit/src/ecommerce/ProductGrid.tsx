"use client";

import { Button, Card } from "../design-system/index.ts";
import { useCart } from "./CartProvider.tsx";
import type { Producto } from "./types.ts";

export interface ProductGridProps {
  productos: Producto[];
}

/** Sin ningún Producto THE SYSTEM SHALL ocultar la sección completa — ver acceptance #4 de E2-T6. */
export function ProductGrid({ productos }: ProductGridProps) {
  const { addItem } = useCart();

  if (productos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {productos.map((producto) => (
        <Card key={producto.id}>
          <h3 className="mb-1 font-semibold">{producto.name}</h3>
          <p className="mb-3 opacity-70">${(producto.priceCents / 100).toFixed(2)}</p>
          {/* inventoryCount: 0 deshabilita el botón — acceptance #2 de E2-T6. */}
          <Button onClick={() => addItem(producto)} disabled={producto.inventoryCount === 0}>
            Agregar al carrito
          </Button>
        </Card>
      ))}
    </div>
  );
}
