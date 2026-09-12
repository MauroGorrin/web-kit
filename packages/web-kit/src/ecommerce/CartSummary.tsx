"use client";

import { Button, Card } from "../design-system/index.ts";
import { useCart } from "./CartProvider.tsx";

/**
 * El checkout llama a `POST /api/checkout` — el mismo Route Handler que ya
 * construyó `payments` (E2-T5). Nunca un segundo camino de pago. Ver
 * acceptance #3 de E2-T6.
 */
export function CartSummary() {
  const { items, totalCents } = useCart();

  async function handleCheckout() {
    const lineItems = items.map((item) => ({
      name: item.producto.name,
      priceCents: item.producto.priceCents,
      quantity: item.quantity,
    }));

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineItems,
        successUrl: `${window.location.origin}/tienda?checkout=success`,
        cancelUrl: `${window.location.origin}/tienda?checkout=cancel`,
      }),
    });
    const body = await response.json();
    if (body.ok) window.location.href = body.data.url;
  }

  if (items.length === 0) return null;

  return (
    <Card>
      <p data-testid="cart-count">{items.length} producto(s) en el carrito</p>
      <p className="mb-3">Total: ${(totalCents / 100).toFixed(2)}</p>
      <Button onClick={handleCheckout}>Ir a pagar</Button>
    </Card>
  );
}
