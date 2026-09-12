# payments

Checkout y webhook de Stripe. Flag: `modulesConfig.payments`.

## Exports — raíz y subpath

| Export                                                                | Tipo  | Notas                                                                                                                                                                                                   |
| --------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MissingStripeSecretKeyError` / `MissingStripeWebhookSecretError`     | valor | Lanzados al importar `stripe-provider.ts` si faltan `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` — esto hace fallar el **build** (`pnpm --filter template build`) en vez de fallar en el primer request. |
| `CheckoutLineItem` / `CheckoutSession` / `CreateCheckoutSessionInput` | tipo  | —                                                                                                                                                                                                       |
| `PaymentProvider`                                                     | tipo  | Interfaz `{ createCheckoutSession(input), verifyWebhookSignature(payload, signature) }` — contrato consumido por `03-integracion-y-release` y por `ecommerce`.                                          |

## Exports — **solo subpath**, server-only

| Export                                  | Notas                                                                                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StripeProvider`                        | Implementa `PaymentProvider`. `verifyWebhookSignature` lanza si la firma es inválida — nunca retorna un evento no verificado.                                                                                                               |
| `recordCheckoutSessionCompleted(event)` | **Idempotente por `event.id`** — Stripe puede reentregar el mismo evento (garantía at-least-once); se rastrea en la colección `stripe_webhook_events` (doc id = `event.id`) para no crear un Pedido duplicado. Único escritor de `pedidos`. |

## Rutas

- `POST /api/checkout` — crea la Checkout Session; `metadata.items` lleva el carrito serializado
  para que el webhook lo reconstruya.
- `POST /api/webhooks/stripe` — firma inválida → `400`, cero escrituras; `checkout.session.completed`
  → `recordCheckoutSessionCompleted`; cualquier otro tipo de evento → `200` sin procesar.

## Reglas de Firestore (`stripe_webhook_events`)

```
match /stripe_webhook_events/{eventId} {
  allow read, write: if false;
}
```

Solo lo toca el webhook vía SDK admin (bypassa la regla) — nunca leído/escrito desde un cliente.
