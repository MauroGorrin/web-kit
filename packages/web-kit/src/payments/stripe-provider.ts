// Server-only — sostiene STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET. Ver
// CLAUDE.md, límites de capas.
import "server-only";
import Stripe from "stripe";
import { resolveStripeSecretKey, resolveStripeWebhookSecret } from "./stripe-credentials.ts";
import type { CheckoutSession, CreateCheckoutSessionInput, PaymentProvider } from "./types.ts";

// Se evalúan al importar el módulo, no al primer uso — ver acceptance #4 de
// E2-T5 (mismo patrón que `firebase-admin.server.ts`/`resend-client.ts`).
const stripe = new Stripe(resolveStripeSecretKey());
const webhookSecret = resolveStripeWebhookSecret();

export class StripeProvider implements PaymentProvider {
  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: input.lineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.priceCents,
        },
        quantity: item.quantity,
      })),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.clientUid ?? undefined,
      metadata: input.metadata,
    });

    return { id: session.id, url: session.url! };
  }

  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
