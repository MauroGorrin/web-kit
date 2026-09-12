import { NextResponse, type NextRequest } from "next/server";
import { StripeProvider, type CheckoutLineItem } from "@mgorrin/web-kit/payments";
import { getProductoById } from "@mgorrin/web-kit/ecommerce";
import { checkRateLimit, clientIpFrom } from "../../../lib/rate-limit";

interface CheckoutRequestItem {
  productoId?: string;
  quantity?: number;
}

interface CheckoutBody {
  lineItems?: CheckoutRequestItem[];
  successUrl?: string;
  cancelUrl?: string;
  clientUid?: string | null;
}

// Endpoint público sin auth por diseño (checkout de invitado) — ver CN-012
// del reporte Cyber Neo: sin límite de tasa, combinado con CN-002 era un
// vector para abusar la creación de sesiones de Stripe / probar tarjetas.
const CHECKOUT_RATE_LIMIT = { limit: 10, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`checkout:${clientIpFrom(request)}`, CHECKOUT_RATE_LIMIT);
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as CheckoutBody | null;

  if (
    !body ||
    !Array.isArray(body.lineItems) ||
    body.lineItems.length === 0 ||
    !body.successUrl ||
    !body.cancelUrl ||
    body.lineItems.some(
      (item) =>
        typeof item.productoId !== "string" ||
        item.productoId.length === 0 ||
        !Number.isInteger(item.quantity) ||
        (item.quantity ?? 0) < 1,
    )
  ) {
    return NextResponse.json({ ok: false, error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  // Nunca confiar en `name`/`priceCents` del cliente — se resuelven acá desde
  // Firestore (única fuente de verdad, ver `ecommerce/repository.ts`), nunca
  // desde lo que mande el navegador.
  const resolvedItems: CheckoutLineItem[] = [];
  for (const item of body.lineItems) {
    const producto = await getProductoById(item.productoId!);
    if (!producto) {
      return NextResponse.json({ ok: false, error: { code: "NOT_FOUND" } }, { status: 404 });
    }
    if (producto.inventoryCount < item.quantity!) {
      return NextResponse.json({ ok: false, error: { code: "OUT_OF_STOCK" } }, { status: 409 });
    }
    resolvedItems.push({
      name: producto.name,
      priceCents: producto.priceCents,
      quantity: item.quantity!,
    });
  }

  const provider = new StripeProvider();
  // `metadata.items` — el webhook lo relee para reconstruir el Pedido (ver
  // `payments/repository.server.ts`). Único camino de pago: el checkout de
  // `ecommerce` (E2-T6) llama a esta misma ruta.
  const session = await provider.createCheckoutSession({
    lineItems: resolvedItems,
    successUrl: body.successUrl,
    cancelUrl: body.cancelUrl,
    clientUid: body.clientUid ?? null,
    metadata: { items: JSON.stringify(resolvedItems) },
  });

  return NextResponse.json({ ok: true, data: { url: session.url } }, { status: 201 });
}
