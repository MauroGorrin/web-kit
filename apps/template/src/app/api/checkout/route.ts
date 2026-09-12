import { NextResponse, type NextRequest } from "next/server";
import { StripeProvider, type CheckoutLineItem } from "@mgorrin/web-kit/payments";

interface CheckoutBody {
  lineItems?: CheckoutLineItem[];
  successUrl?: string;
  cancelUrl?: string;
  clientUid?: string | null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CheckoutBody | null;

  if (
    !body ||
    !Array.isArray(body.lineItems) ||
    body.lineItems.length === 0 ||
    !body.successUrl ||
    !body.cancelUrl
  ) {
    return NextResponse.json({ ok: false, error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  const provider = new StripeProvider();
  // `metadata.items` — el webhook lo relee para reconstruir el Pedido (ver
  // `payments/repository.server.ts`). Único camino de pago: el checkout de
  // `ecommerce` (E2-T6) llama a esta misma ruta.
  const session = await provider.createCheckoutSession({
    lineItems: body.lineItems,
    successUrl: body.successUrl,
    cancelUrl: body.cancelUrl,
    clientUid: body.clientUid ?? null,
    metadata: { items: JSON.stringify(body.lineItems) },
  });

  return NextResponse.json({ ok: true, data: { url: session.url } }, { status: 201 });
}
