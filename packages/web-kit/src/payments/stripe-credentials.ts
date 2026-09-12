// Lógica pura, sin `server-only` — separada de `stripe-provider.ts` para que
// sea testeable directamente. `server-only` lanza incondicionalmente fuera
// del pipeline de build de Next.js — mismo patrón que
// `auth-rbac/admin-credentials.ts` y `notifications/resend-credentials.ts`.
export class MissingStripeSecretKeyError extends Error {
  constructor() {
    super("Falta la variable de entorno STRIPE_SECRET_KEY. Ver .env.example.");
    this.name = "MissingStripeSecretKeyError";
  }
}

export class MissingStripeWebhookSecretError extends Error {
  constructor() {
    super("Falta la variable de entorno STRIPE_WEBHOOK_SECRET. Ver .env.example.");
    this.name = "MissingStripeWebhookSecretError";
  }
}

export function resolveStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new MissingStripeSecretKeyError();
  return key;
}

/** Se llama al importar `stripe-provider.ts` — ver acceptance #4 de E2-T5. */
export function resolveStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new MissingStripeWebhookSecretError();
  return secret;
}
