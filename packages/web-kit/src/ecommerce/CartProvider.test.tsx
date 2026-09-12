import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "./CartProvider.tsx";
import type { Producto } from "./types.ts";

const PRODUCTO: Producto = {
  id: "prod-1",
  name: "Producto A",
  priceCents: 1000,
  images: [],
  sedeId: "sede-1",
  inventoryCount: 5,
};

function TestConsumer() {
  const { items, addItem, removeItem, totalCents } = useCart();
  return (
    <div>
      <p data-testid="count">{items.length}</p>
      <p data-testid="total">{totalCents}</p>
      <button onClick={() => addItem(PRODUCTO)}>add</button>
      <button onClick={() => removeItem(PRODUCTO.id)}>remove</button>
    </div>
  );
}

describe("CartProvider / useCart", () => {
  it("agrega un producto y suma el total", () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("1000");
  });

  it("agregar el mismo producto dos veces incrementa la cantidad, no duplica la línea", () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("2000");
  });

  it("removeItem quita el producto del carrito", () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("remove"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("useCart lanza si se usa fuera de CartProvider", () => {
    function Broken() {
      useCart();
      return null;
    }
    expect(() => render(<Broken />)).toThrow();
  });
});
