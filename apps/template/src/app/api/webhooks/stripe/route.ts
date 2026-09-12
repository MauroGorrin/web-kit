import { NextResponse, type NextRequest } from "next/server";
import { StripeProvider, recordCheckoutSessionCompleted } from "@mgorrin/web-kit/payments";

// Instanciado al importar el módulo — dispara la comprobación de
// credenciales de `stripe-provider.ts` en el arranque del build, no en el
// primer request. Ver acceptance #4 de E2-T5.
const provider = new StripeProvider();

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  // Stripe firma el body CRUDO — nunca el JSON re-serializado, que puede
  // diferir byte a byte del original y romper la verificación.
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ ok: false, error: { code: "BAD_SIGNATURE" } }, { status: 400 });
  }

  let event;
  try {
    event = provider.verifyWebhookSignature(rawBody, signature);
  } catch (error) {
    // Evento de seguridad — un webhook con firma inválida es la señal
    // canónica de un intento de forjar un evento de Stripe (ver CN-013 del
    // reporte Cyber Neo). Nunca loguear la firma ni el body crudo.
    console.warn("[stripe-webhook] firma inválida, evento rechazado", {
      ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown",
      error: error instanceof Error ? error.message : String(error),
    });
    // Firma inválida — 400, cero documentos escritos (acceptance #1).
    return NextResponse.json({ ok: false, error: { code: "BAD_SIGNATURE" } }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await recordCheckoutSessionCompleted(event);
  }
  // Cualquier otro tipo de evento: 200 sin procesar (acceptance #5).

  return NextResponse.json({ ok: true }, { status: 200 });
}
