import type Stripe from "stripe";

export interface CheckoutLineItem {
  name: string;
  priceCents: number;
  quantity: number;
}

export interface CreateCheckoutSessionInput {
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  clientUid?: string | null;
  /** Se adjunta a la Checkout Session — `payments` lo relee en el webhook. */
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * Contrato consumido por `03-integracion-y-release` (nav condicional) y por
 * `ecommerce` (E2-T6) — ver blueprint §"Contratos".
 */
export interface PaymentProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession>;
  /** Lanza si la firma es inválida — nunca retorna un evento no verificado. */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event;
}
