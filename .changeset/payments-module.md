---
"@mgorrin/web-kit": minor
---

Añade el módulo `payments`: interfaz `PaymentProvider` y `StripeProvider` (`createCheckoutSession`,
`verifyWebhookSignature`). Añade `POST /api/checkout` y `POST /api/webhooks/stripe` en
`apps/template` — el webhook verifica la firma (`400` si es inválida, cero escrituras),
crea/actualiza un Pedido de forma idempotente por `event.id` de Stripe (rastreado en
`stripe_webhook_events`, nueva sección en `firestore.rules`), y responde `200` para eventos no
manejados.
