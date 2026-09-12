import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartProvider } from "./CartProvider.tsx";
import { ProductGrid } from "./ProductGrid.tsx";
import type { Producto } from "./types.ts";

function makeProducto(overrides: Partial<Producto> = {}): Producto {
  return {
    id: "prod-1",
    name: "Producto A",
    priceCents: 1000,
    images: [],
    sedeId: "sede-1",
    inventoryCount: 5,
    ...overrides,
  };
}

describe("ProductGrid", () => {
  it("no renderiza nada cuando no hay productos — oculta la sección completa", () => {
    const { container } = render(
      <CartProvider>
        <ProductGrid productos={[]} />
      </CartProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("deshabilita el botón cuando inventoryCount es 0", () => {
    render(
      <CartProvider>
        <ProductGrid productos={[makeProducto({ inventoryCount: 0 })]} />
      </CartProvider>,
    );
    expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeDisabled();
  });

  it("habilita el botón cuando hay inventario", () => {
    render(
      <CartProvider>
        <ProductGrid productos={[makeProducto({ inventoryCount: 3 })]} />
      </CartProvider>,
    );
    expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeEnabled();
  });
});
