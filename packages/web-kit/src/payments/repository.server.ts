// Escritor server-side de `pedidos` disparado por el webhook de Stripe — ver
// `.claude/rules/firestore.md`. Único camino de creación de un Pedido: el
// checkout de `ecommerce` (E2-T6) siempre pasa por `payments`, nunca escribe
// `pedidos` directo (acceptance #3 de E2-T6).
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../auth-rbac/firebase-admin.server.ts";
import type Stripe from "stripe";

const PEDIDOS = "pedidos";
// Stripe entrega el mismo evento más de una vez (garantía at-least-once) —
// se rastrea por `event.id` en una colección aparte, en vez de depender de
// un campo indexado en `pedidos`. Ver acceptance #2/#3 de E2-T5.
const WEBHOOK_EVENTS = "stripe_webhook_events";

/**
 * Idempotente por `event.id`: si ya se procesó, es un no-op — responde
 * normalmente (200) sin crear un segundo Pedido ni cambiar el conteo de
 * documentos.
 */
export async function recordCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
  const eventRef = adminDb.collection(WEBHOOK_EVENTS).doc(event.id);
  const existing = await eventRef.get();
  if (existing.exists) return;

  const session = event.data.object as Stripe.Checkout.Session;

  let items: unknown[] = [];
  if (session.metadata?.items) {
    try {
      items = JSON.parse(session.metadata.items);
    } catch {
      items = [];
    }
  }

  const pedido = {
    clientUid: session.client_reference_id ?? null,
    items,
    totalCents: session.amount_total ?? 0,
    shippingNote: "",
    status: "paid" as const,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    createdAt: FieldValue.serverTimestamp(),
  };

  const batch = adminDb.batch();
  batch.set(adminDb.collection(PEDIDOS).doc(), pedido);
  batch.set(eventRef, { processedAt: FieldValue.serverTimestamp() });
  await batch.commit();
}
